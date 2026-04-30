const storageKey = "fitplate-state-v2";

const foodLibrary = [
  { name: "鸡胸肉糙米饭", per100: { calories: 160, protein: 12.8, carbs: 17.7, fat: 3.7 }, keywords: ["鸡胸", "鸡肉", "糙米", "米饭", "chicken", "rice"] },
  { name: "三文鱼藜麦碗", per100: { calories: 191, protein: 11.9, carbs: 14.4, fat: 8.8 }, keywords: ["三文鱼", "鲑鱼", "藜麦", "salmon", "quinoa", "fish"] },
  { name: "牛肉全麦卷", per100: { calories: 186, protein: 12.1, carbs: 19.3, fat: 6.4 }, keywords: ["牛肉", "卷饼", "全麦", "beef", "wrap", "burrito"] },
  { name: "希腊酸奶燕麦", per100: { calories: 150, protein: 9.2, carbs: 18.5, fat: 3.8 }, keywords: ["酸奶", "燕麦", "蓝莓", "yogurt", "oat", "granola"] },
  { name: "鸡蛋牛油果吐司", per100: { calories: 187, protein: 9.6, carbs: 15.7, fat: 9.6 }, keywords: ["鸡蛋", "牛油果", "吐司", "egg", "avocado", "toast"] },
  { name: "豆腐蔬菜荞麦面", per100: { calories: 139, protein: 7.2, carbs: 19.4, fat: 3.3 }, keywords: ["豆腐", "蔬菜", "荞麦", "面", "tofu", "noodle", "vegetable"] },
  { name: "虾仁杂粮沙拉", per100: { calories: 140, protein: 11, carbs: 13.3, fat: 4.7 }, keywords: ["虾", "沙拉", "杂粮", "shrimp", "salad"] },
  { name: "香蕉乳清奶昔", per100: { calories: 86, protein: 7.4, carbs: 11.4, fat: 1.4 }, keywords: ["香蕉", "乳清", "奶昔", "banana", "shake", "smoothie"] },
  { name: "番茄鸡蛋盖饭", per100: { calories: 163, protein: 6.3, carbs: 23.2, fat: 4.7 }, keywords: ["番茄", "西红柿", "鸡蛋", "米饭", "tomato", "egg", "rice"] },
  { name: "清炒时蔬米饭", per100: { calories: 130, protein: 3.6, carbs: 21.8, fat: 3 }, keywords: ["蔬菜", "青菜", "米饭", "rice", "vegetable", "greens"] },
  { name: "牛奶全麦面包", per100: { calories: 158, protein: 7.7, carbs: 22.3, fat: 4.2 }, keywords: ["牛奶", "面包", "全麦", "milk", "bread"] },
  { name: "水煮蛋", per100: { calories: 155, protein: 13, carbs: 1.1, fat: 10.6 }, keywords: ["水煮蛋", "鸡蛋", "boiled egg", "egg"] },
  { name: "苹果", per100: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2 }, keywords: ["苹果", "apple"] },
  { name: "香蕉", per100: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 }, keywords: ["香蕉", "banana"] },
  { name: "意面番茄肉酱", per100: { calories: 168, protein: 7.1, carbs: 25, fat: 4.5 }, keywords: ["意面", "意大利面", "番茄", "pasta", "spaghetti"] },
  { name: "汉堡", per100: { calories: 295, protein: 15, carbs: 25, fat: 14 }, keywords: ["汉堡", "burger", "cheeseburger"] },
  { name: "披萨", per100: { calories: 266, protein: 11, carbs: 33, fat: 10 }, keywords: ["披萨", "pizza"] },
  { name: "寿司", per100: { calories: 143, protein: 5.8, carbs: 28, fat: 0.8 }, keywords: ["寿司", "sushi"] },
  { name: "白米饭", per100: { calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3 }, keywords: ["米饭", "白饭", "rice"] },
  { name: "馒头", per100: { calories: 223, protein: 7, carbs: 47, fat: 1.1 }, keywords: ["馒头", "mantou", "steamed bun"] },
  { name: "面条", per100: { calories: 137, protein: 4.5, carbs: 25, fat: 2.1 }, keywords: ["面条", "noodle"] },
  { name: "红薯", per100: { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1 }, keywords: ["红薯", "地瓜", "sweet potato"] },
  { name: "土豆", per100: { calories: 77, protein: 2, carbs: 17, fat: 0.1 }, keywords: ["土豆", "马铃薯", "potato"] },
  { name: "玉米", per100: { calories: 96, protein: 3.4, carbs: 21, fat: 1.5 }, keywords: ["玉米", "corn"] },
  { name: "燕麦片", per100: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 }, keywords: ["燕麦", "oat", "oatmeal"] },
  { name: "鸡腿肉", per100: { calories: 181, protein: 24, carbs: 0, fat: 9 }, keywords: ["鸡腿", "鸡肉", "chicken thigh"] },
  { name: "瘦牛肉", per100: { calories: 250, protein: 26, carbs: 0, fat: 15 }, keywords: ["牛肉", "beef"] },
  { name: "猪里脊", per100: { calories: 143, protein: 21, carbs: 0, fat: 6 }, keywords: ["猪肉", "里脊", "pork"] },
  { name: "虾仁", per100: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3 }, keywords: ["虾仁", "虾", "shrimp"] },
  { name: "豆腐", per100: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 }, keywords: ["豆腐", "tofu"] },
  { name: "西兰花", per100: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4 }, keywords: ["西兰花", "broccoli"] },
  { name: "菠菜", per100: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 }, keywords: ["菠菜", "spinach"] },
  { name: "牛奶", per100: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 }, keywords: ["牛奶", "milk"] },
  { name: "无糖酸奶", per100: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 }, keywords: ["酸奶", "yogurt"] },
  { name: "花生酱", per100: { calories: 588, protein: 25, carbs: 20, fat: 50 }, keywords: ["花生酱", "peanut butter"] },
  { name: "杏仁", per100: { calories: 579, protein: 21, carbs: 22, fat: 50 }, keywords: ["杏仁", "almond"] },
  { name: "橙子", per100: { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1 }, keywords: ["橙子", "orange"] }
];

