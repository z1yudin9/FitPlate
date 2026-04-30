import "dotenv/config";
import express from "express";
import multer from "multer";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const visionModel = process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini";
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const recognitionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    foods: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          food_name: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          estimated_grams: { type: "number", minimum: 1 },
          requires_confirmation: { type: "boolean" }
        },
        required: ["food_name", "confidence", "estimated_grams", "requires_confirmation"]
      }
    }
  },
  required: ["foods"]
};

function imageDataUrl(file) {
  const mime = file.mimetype || "image/jpeg";
  return `data:${mime};base64,${file.buffer.toString("base64")}`;
}

function parseResponseJson(response) {
  const text = response.output_text || "";
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("OpenAI response did not contain JSON");
    return JSON.parse(match[0]);
  }
}

function normalizeRecognizedFoods(payload) {
  return (payload.foods || []).map((food) => ({
    foodName: food.food_name,
    confidence: Number(food.confidence || 0),
    estimatedGrams: Math.max(1, Math.round(Number(food.estimated_grams || 100))),
    requiresConfirmation: Boolean(food.requires_confirmation || Number(food.confidence || 0) < 0.7)
  }));
}

app.post("/api/recognize", upload.single("image"), async (req, res) => {
  try {
    if (!openai) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
    }
    if (!req.file) return res.status(400).json({ error: "Image file is required." });

    const response = await openai.responses.create({
      model: visionModel,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Identify edible food items visible in this image. Return only likely food candidates, not nutrition facts. " +
                "Estimate grams conservatively. Set requires_confirmation true when the item is ambiguous, partially hidden, mixed, or confidence is below 0.7."
            },
            { type: "input_image", image_url: imageDataUrl(req.file), detail: "low" }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "food_recognition",
          schema: recognitionSchema,
          strict: true
        }
      }
    });

    res.json({ foods: normalizeRecognizedFoods(parseResponseJson(response)) });
  } catch (error) {
    const status = error.status || error.code;
    if (status === 401 || String(error.message || "").includes("Incorrect API key")) {
      return res.status(401).json({
        error: "OpenAI API key 无效。请检查项目根目录 .env 中的 OPENAI_API_KEY，重启 npm start 后再试。"
      });
    }
    res.status(500).json({ error: error.message || "Food recognition failed." });
  }
});

function nutrientMapFromUsda(food) {
  const nutrients = food.foodNutrients || [];
  const find = (...names) => {
    const nutrient = nutrients.find((item) => names.some((name) => String(item.nutrientName || "").toLowerCase().includes(name)));
    return Number(nutrient?.value || 0);
  };
  const calories = find("energy") || 0;
  const protein = find("protein");
  const fat = find("total lipid", "fat");
  const carbohydrate = find("carbohydrate");
  if (!calories && !protein && !fat && !carbohydrate) return null;
  return {
    source: "USDA FoodData Central",
    foodName: food.description || food.lowercaseDescription || "USDA food",
    brand: food.brandName || food.brandOwner || "",
    per100g: {
      calories: Math.round(calories),
      protein: roundMacro(protein),
      fat: roundMacro(fat),
      carbohydrate: roundMacro(carbohydrate)
    }
  };
}

function normalizeOpenFoodFacts(product) {
  const n = product.nutriments || {};
  const calories =
    Number(n["energy-kcal_100g"]) ||
    Number(n["energy-kcal"]) ||
    (Number(n.energy_100g) ? Number(n.energy_100g) / 4.184 : 0);
  if (!calories) return null;
  return {
    source: "Open Food Facts",
    foodName: product.product_name || product.generic_name || product.brands || "Open Food Facts item",
    brand: product.brands || "",
    per100g: {
      calories: Math.round(calories),
      protein: roundMacro(Number(n.proteins_100g || 0)),
      fat: roundMacro(Number(n.fat_100g || 0)),
      carbohydrate: roundMacro(Number(n.carbohydrates_100g || 0))
    }
  };
}

function roundMacro(value) {
  return Number(Number(value || 0).toFixed(1));
}

function calculateForGrams(per100g, grams) {
  const ratio = Number(grams || 0) / 100;
  return {
    calories: Math.round(per100g.calories * ratio),
    protein: roundMacro(per100g.protein * ratio),
    fat: roundMacro(per100g.fat * ratio),
    carbohydrate: roundMacro(per100g.carbohydrate * ratio)
  };
}

async function searchUsda(query) {
  if (!process.env.USDA_API_KEY) return [];
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("api_key", process.env.USDA_API_KEY);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", "8");
  url.searchParams.set("dataType", "Foundation,SR Legacy,Survey (FNDDS),Branded");
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.foods || []).map(nutrientMapFromUsda).filter(Boolean);
}

async function searchOpenFoodFacts(query) {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "8");
  url.searchParams.set("fields", "product_name,generic_name,brands,nutriments");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open Food Facts lookup failed with ${response.status}`);
  const data = await response.json();
  return (data.products || []).map(normalizeOpenFoodFacts).filter(Boolean);
}

async function lookupNutritionCandidates(foodName) {
  const usda = await searchUsda(foodName);
  if (usda.length) return { provider: "USDA FoodData Central", candidates: usda };
  const off = await searchOpenFoodFacts(foodName);
  return { provider: "Open Food Facts", candidates: off };
}

app.post("/api/nutrition", async (req, res) => {
  try {
    const foodName = String(req.body.foodName || "").trim();
    const grams = Number(req.body.grams || 100);
    if (!foodName) return res.status(400).json({ error: "foodName is required." });
    if (!Number.isFinite(grams) || grams <= 0) return res.status(400).json({ error: "grams must be a positive number." });

    const { provider, candidates } = await lookupNutritionCandidates(foodName);
    if (!candidates.length) return res.status(404).json({ error: "No nutrition data found from USDA or Open Food Facts." });

    res.json({
      provider,
      grams,
      candidates: candidates.map((candidate) => ({
        ...candidate,
        total: calculateForGrams(candidate.per100g, grams)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Nutrition lookup failed." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    usdaConfigured: Boolean(process.env.USDA_API_KEY)
  });
});

app.listen(port, () => {
  console.log(`FitPlate nutrition recognition server running at http://localhost:${port}`);
});
