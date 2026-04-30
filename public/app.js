const storageKey = "fitplate-state-v3";

const mealNames = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };
const viewTitles = {
  dashboard: "今日营养仪表盘",
  profile: "身体状况与目标分析",
  plan: "每日食谱制定",
  log: "饮食记录",
  summary: "目标达成总结"
};

const foodLibrary = [
  { name: "希腊酸奶燕麦", meal: "breakfast", icon: "◧" },
  { name: "鸡胸肉糙米饭", meal: "lunch", icon: "◩" },
  { name: "三文鱼藜麦碗", meal: "dinner", icon: "◪" },
  { name: "香蕉乳清奶昔", meal: "snack", icon: "◫" },
  { name: "水煮蛋", meal: "breakfast", icon: "◌" },
  { name: "白米饭", meal: "lunch", icon: "◍" },
  { name: "豆腐蔬菜荞麦面", meal: "dinner", icon: "◐" },
  { name: "虾仁杂粮沙拉", meal: "lunch", icon: "◒" }
];

const defaultState = {
  profile: { sex: "", age: "", height: "", weight: "", activity: "", goal: "", intensity: "standard" },
  logs: {},
  planSeed: 0
};

let state = loadState();
let recognizedFoods = [];
let foodClassifierPromise = null;

const food101Model = "ashaduzzaman/vit-finetuned-food101";

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

