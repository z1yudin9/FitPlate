const storageKey = "fitplate-state-v1";

const foodLibrary = [
  { name: "鸡胸肉糙米饭", grams: 350, calories: 560, protein: 45, carbs: 62, fat: 13, keywords: ["鸡胸", "鸡肉", "糙米", "chicken"] },
  { name: "三文鱼藜麦碗", grams: 320, calories: 610, protein: 38, carbs: 46, fat: 28, keywords: ["三文鱼", "藜麦", "salmon"] },
  { name: "牛肉全麦卷", grams: 280, calories: 520, protein: 34, carbs: 54, fat: 18, keywords: ["牛肉", "卷饼", "beef", "wrap"] },
  { name: "希腊酸奶燕麦", grams: 260, calories: 390, protein: 24, carbs: 48, fat: 10, keywords: ["酸奶", "燕麦", "yogurt", "oat"] },
  { name: "鸡蛋牛油果吐司", grams: 230, calories: 430, protein: 22, carbs: 36, fat: 22, keywords: ["鸡蛋", "牛油果", "吐司", "egg", "toast"] },
  { name: "豆腐蔬菜荞麦面", grams: 360, calories: 500, protein: 26, carbs: 70, fat: 12, keywords: ["豆腐", "荞麦", "面", "tofu", "noodle"] },
  { name: "虾仁杂粮沙拉", grams: 300, calories: 420, protein: 33, carbs: 40, fat: 14, keywords: ["虾", "沙拉", "shrimp", "salad"] },
  { name: "香蕉乳清奶昔", grams: 420, calories: 360, protein: 31, carbs: 48, fat: 6, keywords: ["香蕉", "乳清", "奶昔", "banana", "shake"] },
  { name: "番茄鸡蛋盖饭", grams: 380, calories: 620, protein: 24, carbs: 88, fat: 18, keywords: ["番茄", "西红柿", "盖饭", "tomato"] },
  { name: "清炒时蔬米饭", grams: 330, calories: 430, protein: 12, carbs: 72, fat: 10, keywords: ["蔬菜", "青菜", "米饭", "rice", "vegetable"] },
  { name: "牛奶全麦面包", grams: 260, calories: 410, protein: 20, carbs: 58, fat: 11, keywords: ["牛奶", "面包", "milk", "bread"] },
  { name: "水煮蛋", grams: 100, calories: 155, protein: 13, carbs: 1, fat: 11, keywords: ["水煮蛋", "boiled", "egg"] }
];

const mealNames = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐"
};

const viewTitles = {
  dashboard: "今日营养仪表盘",
  profile: "身体状况与目标分析",
  plan: "每日食谱制定",
  log: "饮食记录",
  summary: "目标达成总结"
};

const defaultState = {
  profile: {
    sex: "female",
    age: 28,
    height: 168,
    weight: 62,
    activity: 1.55,
    goal: "fatLoss",
    intensity: "standard"
  },
  logs: {},
  planSeed: 0
};

let state = loadState();

function todayKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved ? { ...defaultState, ...saved } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function calculateTargets(profile = state.profile) {
  const { sex, age, height, weight, activity, goal, intensity } = profile;
  const bmr =
    sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const maintenance = bmr * Number(activity);
  const adjustments = {
    fatLoss: { gentle: -250, standard: -450, aggressive: -650 },
    muscleGain: { gentle: 180, standard: 320, aggressive: 480 },
    maintain: { gentle: 0, standard: 0, aggressive: 0 }
  };
  const calories = Math.max(1200, maintenance + adjustments[goal][intensity]);
  const proteinRate = goal === "muscleGain" ? 2 : goal === "fatLoss" ? 1.8 : 1.6;
  const protein = weight * proteinRate;
  const fat = (calories * (goal === "fatLoss" ? 0.25 : 0.28)) / 9;
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
  return Math.round(value).toLocaleString("zh-CN");
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function goalLabel(goal = state.profile.goal) {
  return { fatLoss: "减脂", muscleGain: "增肌", maintain: "维持" }[goal];
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
  const remaining = targets.calories - totals.calories;

  document.getElementById("consumedCalories").textContent = formatNumber(totals.calories);
  document.getElementById("remainingCalories").textContent = formatNumber(remaining);
  document.getElementById("bmrValue").textContent = formatNumber(targets.bmr);
  document.getElementById("targetCalories").textContent = formatNumber(targets.calories);
  document.getElementById("sidebarGoal").textContent = goalLabel();
  document.getElementById("sidebarCalories").textContent = `${formatNumber(targets.calories)} kcal / 日`;
  document.getElementById("todayScore").textContent = scoreLabel(totals, targets);

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
  const macros = [
    ["calories", "热量", totals.calories, targets.calories, "kcal"],
    ["protein", "蛋白质", totals.protein, targets.protein, "g"],
    ["carbs", "碳水", totals.carbs, targets.carbs, "g"],
    ["fat", "脂肪", totals.fat, targets.fat, "g"]
  ];
  document.getElementById("macroBars").innerHTML = macros
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
  const meals = buildPlan(targets);

  document.getElementById("planSummary").innerHTML = [
    ["热量", `${formatNumber(targets.calories)} kcal`],
    ["蛋白质", `${formatNumber(targets.protein)} g`],
    ["碳水", `${formatNumber(targets.carbs)} g`],
    ["脂肪", `${formatNumber(targets.fat)} g`]
  ]
    .map(([label, value]) => `<div class="plan-chip"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  document.getElementById("recipeGrid").innerHTML = meals
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
    ["breakfast", "希腊酸奶燕麦 + 蓝莓", "◧", 0.24, 0.23, 0.28, 0.18],
    ["lunch", "鸡胸肉糙米饭 + 彩椒", "◩", 0.34, 0.36, 0.36, 0.28],
    ["dinner", "三文鱼藜麦碗 + 西兰花", "◪", 0.32, 0.31, 0.26, 0.42],
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
  document.getElementById("sexInput").value = profile.sex;
  document.getElementById("ageInput").value = profile.age;
  document.getElementById("heightInput").value = profile.height;
  document.getElementById("weightInput").value = profile.weight;
  document.getElementById("activityInput").value = profile.activity;
  document.getElementById("goalInput").value = profile.goal;
  document.querySelectorAll("[data-intensity]").forEach((button) => {
    button.classList.toggle("active", button.dataset.intensity === profile.intensity);
  });
}

function applyFoodToForm(food) {
  document.getElementById("foodNameInput").value = food.name;
  document.getElementById("gramsInput").value = food.grams;
  document.getElementById("calorieInput").value = food.calories;
  document.getElementById("proteinInput").value = food.protein;
  document.getElementById("carbInput").value = food.carbs;
  document.getElementById("fatInput").value = food.fat;
}

function getFoodCandidates(fileName) {
  const normalized = fileName.toLowerCase();
  const matched = foodLibrary.filter((food) => food.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())));
  return matched.length ? matched.slice(0, 4) : foodLibrary.slice(0, 6);
}

function showRecognitionSuggestions(file) {
  const panel = document.getElementById("recognitionPanel");
  const suggestions = getFoodCandidates(file.name);
  const hasKeywordMatch = suggestions.some((food) =>
    food.keywords.some((keyword) => file.name.toLowerCase().includes(keyword.toLowerCase()))
  );
  const imageUrl = URL.createObjectURL(file);
  panel.classList.add("active");
  panel.innerHTML = `
    <div class="photo-review">
      <img src="${imageUrl}" alt="已上传的食物照片" />
      <div>
        <strong>${hasKeywordMatch ? "找到可能匹配的食物" : "请从常见食物中选择"}</strong>
        <p>${hasKeywordMatch ? "候选来自图片文件名中的食物关键词，请确认后填入。" : "当前原型没有接入真实视觉模型，因此不会再随机猜测食物。"}</p>
      </div>
    </div>
    <div class="suggestion-grid">
      ${suggestions
        .map(
          (food, index) => `
          <button class="suggestion-button" type="button" data-suggestion="${index}">
            <strong>${food.name}</strong>
            <span>${food.grams}g · ${food.calories} kcal · 蛋白 ${food.protein}g</span>
          </button>
        `
        )
        .join("")}
    </div>
  `;
  panel.querySelectorAll("[data-suggestion]").forEach((button) => {
    button.addEventListener("click", () => applyFoodToForm(suggestions[Number(button.dataset.suggestion)]));
  });
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
      intensity: state.profile.intensity
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

  document.getElementById("mealForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addMeal({
      meal: document.getElementById("mealTypeInput").value,
      name: document.getElementById("foodNameInput").value || "未命名食物",
      grams: Number(document.getElementById("gramsInput").value),
      calories: Number(document.getElementById("calorieInput").value),
      protein: Number(document.getElementById("proteinInput").value),
      carbs: Number(document.getElementById("carbInput").value),
      fat: Number(document.getElementById("fatInput").value)
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
    addMeal({
      meal: planMeal.meal,
      name: planMeal.title,
      grams: 300,
      calories: planMeal.calories,
      protein: planMeal.protein,
      carbs: planMeal.carbs,
      fat: planMeal.fat
    });
    setView("dashboard");
  });
}

function init() {
  document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date());
  fillProfileForm();
  bindEvents();
  renderDashboard();
}

init();
