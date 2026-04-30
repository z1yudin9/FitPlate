import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

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
    recognition: "free-browser-cv",
    usdaConfigured: Boolean(process.env.USDA_API_KEY)
  });
});

app.listen(port, () => {
  console.log(`FitPlate nutrition app running at http://localhost:${port}`);
});