function formatNumber(value) {
  return Math.round(Number(value || 0)).toLocaleString("zh-CN");
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isProfileComplete(profile = state.profile) {
  return profile.sex && profile.age && profile.height && profile.weight && profile.activity && profile.goal;
}

function goalLabel(goal = state.profile.goal) {
  return { fatLoss: "减脂", muscleGain: "增肌", maintain: "维持" }[goal] || "待设置";
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

function setView(view) {
  document.querySelectorAll(".view").forEach((node) => node.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach((node) => node.classList.remove("active"));
  document.getElementById(`${view}View`).classList.add("active");
  document.querySelector(`[data-view="${view}"]`).classList.add("active");
  document.getElementById("viewTitle").textContent = viewTitles[view];
  document.getElementById("quickAddButton").hidden = view !== "dashboard";
}

function macroStatus(actual, target) {
  const ratio = target ? actual / target : 0;
  if (ratio < 0.75) return "待补足";
  if (ratio <= 1.08) return "很接近";
  return "已超出";
}

function scoreLabel(totals, targets) {
  const calorieRatio = totals.calories / targets.calories;
  const proteinRatio = totals.protein / targets.protein;
  if (!totals.calories) return "未开始";
  if (calorieRatio >= 0.9 && calorieRatio <= 1.08 && proteinRatio >= 0.85) return "优秀";
  if (calorieRatio <= 1.18 && proteinRatio >= 0.7) return "接近目标";
  return calorieRatio > 1.18 ? "热量偏高" : "还需补充";
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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function apiJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

function setLogStatus(panel, message, kind = "empty-state") {
  panel.classList.add("active");
  panel.innerHTML = `<div class="${kind}">${escapeHtml(message)}</div>`;
}

function fillNutritionFields(candidate, grams) {
  const total = candidate.total;
  document.getElementById("foodNameInput").value = candidate.foodName;
  document.getElementById("gramsInput").value = grams;
  document.getElementById("calorieInput").value = total.calories;
  document.getElementById("proteinInput").value = total.protein;
  document.getElementById("carbInput").value = total.carbohydrate;
  document.getElementById("fatInput").value = total.fat;
}

function normalizeFoodLabel(label) {
  return String(label || "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getFoodClassifier() {
  if (!foodClassifierPromise) {
    foodClassifierPromise = import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1").then(async ({ pipeline, env }) => {
      env.allowLocalModels = false;
      return pipeline("image-classification", food101Model, { dtype: "q8" });
    });
  }
  return foodClassifierPromise;
}

async function lookupNutrition(foodName, grams, targetPanel) {
  const panel = targetPanel || document.getElementById("foodSearchPanel");
  if (!foodName) {
    setLogStatus(panel, "请输入食物名称后再查询营养库。");
    return null;
  }
  setLogStatus(panel, "正在查询 USDA FoodData Central；如果搜不到会自动查询 Open Food Facts...");
  try {
    const data = await apiJson("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodName, grams })
    });
    renderNutritionCandidates(panel, data);
    return data;
  } catch (error) {
    setLogStatus(panel, error.message, "empty-state error-state");
    return null;
  }
}

function renderNutritionCandidates(panel, data) {
  panel.classList.add("active");
  panel.innerHTML = `
    <div class="search-status">
      <strong>营养库查询结果</strong>
      <p>来源：${escapeHtml(data.provider)}。请选择最接近的一项，系统会按 ${escapeHtml(data.grams)}g 自动填充。</p>
    </div>
    <div class="suggestion-grid">
      ${data.candidates
        .map(
          (item, index) => `
          <button class="suggestion-button" type="button" data-nutrition="${index}">
            <strong>${escapeHtml(item.foodName)}</strong>
            <span>${escapeHtml(item.source)}${item.brand ? ` · ${escapeHtml(item.brand)}` : ""}</span>
            <span>每100g ${item.per100g.calories} kcal · 蛋白 ${item.per100g.protein}g · 碳水 ${item.per100g.carbohydrate}g · 脂肪 ${item.per100g.fat}g</span>
            <span>按 ${data.grams}g：${item.total.calories} kcal · 蛋白 ${item.total.protein}g</span>
          </button>
        `
        )
        .join("")}
    </div>
  `;
  panel.querySelectorAll("[data-nutrition]").forEach((button) => {
    button.addEventListener("click", () => fillNutritionFields(data.candidates[Number(button.dataset.nutrition)], data.grams));
  });
  if (data.candidates[0]) fillNutritionFields(data.candidates[0], data.grams);
}

function renderRecognizedCandidates(panel, imageUrl, foods) {
  recognizedFoods = foods;
  panel.classList.add("active");
  panel.innerHTML = `
    <div class="photo-review">
      <img src="${imageUrl}" alt="已上传的食物照片" />
      <div>
        <strong>免费 CV 识别候选</strong>
        <p>图片识别仅供参考，营养计算基于用户确认的食物和重量。请确认或修改食物名称和克数。</p>
      </div>
    </div>
    <div class="candidate-list">
      ${foods
        .map((food, index) => {
          const confidence = Number(food.confidence || 0);
          const warn = food.requiresConfirmation || confidence < 0.7;
          return `
            <article class="candidate compact-candidate">
              <div class="food-row">
                <label>食物<input data-recognized-field="foodName" data-recognized-index="${index}" value="${escapeHtml(food.foodName)}" /></label>
                <label>克数<input data-recognized-field="estimatedGrams" data-recognized-index="${index}" type="number" min="1" value="${escapeHtml(food.estimatedGrams)}" /></label>
              </div>
              <div class="candidate-actions">
                <span class="confidence ${warn ? "warn" : ""}">置信度 ${(confidence * 100).toFixed(0)}%${warn ? " · 需要人工确认" : ""}</span>
                <button class="ghost-button" type="button" data-confirm-recognized="${index}">确认并查询营养</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

async function showRecognitionSuggestions(file) {
  const panel = document.getElementById("recognitionPanel");
  const imageUrl = URL.createObjectURL(file);
  setLogStatus(panel, "正在加载免费的 Food-101 浏览器端模型。首次加载可能需要一点时间...");
  try {
    const classifier = await getFoodClassifier();
    const predictions = await classifier(imageUrl, { topk: 5 });
    const foods = predictions.slice(0, 5).map((item) => ({
      foodName: normalizeFoodLabel(item.label),
      confidence: Number(item.score || 0),
      estimatedGrams: 100,
      requiresConfirmation: Number(item.score || 0) < 0.7
    }));
    renderRecognizedCandidates(panel, imageUrl, foods);
    if (!foods.length || foods[0].confidence < 0.7) {
      document.getElementById("foodNameInput").value = foods[0]?.foodName || "";
      document.getElementById("gramsInput").value = 100;
      document.getElementById("foodSearchPanel").classList.add("active");
      document.getElementById("foodSearchPanel").innerHTML =
        `<div class="empty-state">图片识别置信度低于 70%，已进入手动确认模式。请修改食物名称和克数后点击“查询营养库并自动填充”。</div>`;
    }
  } catch (error) {
    setLogStatus(panel, `免费 CV 模型加载失败：${error.message}。请改用手动输入食物名称和克数。`, "empty-state error-state");
  }
}

async function lookupFoodFromInput() {
  const foodName = document.getElementById("foodNameInput").value.trim();
  const grams = Number(document.getElementById("gramsInput").value || 100);
  await lookupNutrition(foodName, grams, document.getElementById("foodSearchPanel"));
}

function addMeal(item) {
  const key = todayKey();
  const logs = state.logs[key] || [];
  state.logs[key] = [...logs, { id: createId(), ...item }];
  saveState();
  renderDashboard();
}

function updateNutritionFromFood() {
  // Nutrition values come from the backend database after user confirmation.
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
  document.getElementById("lookupFoodButton").addEventListener("click", lookupFoodFromInput);
  document.getElementById("recognitionPanel").addEventListener("input", (event) => {
    const index = Number(event.target.dataset.recognizedIndex);
    const field = event.target.dataset.recognizedField;
    if (!field || !recognizedFoods[index]) return;
    recognizedFoods[index][field] = field === "estimatedGrams" ? Number(event.target.value) : event.target.value;
  });
  document.getElementById("recognitionPanel").addEventListener("click", (event) => {
    const index = event.target.dataset.confirmRecognized;
    if (index === undefined) return;
    const food = recognizedFoods[Number(index)];
    document.getElementById("foodNameInput").value = food.foodName;
    document.getElementById("gramsInput").value = food.estimatedGrams;
    lookupNutrition(food.foodName, food.estimatedGrams, document.getElementById("foodSearchPanel"));
  });
  document.getElementById("mealForm").addEventListener("submit", (event) => {
    event.preventDefault();
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