const mealNames = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };
const viewTitles = {
  dashboard: "今日营养仪表盘",
  profile: "身体状况与目标分析",
  plan: "每日食谱制定",
  log: "饮食记录",
  summary: "目标达成总结"
};

const defaultState = {
  profile: { sex: "", age: "", height: "", weight: "", activity: "", goal: "", intensity: "standard" },
  logs: {},
  planSeed: 0
};

let state = loadState();
let visionModelPromise = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved ? { ...defaultState, ...saved, profile: { ...defaultState.profile, ...saved.profile } } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function todayKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function isProfileComplete(profile = state.profile) {
  return profile.sex && profile.age && profile.height && profile.weight && profile.activity && profile.goal;
}

function calculateTargets(profile = state.profile) {
  if (!isProfileComplete(profile)) return null;
  const age = Number(profile.age);
  const height = Number(profile.height);
  const weight = Number(profile.weight);
  const activity = Number(profile.activity);
  const bmr = profile.sex === "male" ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
  const maintenance = bmr * activity;
  const adjustments = {
    fatLoss: { gentle: -250, standard: -450, aggressive: -650 },
    muscleGain: { gentle: 180, standard: 320, aggressive: 480 },
    maintain: { gentle: 0, standard: 0, aggressive: 0 }
  };
  const intensity = profile.intensity || "standard";
  const calories = Math.max(1200, maintenance + adjustments[profile.goal][intensity]);
  const proteinRate = profile.goal === "muscleGain" ? 2 : profile.goal === "fatLoss" ? 1.8 : 1.6;
  const protein = weight * proteinRate;
  const fat = (calories * (profile.goal === "fatLoss" ? 0.25 : 0.28)) / 9;
  const carbs = Math.max(80, (calories - protein * 4 - fat * 9) / 4);
  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
}

function getTodayLogs() {
  return state.logs[todayKey()] || [];
}

