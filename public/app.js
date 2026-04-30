const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const recognizeButton = document.getElementById("recognizeButton");
const manualAddButton = document.getElementById("manualAddButton");
const manualFoodName = document.getElementById("manualFoodName");
const manualGrams = document.getElementById("manualGrams");
const candidateList = document.getElementById("candidateList");
const results = document.getElementById("results");
const serverStatus = document.getElementById("serverStatus");

let selectedImage = null;
let candidates = [];

function setBusy(button, busy, label) {
  button.disabled = busy;
  button.textContent = busy ? "处理中..." : label;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    serverStatus.innerHTML = `
      <strong>后端已连接</strong><br />
      OpenAI: ${data.openaiConfigured ? "已配置" : "未配置"}<br />
      USDA: ${data.usdaConfigured ? "已配置" : "未配置，营养查询会直接使用 Open Food Facts"}
    `;
  } catch {
    serverStatus.textContent = "后端未启动。请运行 npm install 后 npm start。";
  }
}

function renderCandidates() {
  if (!candidates.length) {
    candidateList.innerHTML = `<div class="empty">暂无候选。请先上传图片识别，或手动输入食物。</div>`;
    return;
  }

  candidateList.innerHTML = candidates
    .map((item, index) => {
      const confidence = Number(item.confidence || 0);
      const needsConfirm = item.requiresConfirmation || confidence < 0.7;
      return `
        <article class="candidate">
          <div class="candidate-grid">
            <label>
              食物名称
              <input data-field="foodName" data-index="${index}" value="${escapeHtml(item.foodName)}" />
            </label>
            <label>
              克数
              <input data-field="estimatedGrams" data-index="${index}" type="number" min="1" value="${escapeHtml(item.estimatedGrams)}" />
            </label>
            <button class="primary" data-confirm="${index}" type="button">确认并计算</button>
          </div>
          <span class="confidence ${needsConfirm ? "warn" : ""}">
            置信度 ${(confidence * 100).toFixed(0)}%${needsConfirm ? " · 需要人工确认" : ""}
          </span>
        </article>
      `;
    })
    .join("");
}

function addCandidate(candidate) {
  candidates = [
    ...candidates,
    {
      foodName: candidate.foodName || "",
      confidence: Number(candidate.confidence ?? 1),
      estimatedGrams: Math.max(1, Math.round(Number(candidate.estimatedGrams || 100))),
      requiresConfirmation: Boolean(candidate.requiresConfirmation)
    }
  ];
  renderCandidates();
}

async function recognizeImage() {
  if (!selectedImage) {
    candidateList.innerHTML = `<div class="empty error">请先选择一张食物图片。</div>`;
    return;
  }
  const formData = new FormData();
  formData.append("image", selectedImage);
  setBusy(recognizeButton, true, "识别图片");
  try {
    const response = await fetch("/api/recognize", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "识别失败");
    candidates = data.foods || [];
    renderCandidates();
  } catch (error) {
    candidateList.innerHTML = `<div class="empty error">${escapeHtml(error.message)}</div>`;
  } finally {
    setBusy(recognizeButton, false, "识别图片");
  }
}

async function calculateNutrition(index) {
  const item = candidates[index];
  if (!item?.foodName) return;
  results.innerHTML = `<div class="empty">正在查询 USDA FoodData Central，搜不到会自动查询 Open Food Facts...</div>`;
  try {
    const response = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodName: item.foodName, grams: Number(item.estimatedGrams) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "营养查询失败");
    renderNutritionResults(data);
  } catch (error) {
    results.innerHTML = `<div class="empty error">${escapeHtml(error.message)}</div>`;
  }
}

function renderNutritionResults(data) {
  if (!data.candidates?.length) {
    results.innerHTML = `<div class="empty">没有查到营养数据。</div>`;
    return;
  }
  results.innerHTML = data.candidates
    .map((item) => `
      <article class="result">
        <h3>${escapeHtml(item.foodName)}</h3>
        <div class="muted">${escapeHtml(item.source)}${item.brand ? ` · ${escapeHtml(item.brand)}` : ""} · 按 ${data.grams}g 计算</div>
        <div class="nutrition-grid">
          <div class="nutrition-tile"><span>Calories</span><strong>${item.total.calories}</strong><small>kcal</small></div>
          <div class="nutrition-tile"><span>Protein</span><strong>${item.total.protein}</strong><small>g</small></div>
          <div class="nutrition-tile"><span>Fat</span><strong>${item.total.fat}</strong><small>g</small></div>
          <div class="nutrition-tile"><span>Carbohydrate</span><strong>${item.total.carbohydrate}</strong><small>g</small></div>
        </div>
      </article>
    `)
    .join("");
}

imageInput.addEventListener("change", () => {
  selectedImage = imageInput.files?.[0] || null;
  if (!selectedImage) return;
  previewImage.src = URL.createObjectURL(selectedImage);
  previewImage.hidden = false;
});

recognizeButton.addEventListener("click", recognizeImage);

manualAddButton.addEventListener("click", () => {
  if (!manualFoodName.value.trim()) {
    candidateList.innerHTML = `<div class="empty error">请输入食物名称。</div>`;
    return;
  }
  addCandidate({
    foodName: manualFoodName.value.trim(),
    estimatedGrams: Number(manualGrams.value || 100),
    confidence: 1,
    requiresConfirmation: false
  });
});

candidateList.addEventListener("input", (event) => {
  const index = Number(event.target.dataset.index);
  const field = event.target.dataset.field;
  if (!field || !candidates[index]) return;
  candidates[index][field] = field === "estimatedGrams" ? Number(event.target.value) : event.target.value;
});

candidateList.addEventListener("click", (event) => {
  const index = event.target.dataset.confirm;
  if (index === undefined) return;
  calculateNutrition(Number(index));
});

renderCandidates();
checkHealth();