function sumLogs(logs) {
  return logs.reduce(
    (total, item) => ({
      calories: total.calories + Number(item.calories || 0),
      protein: total.protein + Number(item.protein || 0),
      carbs: total.carbs + Number(item.carbs || 0),
      fat: total.fat + Number(item.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function formatNumber(value) {
  return Math.round(Number(value || 0)).toLocaleString("zh-CN");
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function goalLabel(goal = state.profile.goal) {
  return { fatLoss: "减脂", muscleGain: "增肌", maintain: "维持" }[goal] || "待设置";
}

function macroStatus(actual, target) {
  const ratio = target ? actual / target : 0;
  if (ratio < 0.75) return "待补足";
  if (ratio <= 1.08) return "很接近";
  return "已超出";
}

function setView(view) {
  document.querySelectorAll(".view").forEach((node) => node.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach((node) => node.classList.remove("active"));
  document.getElementById(`${view}View`).classList.add("active");
  document.querySelector(`[data-view="${view}"]`).classList.add("active");
  document.getElementById("viewTitle").textContent = viewTitles[view];
  document.getElementById("quickAddButton").hidden = view !== "dashboard";
}

function renderDashboard() {
  const targets = calculateTargets();
  const logs = getTodayLogs();
  const totals = sumLogs(logs);

  document.getElementById("sidebarGoal").textContent = goalLabel();
  document.getElementById("sidebarCalories").textContent = targets ? `${formatNumber(targets.calories)} kcal / 日` : "先填写目标";
  document.getElementById("consumedCalories").textContent = formatNumber(totals.calories);
  document.getElementById("remainingCalories").textContent = targets ? formatNumber(targets.calories - totals.calories) : "--";
  document.getElementById("bmrValue").textContent = targets ? formatNumber(targets.bmr) : "--";
  document.getElementById("targetCalories").textContent = targets ? formatNumber(targets.calories) : "--";
  document.getElementById("todayScore").textContent = targets ? scoreLabel(totals, targets) : "待设置";

  renderMacroBars(totals, targets);
  renderMeals("todayMeals", logs, false);
  renderMeals("logMeals", logs, true);
  renderPlan();
  renderSummary();
}

function scoreLabel(totals, targets) {
  const calorieRatio = totals.calories / targets.calories;
  const proteinRatio = totals.protein / targets.protein;
  if (!totals.calories) return "未开始";
  if (calorieRatio >= 0.9 && calorieRatio <= 1.08 && proteinRatio >= 0.85) return "优秀";
  if (calorieRatio <= 1.18 && proteinRatio >= 0.7) return "接近目标";
  return calorieRatio > 1.18 ? "热量偏高" : "还需补充";
}

function renderMacroBars(totals, targets) {
  const container = document.getElementById("macroBars");
  if (!targets) {
    container.innerHTML = `<div class="empty-state">请先在“目标”中填写身体信息和健身目标，系统会自动计算每日热量与营养计划。</div>`;
    return;
  }
  const macros = [
    ["calories", "热量", totals.calories, targets.calories, "kcal"],
    ["protein", "蛋白质", totals.protein, targets.protein, "g"],
    ["carbs", "碳水", totals.carbs, targets.carbs, "g"],
    ["fat", "脂肪", totals.fat, targets.fat, "g"]
  ];
  container.innerHTML = macros
    .map(([key, label, actual, target, unit]) => {
      const width = Math.min(120, Math.round((actual / target) * 100 || 0));
      return `
        <div class="bar-line">
          <div class="bar-meta">
            <span>${label}</span>
            <span>${formatNumber(actual)} / ${formatNumber(target)} ${unit} · ${macroStatus(actual, target)}</span>
          </div>
          <div class="bar-track"><div class="bar-fill ${key}" style="width:${width}%"></div></div>
        </div>
      `;
    })
    .join("");
}

function renderMeals(containerId, logs, detailed) {
  const container = document.getElementById(containerId);
  if (!logs.length) {
    container.innerHTML = `<div class="empty-state">今天还没有饮食记录。</div>`;
    return;
  }
  container.innerHTML = logs
    .map(
      (item) => `
      <article class="meal-item">
        <div>
          <div class="meal-main">
            <strong>${item.name}</strong>
            <span class="meal-calories">${formatNumber(item.calories)} kcal</span>
          </div>
          <div class="meal-meta">${mealNames[item.meal]} · ${item.grams}g · 蛋白 ${item.protein}g · 碳水 ${item.carbs}g · 脂肪 ${item.fat}g</div>
        </div>
        ${detailed ? `<button class="delete-button" type="button" data-delete="${item.id}" aria-label="删除">×</button>` : ""}
      </article>
    `
    )
    .join("");
}

function renderPlan() {
  const targets = calculateTargets();
  const summary = document.getElementById("planSummary");
  const grid = document.getElementById("recipeGrid");
  if (!targets) {
    summary.innerHTML = `<div class="empty-state">先填写“目标”，这里会生成对应的每日摄入计划。</div>`;
    grid.innerHTML = "";
    return;
  }
  const meals = buildPlan(targets);
  summary.innerHTML = [
    ["热量", `${formatNumber(targets.calories)} kcal`],
    ["蛋白质", `${formatNumber(targets.protein)} g`],
    ["碳水", `${formatNumber(targets.carbs)} g`],
    ["脂肪", `${formatNumber(targets.fat)} g`]
  ]
    .map(([label, value]) => `<div class="plan-chip"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  grid.innerHTML = meals
    .map(
      (meal) => `
      <article class="recipe-card">
        <div class="recipe-art">${meal.icon}</div>
        <div class="recipe-body">
          <small>${mealNames[meal.meal]}</small>
          <h4>${meal.title}</h4>
          <small>${meal.calories} kcal · 蛋白 ${meal.protein}g · 碳水 ${meal.carbs}g · 脂肪 ${meal.fat}g</small>
          <button class="ghost-button add-plan-meal" type="button" data-plan="${meal.title}">加入记录</button>
        </div>
      </article>
    `
    )
    .join("");
}

function buildPlan(targets) {
  const templates = [
    ["breakfast", "希腊酸奶燕麦", "◧", 0.24, 0.23, 0.28, 0.18],
    ["lunch", "鸡胸肉糙米饭", "◩", 0.34, 0.36, 0.36, 0.28],
    ["dinner", "三文鱼藜麦碗", "◪", 0.32, 0.31, 0.26, 0.42],
    ["snack", "香蕉乳清奶昔", "◫", 0.1, 0.1, 0.1, 0.12]
  ];
  const rotated = templates.slice(state.planSeed % templates.length).concat(templates.slice(0, state.planSeed % templates.length));
  return rotated.map(([meal, title, icon, calorieRatio, proteinRatio, carbRatio, fatRatio]) => ({
    meal,
    title,
    icon,
    calories: Math.round(targets.calories * calorieRatio),
    protein: Math.round(targets.protein * proteinRatio),
    carbs: Math.round(targets.carbs * carbRatio),
    fat: Math.round(targets.fat * fatRatio)
  }));
}

function renderSummary() {
  const targets = calculateTargets();
  if (!targets) {
    document.getElementById("dailySummary").innerHTML = `<span>填写目标后，这里会显示每日达成反馈。</span>`;
    document.getElementById("weeklySummary").innerHTML = `<span>有饮食记录后，这里会显示近 7 天趋势。</span>`;
    document.getElementById("weekChart").innerHTML = "";
    return;
  }
  const todayTotals = sumLogs(getTodayLogs());
  const gap = targets.calories - todayTotals.calories;
  const dailyTone =
    Math.abs(gap) <= targets.calories * 0.08
      ? "热量控制很贴近计划。"
      : gap > 0
        ? `还可以补充约 ${formatNumber(gap)} kcal。`
        : `今天超出约 ${formatNumber(Math.abs(gap))} kcal。`;
  const proteinTone =
    todayTotals.protein >= targets.protein * 0.9
      ? "蛋白质达成度不错。"
      : `蛋白质还差约 ${formatNumber(targets.protein - todayTotals.protein)}g。`;
  document.getElementById("dailySummary").innerHTML = `
    <strong>${scoreLabel(todayTotals, targets)}</strong>
    <span>${dailyTone} ${proteinTone}</span>
    <span>建议下一餐优先调整最偏离的宏量营养素，而不是只看总热量。</span>
  `;

  const week = Array.from({ length: 7 }, (_, index) => {
    const offset = index - 6;
    const key = todayKey(offset);
    return { key, logs: state.logs[key] || [], label: offset === 0 ? "今" : `${Math.abs(offset)}天前` };
  });
  const weeklyTotals = week.map((day) => sumLogs(day.logs));
  const avgCalories = weeklyTotals.reduce((sum, day) => sum + day.calories, 0) / 7;
  const hitDays = weeklyTotals.filter((day) => day.calories >= targets.calories * 0.9 && day.calories <= targets.calories * 1.1).length;
  document.getElementById("weekChart").innerHTML = week
    .map((day, index) => {
      const height = Math.max(8, Math.min(150, (weeklyTotals[index].calories / targets.calories) * 130 || 8));
      return `<div class="day-bar"><div class="day-bar-fill" style="height:${height}px"></div><span>${day.label}</span></div>`;
    })
    .join("");
  document.getElementById("weeklySummary").innerHTML = `
    <strong>近 7 天日均 ${formatNumber(avgCalories)} kcal</strong>
    <span>${hitDays} 天进入目标热量区间。当前目标是 ${formatNumber(targets.calories)} kcal / 日。</span>
  `;
}

function fillProfileForm() {
  const profile = state.profile;
  document.getElementById("sexInput").value = profile.sex || "";
  document.getElementById("ageInput").value = profile.age || "";
  document.getElementById("heightInput").value = profile.height || "";
  document.getElementById("weightInput").value = profile.weight || "";
  document.getElementById("activityInput").value = profile.activity || "";
  document.getElementById("goalInput").value = profile.goal || "";
  document.querySelectorAll("[data-intensity]").forEach((button) => {
    button.classList.toggle("active", button.dataset.intensity === (profile.intensity || "standard"));
  });
}

function populateFoodOptions() {
  document.getElementById("foodOptions").innerHTML = foodLibrary.map((food) => `<option value="${food.name}"></option>`).join("");
}

function findFood(query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return null;
  return (
    foodLibrary.find((food) => food.name.toLowerCase() === normalized) ||
    foodLibrary.find((food) => food.name.toLowerCase().includes(normalized)) ||
    foodLibrary.find((food) => food.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(normalized)))
  );
}

function nutritionFor(food, grams) {
  const ratio = Number(grams || 0) / 100;
  return {
    calories: Math.round(food.per100.calories * ratio),
    protein: Number((food.per100.protein * ratio).toFixed(1)),
    carbs: Number((food.per100.carbs * ratio).toFixed(1)),
    fat: Number((food.per100.fat * ratio).toFixed(1))
  };
}

function normalizeRemoteFood(product) {
  const nutriments = product.nutriments || {};
  const calories =
    Number(nutriments["energy-kcal_100g"]) ||
    Number(nutriments["energy-kcal"]) ||
    (Number(nutriments.energy_100g) ? Number(nutriments.energy_100g) / 4.184 : 0);
  const protein = Number(nutriments.proteins_100g || nutriments.proteins || 0);
  const carbs = Number(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0);
  const fat = Number(nutriments.fat_100g || nutriments.fat || 0);
  const name = product.product_name || product.generic_name || product.brands || "";
  if (!name || !calories) return null;
  return {
    name,
    brand: product.brands || "",
    image: product.image_front_small_url || product.image_small_url || "",
    source: "Open Food Facts",
    per100: {
      calories: Math.round(calories),
      protein: Number(protein.toFixed(1)),
      carbs: Number(carbs.toFixed(1)),
      fat: Number(fat.toFixed(1))
    },
    keywords: [name, product.brands, product.categories].filter(Boolean)
  };
}

async function searchOpenFoodFacts(query) {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "12");
  url.searchParams.set("fields", "product_name,generic_name,brands,categories,nutriments,image_front_small_url,image_small_url");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Open Food Facts 查询失败");
  const data = await response.json();
  return (data.products || []).map(normalizeRemoteFood).filter(Boolean).slice(0, 8);
}

async function searchNutritionDatabase(query) {
  const local = getFoodCandidates(query, 8);
  try {
    const remote = await searchOpenFoodFacts(query);
    const names = new Set(local.map((food) => food.name.toLowerCase()));
    return [...local, ...remote.filter((food) => !names.has(food.name.toLowerCase()))].slice(0, 10);
  } catch {
    return local;
  }
}

function applyFoodToForm(food, grams = 250) {
  document.getElementById("foodNameInput").value = food.name;
  document.getElementById("gramsInput").value = grams;
  updateNutritionFromFood();
}

function updateNutritionFromFood() {
  const food = findFood(document.getElementById("foodNameInput").value);
  const grams = Number(document.getElementById("gramsInput").value);
  if (!food || !grams) return;
  const nutrition = nutritionFor(food, grams);
  document.getElementById("calorieInput").value = nutrition.calories;
  document.getElementById("proteinInput").value = nutrition.protein;
  document.getElementById("carbInput").value = nutrition.carbs;
  document.getElementById("fatInput").value = nutrition.fat;
}

function renderFoodSearchResults(panel, title, detail, suggestions, imageUrl = "") {
  panel.classList.add("active");
  panel.innerHTML = `
    ${
      imageUrl
        ? `<div class="photo-review"><img id="uploadedFoodPreview" src="${imageUrl}" alt="已上传的食物照片" /><div><strong>${title}</strong><p>${detail}</p></div></div>`
        : `<div class="search-status"><strong>${title}</strong><p>${detail}</p></div>`
    }
    <div class="suggestion-grid">
      ${suggestions
        .map((food, index) => {
          const nutrition = nutritionFor(food, 250);
          const label = food.source ? `${food.source}${food.brand ? ` · ${food.brand}` : ""}` : "本地营养库";
          return `
            <button class="suggestion-button" type="button" data-suggestion="${index}">
              <strong>${food.name}</strong>
              <span>${label}</span>
              <span>每100g ${food.per100.calories} kcal · 蛋白 ${food.per100.protein}g · 碳水 ${food.per100.carbs}g · 脂肪 ${food.per100.fat}g</span>
              <span>按250g 约 ${nutrition.calories} kcal</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
  panel.querySelectorAll("[data-suggestion]").forEach((button) => {
    button.addEventListener("click", () => applyFoodToForm(suggestions[Number(button.dataset.suggestion)], Number(document.getElementById("gramsInput").value || 250)));
  });
}

async function lookupFoodFromInput() {
  const query = document.getElementById("foodNameInput").value.trim();
  const panel = document.getElementById("foodSearchPanel");
  if (!query) {
    panel.classList.add("active");
    panel.innerHTML = `<div class="empty-state">请输入食物名称后再查询营养库。</div>`;
    return;
  }
  panel.classList.add("active");
  panel.innerHTML = `<div class="empty-state">正在查询本地营养库和 Open Food Facts...</div>`;
  const suggestions = await searchNutritionDatabase(query);
  renderFoodSearchResults(panel, "营养库查询结果", "请选择最接近的食物，系统会按克数自动填充热量和营养成分。", suggestions);
}

function getFoodCandidates(text, limit = 6) {
  const normalized = String(text || "").toLowerCase();
  const scored = foodLibrary
    .map((food) => {
      const score = food.keywords.reduce((total, keyword) => {
        const key = keyword.toLowerCase();
        return total + (normalized.includes(key) ? 3 : key.includes(normalized) ? 1 : 0);
      }, food.name.toLowerCase().includes(normalized) ? 2 : 0);
      return { food, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.food);
  return scored.length ? scored.slice(0, limit) : foodLibrary.slice(0, limit);
}

function renderSuggestionButtons(panel, imageUrl, title, detail, suggestions) {
  renderFoodSearchResults(panel, title, detail, suggestions, imageUrl);
  panel.querySelectorAll("[data-suggestion]").forEach((button) => {
    button.addEventListener("click", () => applyFoodToForm(suggestions[Number(button.dataset.suggestion)], 250));
  });
}

async function getVisionModel() {
  if (!window.mobilenet) throw new Error("CV 模型脚本未加载");
  if (!visionModelPromise) visionModelPromise = window.mobilenet.load();
  return visionModelPromise;
}

function waitForImage(image) {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", reject, { once: true });
  });
}

async function showRecognitionSuggestions(file) {
  const panel = document.getElementById("recognitionPanel");
  const imageUrl = URL.createObjectURL(file);
  renderSuggestionButtons(panel, imageUrl, "正在识别图片", "正在加载浏览器端 CV 模型，请稍候。", foodLibrary.slice(0, 4));
  try {
    const model = await getVisionModel();
    const image = document.getElementById("uploadedFoodPreview");
    await waitForImage(image);
    const predictions = await model.classify(image, 5);
    const predictionText = predictions.map((item) => item.className).join(", ");
    const suggestions = await searchNutritionDatabase(predictionText);
    renderSuggestionButtons(
      panel,
      imageUrl,
      "图片识别已连接营养库",
      `CV 标签：${predictionText}。下方结果来自本地库和 Open Food Facts，请选择最接近的一项。`,
      suggestions
    );
  } catch (error) {
    const suggestions = await searchNutritionDatabase(file.name);
    renderSuggestionButtons(
      panel,
      imageUrl,
      "CV 模型暂时不可用",
      "已改用文件名和营养库搜索候选。高精度图片识别需要后端专用食物视觉 API。",
      suggestions
    );
  }
}

function addMeal(item) {
  const key = todayKey();
  const logs = state.logs[key] || [];
  state.logs[key] = [...logs, { id: createId(), ...item }];
  saveState();
  renderDashboard();
}

function bindEvents() {
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.getElementById("quickAddButton").addEventListener("click", () => setView("log"));
  document.querySelectorAll("[data-intensity]").forEach((button) => {
    button.addEventListener("click", () => {
      state.profile.intensity = button.dataset.intensity;
      fillProfileForm();
    });
  });
  document.getElementById("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = {
      sex: document.getElementById("sexInput").value,
      age: Number(document.getElementById("ageInput").value),
      height: Number(document.getElementById("heightInput").value),
      weight: Number(document.getElementById("weightInput").value),
      activity: Number(document.getElementById("activityInput").value),
      goal: document.getElementById("goalInput").value,
      intensity: state.profile.intensity || "standard"
    };
    saveState();
    renderDashboard();
    setView("plan");
  });
  document.getElementById("refreshPlanButton").addEventListener("click", () => {
    state.planSeed += 1;
    saveState();
    renderPlan();
  });
  document.getElementById("photoInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById("photoName").textContent = file.name;
    showRecognitionSuggestions(file);
  });
  document.getElementById("foodNameInput").addEventListener("input", updateNutritionFromFood);
  document.getElementById("gramsInput").addEventListener("input", updateNutritionFromFood);
  document.getElementById("lookupFoodButton").addEventListener("click", lookupFoodFromInput);
  document.getElementById("mealForm").addEventListener("submit", (event) => {
    event.preventDefault();
    updateNutritionFromFood();
    addMeal({
      meal: document.getElementById("mealTypeInput").value,
      name: document.getElementById("foodNameInput").value || "未命名食物",
      grams: Number(document.getElementById("gramsInput").value || 0),
      calories: Number(document.getElementById("calorieInput").value || 0),
      protein: Number(document.getElementById("proteinInput").value || 0),
      carbs: Number(document.getElementById("carbInput").value || 0),
      fat: Number(document.getElementById("fatInput").value || 0)
    });
  });
  document.getElementById("logMeals").addEventListener("click", (event) => {
    const id = event.target.dataset.delete;
    if (!id) return;
    const key = todayKey();
    state.logs[key] = (state.logs[key] || []).filter((item) => item.id !== id);
    saveState();
    renderDashboard();
  });
  document.getElementById("recipeGrid").addEventListener("click", (event) => {
    const title = event.target.dataset.plan;
    if (!title) return;
    const planMeal = buildPlan(calculateTargets()).find((item) => item.title === title);
    addMeal({ meal: planMeal.meal, name: planMeal.title, grams: 300, calories: planMeal.calories, protein: planMeal.protein, carbs: planMeal.carbs, fat: planMeal.fat });
    setView("dashboard");
  });
}

function init() {
  document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date());
  populateFoodOptions();
  fillProfileForm();
  bindEvents();
  renderDashboard();
}

init();
