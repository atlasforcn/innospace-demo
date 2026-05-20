const scenarioButtons = document.querySelectorAll(".scenario-button");
const missionPrompt = document.getElementById("missionPrompt");
const analyzeButton = document.getElementById("analyzeButton");
const analysisProgress = document.getElementById("analysisProgress");
const analysisProgressLabel = document.getElementById("analysisProgressLabel");
const analysisProgressFill = document.getElementById("analysisProgressFill");
const analysisStageList = document.getElementById("analysisStageList");
const approveButton = document.getElementById("approveButton");
const clarificationBox = document.getElementById("clarificationBox");
const constructionTools = document.getElementById("constructionTools");
const addressInput = document.getElementById("addressInput");
const resolveAddressButton = document.getElementById("resolveAddressButton");
const drawAoiButton = document.getElementById("drawAoiButton");
const mapCaption = document.getElementById("mapCaption");
const mapBadge = document.getElementById("mapBadge");
const mapTarget = document.getElementById("mapTarget");
const aoiHint = document.getElementById("aoiHint");
const missionMap = document.querySelector(".mission-map");
const mapImageSelect = document.getElementById("mapImageSelect");
const mapImageUpload = document.getElementById("mapImageUpload");
const clearMapImageButton = document.getElementById("clearMapImageButton");
const mapImageStatus = document.getElementById("mapImageStatus");
const osmMapFrame = document.getElementById("osmMapFrame");
const mapModeButtons = document.querySelectorAll("[data-map-source]");
const mapZoomInButton = document.getElementById("mapZoomInButton");
const mapZoomOutButton = document.getElementById("mapZoomOutButton");
const mapResetViewButton = document.getElementById("mapResetViewButton");
const mapScaleBadge = document.getElementById("mapScaleBadge");
let mapTracks = Array.from(document.querySelectorAll(".track"));
let mapSatellites = Array.from(document.querySelectorAll(".satellite"));
const constellationBadge = document.getElementById("constellationBadge");
const satelliteCards = document.getElementById("satelliteCards");
const suitabilityMatrix = document.getElementById("suitabilityMatrix");
const intentSummary = document.getElementById("intentSummary");
const decisionTable = document.getElementById("decisionTable");
const missionTimeline = document.getElementById("missionTimeline");
const planStatus = document.getElementById("planStatus");
const recommendedAsset = document.getElementById("recommendedAsset");
const commandStatus = document.getElementById("commandStatus");
const commandBoundary = document.getElementById("commandBoundary");
const commandOutput = document.getElementById("commandOutput");
const exportButton = document.getElementById("exportButton");
const customConstellationToggle = document.getElementById("customConstellationToggle");
const customSatelliteCount = document.getElementById("customSatelliteCount");
const generateConstellationButton = document.getElementById("generateConstellationButton");
const applyCustomConstellationButton = document.getElementById("applyCustomConstellationButton");
const customSatelliteEditor = document.getElementById("customSatelliteEditor");
const operatorProgress = document.querySelector(".operator-progress");
const workflowStateBadge = document.getElementById("workflowStateBadge");
const workflowCalloutText = document.getElementById("workflowCalloutText");
const guidedTaskList = document.getElementById("guidedTaskList");
const scenarioFlowGrid = document.getElementById("scenarioFlowGrid");
const dashboardModeToggle = document.getElementById("dashboardModeToggle");
const prevStepButton = document.getElementById("prevStepButton");
const nextStepButton = document.getElementById("nextStepButton");
const currentStepBadge = document.getElementById("currentStepBadge");
const currentStepTitle = document.getElementById("currentStepTitle");
const currentStepHint = document.getElementById("currentStepHint");
const presentationPanelSelectors = [
  ".mission-input",
  ".phase-validate",
  ".phase-interpret",
  ".mission-map-panel",
  ".constellation-panel",
  ".decision-panel",
  ".mission-plan-panel",
  ".command-panel",
  ".custom-constellation-panel",
  ".map-source-panel"
];
const presentationPanels = presentationPanelSelectors.map((selector) => document.querySelector(selector)).filter(Boolean);

let activeScenario = "wildfire";
let constructionResolved = false;
let approved = false;
let activeCommandPacket = null;
let selectedMapImageSource = "auto";
let uploadedMapImageUrl = null;
let uploadedMapImageName = "";
let activeMapImageToken = 0;
let activePresentationStepIndex = 0;
let presentationModeEnabled = true;
let currentWorkflowState = "idle";
let progressSteps = [];
let activeCustomTarget = null;
let activeResolvedTarget = null;
let analysisInProgress = false;
let analysisFailed = false;
let mapDragState = null;
let lastMapDragMoved = false;
const mapViewOverrides = {};

const presentationSteps = [
  {
    key: "request",
    phase: "01",
    group: "Mission Flow / 任務流程",
    title: "Mission Intake / 任務輸入",
    detail: "Operator receives natural-language intent, then starts analysis. / 操作員接收自然語言任務並啟動分析。"
  },
  {
    key: "clarify",
    phase: "02",
    group: "Mission Flow / 任務流程",
    title: "Target Gate / 目標檢核",
    detail: "Geocode, AOI, and GSD must be clear before any spacecraft tasking. / 必須先確認座標、AOI 與 GSD，才可進入衛星任務規劃。"
  },
  {
    key: "clarify",
    phase: "03",
    group: "Mission Flow / 任務流程",
    title: "Intent-to-Command Translation / 語意轉具體指令",
    detail: "Convert abstract human language into concrete mission requirements before any command is built. / 先把人類抽象語言轉成具體任務需求，再產生命令。"
  },
  {
    key: "plan",
    phase: "04",
    group: "Mission Flow / 任務流程",
    title: "AOI & Access / 區域與可見性",
    detail: "Show where the target is and when spacecraft can observe it. / 顯示目標區域與衛星可觀測窗口。"
  },
  {
    key: "plan",
    phase: "05/06",
    group: "Mission Flow / 任務流程",
    title: "Fleet Status + Fit / 星系狀態與適配",
    detail: "Check payload, battery, attitude state, storage, task conflicts, and the hidden suitability model. / 檢查酬載、電量、姿態、儲存、任務衝突與收合的適配模型。"
  },
  {
    key: "plan",
    phase: "07",
    group: "Mission Flow / 任務流程",
    title: "Candidate Decision / 候選決策",
    detail: "Compare candidates and show why each one is accepted, traded off, or rejected. / 比較候選衛星並說明接受、取捨或拒絕原因。"
  },
  {
    key: "plan",
    phase: "08",
    group: "Mission Flow / 任務流程",
    title: "Plan & Approval / 計畫與批准",
    detail: "Operator reviews timeline and confirms the plan before commands are released. / 操作員審核時序並批准後才釋出指令。"
  },
  {
    key: "export",
    phase: "09",
    group: "Mission Flow / 任務流程",
    title: "Command Packet / 指令封包",
    detail: "Only approved ADCS, payload, and data commands are exposed for export. / 只顯示已批准的姿態、酬載與資料指令。"
  },
  {
    key: "setup",
    phase: "A",
    group: "Demo Setup / 展示設定",
    title: "Fleet Sandbox / 星系沙盒",
    detail: "Optional demo-only constellation edits for what-if testing. / 展示用自訂星系，供情境測試。"
  },
  {
    key: "setup",
    phase: "B",
    group: "Demo Setup / 展示設定",
    title: "Map Display / 地圖顯示",
    detail: "Optional visualization source; it does not change flight tasking. / 可選視覺化底圖，不改變飛行任務。"
  }
];

const workflowStepToPanel = {
  request: 0,
  clarify: 1,
  plan: 3,
  approve: 6,
  export: 7
};

const workflowProgressByState = {
  idle: { completeThrough: -1, availableThrough: 0 },
  blocked: { completeThrough: 0, availableThrough: 1, blockedIndex: 1 },
  planned: { completeThrough: 5, availableThrough: 6 },
  approved: { completeThrough: 6, availableThrough: 7 },
  exported: { completeThrough: 7, availableThrough: 7 }
};

const analysisStages = [
  "LLM semantic interpretation / LLM 語意解析",
  "AOI and geocode check / AOI 與地理解析",
  "Mission boundary validation / 任務邊界檢查",
  "Fleet feasibility scoring / 星系可行性評估",
  "Bounded command generation / 受控指令生成"
];

const mapImagePresets = {
  wildfire: {
    file: "images/mission-area-wildfire.svg",
    status: "Preset: Rocky Mountain wildfire AOI / 預存：落基山火場 AOI",
    position: "center"
  },
  custom: {
    file: "images/mission-area-custom.svg",
    status: "Preset: custom target AOI / 預存：自訂目標 AOI",
    position: "center"
  },
  construction: {
    file: "images/mission-area-construction.svg",
    status: "Preset: construction monitoring site / 預存：工地監測區域",
    position: "center"
  },
  washington: {
    file: "images/mission-area-washington.svg",
    status: "Preset: Washington D.C. urban target / 預存：華盛頓城市目標",
    position: "center"
  }
};

const mapLiveViews = {
  wildfire: {
    center: [39.18, -106.82],
    zoom: 7,
    googleMapType: "terrain",
    googleStatus: "Google Maps: Rocky Mountain wildfire AOI / Google 地圖：落基山火場 AOI",
    freeStatus: "Free map: Rocky Mountain wildfire AOI / 免費地圖：落基山火場 AOI",
    simplePreset: "wildfire"
  },
  construction: {
    center: [38.8977, -77.0365],
    zoom: 16,
    googleMapType: "satellite",
    googleStatus: "Google Maps: resolved construction AOI / Google 地圖：已解析工地 AOI",
    freeStatus: "Free map: resolved construction AOI / 免費地圖：已解析工地 AOI",
    simplePreset: "construction"
  },
  washington: {
    center: [38.9072, -77.0369],
    zoom: 12,
    googleMapType: "hybrid",
    googleStatus: "Google Maps: Washington D.C. target / Google 地圖：華盛頓目標區",
    freeStatus: "Free map: Washington D.C. target / 免費地圖：華盛頓目標區",
    simplePreset: "washington"
  },
  custom: {
    center: [23.6978, 120.9605],
    zoom: 7,
    googleMapType: "terrain",
    googleStatus: "Google Maps: custom target pending / Google 地圖：等待自訂目標",
    freeStatus: "Free map: custom target pending / 免費地圖：等待自訂目標",
    simplePreset: "custom"
  }
};

const mapSatellitePositions = [
  { top: "12%", left: "14%" },
  { top: "42%", left: "70%" },
  { top: "68%", left: "24%" },
  { top: "24%", left: "50%" },
  { top: "56%", left: "50%" },
  { top: "76%", left: "64%" },
  { top: "34%", left: "24%" },
  { top: "18%", left: "76%" },
  { top: "78%", left: "40%" },
  { top: "48%", left: "11%" },
  { top: "10%", left: "38%" },
  { top: "64%", left: "82%" }
];

const mapTrackGeometries = [
  { top: "22%", rotate: "12deg" },
  { top: "46%", rotate: "-8deg" },
  { top: "70%", rotate: "16deg" },
  { top: "32%", rotate: "-18deg" },
  { top: "58%", rotate: "7deg" },
  { top: "82%", rotate: "-13deg" },
  { top: "15%", rotate: "25deg" },
  { top: "38%", rotate: "20deg" },
  { top: "63%", rotate: "-24deg" },
  { top: "76%", rotate: "3deg" },
  { top: "27%", rotate: "-3deg" },
  { top: "52%", rotate: "28deg" }
];

const osmMapViews = {
  wildfire: {
    bbox: [-108.42, 38.25, -105.12, 40.05],
    marker: [39.18, -106.82],
    status: "Live OpenStreetMap: Rocky Mountain wildfire AOI / 免費即時地圖：落基山火場 AOI"
  },
  construction: {
    bbox: [-77.08, 38.87, -77.0, 38.93],
    marker: [38.8977, -77.0365],
    status: "Live OpenStreetMap: resolved construction AOI / 免費即時地圖：已解析工地 AOI"
  },
  washington: {
    bbox: [-77.16, 38.8, -76.88, 39.0],
    marker: [38.9072, -77.0369],
    status: "Live OpenStreetMap: Washington D.C. target / 免費即時地圖：華盛頓目標區"
  }
};

const scenarioFlowModels = {
  wildfire: {
    title: "Wildfire response / 森林大火應變",
    nodes: [
      ["Incident request / 災害需求", "User asks for imagery over a reported wildfire region. / 使用者輸入火災區域拍攝需求。"],
      ["Resolve AOI + GSD / 解析區域與解析度", "System turns the place name into a regional AOI and proposes 3 m optical GSD. / 系統將地名轉為 AOI，並推導 3 m 光學 GSD。"],
      ["Feasibility screen / 可行性篩選", "Access window, FOV, battery, payload fit, storage, and protected tasks are checked. / 檢查可見窗口、FOV、電量、酬載、儲存與既有任務。"],
      ["Recommend asset / 建議衛星", "SAT-B is selected because it is safe, optical, and does not interrupt protected work. / 選出 SAT-B，因為它安全、光學符合、且不打斷既有任務。"],
      ["Approve + export / 核准並匯出", "Operator releases bounded ADCS, payload, and downlink commands. / 操作員核准後釋出受控姿態、酬載與下行指令。"]
    ]
  },
  construction: {
    title: "Construction monitoring / 工地週期監測",
    nodes: [
      ["Recurring request / 週期需求", "Vendor asks for repeat images of a construction site. / 廠商要求週期拍攝工地。"],
      ["Clarify location / 澄清位置", "If the site cannot become coordinates or AOI, planning pauses and asks for address or map AOI. / 若無法轉成座標或 AOI，系統暫停並要求地址或框選。"],
      ["Set repeatability / 設定可比性", "Planner adds comparable lighting and low off-nadir constraints. / 規劃器加入相似光影與低離軸角限制。"],
      ["Select cadence assets / 選擇週期資產", "Ten-satellite constellation is scored by revisit, battery, payload, and conflicts. / 依重訪、電量、酬載與衝突評估十顆衛星。"],
      ["Approve recurring plan / 核准週期計畫", "Operator approves a reusable schedule without overriding protected tasks. / 操作員核准不覆蓋既有任務的週期計畫。"]
    ]
  }
};

const workflowTextByState = {
  idle: {
    badge: "Intake / 輸入階段",
    text: "Start with the mission request. Fleet sandbox and map display are setup controls, not flight tasking steps. / 先處理任務需求；星系沙盒與地圖顯示是展示設定，不是飛行任務步驟。"
  },
  blocked: {
    badge: "Target Hold / 目標暫停",
    text: "Planning is paused at the target gate. No spacecraft is scored or commanded until coordinates, AOI, and imaging need are clear. / 系統停在目標檢核；座標、AOI 與成像需求清楚前，不評分也不下指令。"
  },
  planned: {
    badge: "Operator Review / 操作員審核",
    text: "The planner has produced evidence, candidate decisions, and an approval-ready plan. Commands remain locked until approval. / 規劃器已產出證據、候選決策與可批准計畫；指令仍待批准才解鎖。"
  },
  approved: {
    badge: "Command Ready / 指令就緒",
    text: "Operator approval has unlocked the bounded command packet for export. / 操作員批准後，受控指令封包已可匯出。"
  },
  exported: {
    badge: "Exported / 已匯出",
    text: "The demo export is complete; the command packet remains visible for audit. / 展示用匯出完成，指令封包保留供審核。"
  }
};

const taskQueueByState = {
  idle: [
    ["active", "Mission intake / 任務輸入", "Select a scenario, review the prompt, and run analysis."],
    ["pending", "Target gate / 目標檢核", "Coordinates, AOI, and GSD are validated next."],
    ["locked", "Fleet scoring / 衛星評分", "No satellite is evaluated before target validation."],
    ["locked", "Plan approval / 計畫批准", "Approval remains disabled until a valid plan exists."],
    ["locked", "Command packet / 指令封包", "Command export is locked before approval."],
    ["pending", "Setup cards / 展示設定", "Fleet sandbox and map display can be opened anytime."]
  ],
  blocked: [
    ["done", "Intake parsed / 輸入已解析", "The request is understood at the intent level."],
    ["blocked", "Target gate / 目標檢核", "Provide address, coordinates, or map AOI."],
    ["locked", "AOI and access / 區域與可見性", "Access windows wait for a resolvable target."],
    ["locked", "Fleet readiness / 衛星可用性", "No spacecraft is scored before geolocation."],
    ["locked", "Plan approval / 計畫批准", "Approval stays disabled."],
    ["locked", "Command packet / 指令封包", "No command packet is generated yet."]
  ],
  planned: [
    ["done", "Target validated / 目標已驗證", "AOI and imaging requirements are clear."],
    ["done", "Fleet scored / 衛星已評估", "Payload, battery, state, and conflicts are visible."],
    ["done", "Decision generated / 決策已產生", "Candidate trade-offs are explainable."],
    ["active", "Review plan / 審核計畫", "Inspect timeline and selected asset before approval."],
    ["pending", "Approve plan / 批准計畫", "Operator approval is the manual gate."],
    ["locked", "Command packet / 指令封包", "Locked until approval."]
  ],
  approved: [
    ["done", "Plan approved / 計畫已批准", "The operator gate has been passed."],
    ["active", "Inspect commands / 檢查指令", "Review ADCS, payload, and data commands."],
    ["active", "Export packet / 匯出封包", "Use export for the demo handoff."],
    ["done", "Safety visible / 安全可審核", "Battery, conflicts, and command boundary remain visible."],
    ["done", "No propulsion / 無推進", "This demo stays within non-propulsive tasking."],
    ["done", "No interruption / 不打斷任務", "Protected missions are not overwritten."]
  ],
  exported: [
    ["done", "Packet exported / 封包已匯出", "Demo export feedback has been shown."],
    ["done", "Audit ready / 可供稽核", "The command packet remains visible."],
    ["done", "Boundary preserved / 邊界保留", "Only approved command families are included."],
    ["done", "Flight stack separate / 飛行系統分離", "Vendor binary telecommands remain outside this demo."],
    ["done", "Operator trace / 操作員紀錄", "Approval remains the explicit gate."],
    ["done", "Delivery staged / 交付已排程", "Data delivery is represented as queued downlink."]
  ]
};

function mapAssetPath(file) {
  return window.location.protocol === "file:" ? `public/${file}` : `/${file}`;
}

function clampPresentationStep(index) {
  return Math.max(0, Math.min(presentationPanels.length - 1, index));
}

function stepHintFromPanel(panel) {
  const helper =
    panel.querySelector(".input-helper") ||
    panel.querySelector(".panel-subtitle") ||
    panel.querySelector(".map-heading p") ||
    panel.querySelector(".clarification-box p") ||
    panel.querySelector(".recommended-asset span:last-child") ||
    panel.querySelector(".boundary-card p");

  return helper?.textContent?.trim() || "Review this card before moving to the next step. / 檢查這張卡片後再進入下一步。";
}

function renderPresentationFlow() {
  let currentGroup = "";
  operatorProgress.innerHTML = presentationSteps
    .map(
      ({ key, phase, group, title, detail }, index) => {
        const groupLabel = group !== currentGroup ? `<div class="flow-section-label">${group}</div>` : "";
        currentGroup = group;
        return `
          ${groupLabel}
          <button class="progress-step" type="button" data-step="${key}" data-panel-index="${index}">
            <span>${phase}</span>
            <strong>${title}</strong>
            <small>${detail}</small>
          </button>
        `;
      }
    )
    .join("");

  progressSteps = Array.from(operatorProgress.querySelectorAll(".progress-step"));
  progressSteps.forEach((step) => {
    step.addEventListener("click", () => goToPresentationStep(Number(step.dataset.panelIndex)));
  });
}

function isSetupStep(index) {
  return presentationSteps[index]?.key === "setup";
}

function workflowProgressForState(state = currentWorkflowState) {
  return workflowProgressByState[state] || workflowProgressByState.idle;
}

function isPresentationStepAvailable(index, state = currentWorkflowState) {
  const progress = workflowProgressForState(state);
  return isSetupStep(index) || index <= progress.availableThrough;
}

function presentationStepCount(setup) {
  return presentationSteps.filter((_, index) => isSetupStep(index) === setup).length;
}

function presentationStepOrdinal(index) {
  const setup = isSetupStep(index);
  return presentationSteps.slice(0, index + 1).filter((_, stepIndex) => isSetupStep(stepIndex) === setup).length;
}

function presentationStepBadge(index) {
  if (isSetupStep(index)) {
    return `Setup ${presentationStepOrdinal(index)} of ${presentationStepCount(true)} / 展示設定 ${presentationStepOrdinal(index)}/${presentationStepCount(true)}`;
  }

  return `Mission Step ${presentationStepOrdinal(index)} of ${presentationStepCount(false)} / 任務第 ${presentationStepOrdinal(index)} 步，共 ${presentationStepCount(false)} 步`;
}

function nearestAvailableStep(fromIndex, direction) {
  const activeSetup = isSetupStep(fromIndex);
  for (let index = fromIndex + direction; index >= 0 && index < presentationPanels.length; index += direction) {
    if (!isPresentationStepAvailable(index)) continue;
    if (activeSetup !== isSetupStep(index)) continue;
    return index;
  }
  return null;
}

function syncPresentationFlowClasses(state) {
  const progress = workflowProgressForState(state);

  progressSteps.forEach((step) => {
    const index = Number(step.dataset.panelIndex);
    const setup = presentationSteps[index]?.key === "setup";
    const locked = !setup && index > progress.availableThrough;
    step.classList.toggle("complete", index <= progress.completeThrough);
    step.classList.toggle("active", index === activePresentationStepIndex);
    step.classList.toggle("blocked", index === progress.blockedIndex);
    step.classList.toggle("locked", locked);
    step.classList.toggle("presentation-current", index === activePresentationStepIndex);
    step.disabled = locked;
  });
}

function updatePresentationStep() {
  if (!presentationPanels.length) return;

  activePresentationStepIndex = clampPresentationStep(activePresentationStepIndex);

  presentationPanels.forEach((panel, index) => {
    const isActive = index === activePresentationStepIndex;
    panel.classList.toggle("active-step", isActive);
    panel.setAttribute("aria-hidden", presentationModeEnabled && !isActive ? "true" : "false");
  });

  const activePanel = presentationPanels[activePresentationStepIndex];
  const step = presentationSteps[activePresentationStepIndex];
  const title = activePanel.querySelector(".panel-heading h2")?.textContent?.trim() || step.title;
  const label = activePanel.dataset.phaseLabel || `${step.phase} ${step.title}`;

  currentStepBadge.textContent = presentationStepBadge(activePresentationStepIndex);
  currentStepTitle.textContent = `${label} · ${title}`;
  currentStepHint.textContent = stepHintFromPanel(activePanel);

  prevStepButton.disabled = nearestAvailableStep(activePresentationStepIndex, -1) === null;
  const isRequestStep = step.key === "request";
  nextStepButton.textContent = isRequestStep
    ? analysisInProgress
      ? "Analyzing / 分析中"
      : "Analyze & Continue / 分析並下一步"
    : "Next / 下一步";
  nextStepButton.disabled = analysisInProgress || (!isRequestStep && nearestAvailableStep(activePresentationStepIndex, 1) === null);
  analyzeButton.disabled = analysisInProgress;
  analyzeButton.textContent = analysisInProgress ? "Analyzing / 分析中" : "Analyze Request / 分析需求";

  syncPresentationFlowClasses(currentWorkflowState);
}

function goToPresentationStep(index) {
  const targetIndex = clampPresentationStep(index);
  if (!isPresentationStepAvailable(targetIndex)) {
    syncPresentationFlowClasses(currentWorkflowState);
    return;
  }

  activePresentationStepIndex = targetIndex;
  updatePresentationStep();
}

function goToWorkflowStep(stepKey) {
  goToPresentationStep(workflowStepToPanel[stepKey] ?? 0);
}

function setPresentationMode(enabled) {
  presentationModeEnabled = enabled;
  document.body.classList.toggle("presentation-mode", enabled);
  document.body.classList.toggle("dashboard-mode", !enabled);
  dashboardModeToggle.textContent = enabled
    ? "Show Full Dashboard / 展示完整 Dashboard"
    : "Step-by-Step Demo / 回到逐步展演";
  updatePresentationStep();
}

function renderAnalysisStages(activeIndex = -1, state = "idle") {
  if (!analysisStageList) return;

  analysisStageList.innerHTML = analysisStages
    .map((label, index) => {
      const status =
        state === "failed" && index === activeIndex
          ? "failed"
          : state === "complete" || index < activeIndex
            ? "done"
            : index === activeIndex
              ? "active"
              : "pending";
      return `<li class="${status}"><span>${index + 1}</span><strong>${label}</strong></li>`;
    })
    .join("");
}

function setAnalysisProgress(index, label, state = "active") {
  if (!analysisProgress) return;

  const clamped = Math.max(0, Math.min(analysisStages.length - 1, Number(index) || 0));
  analysisProgress.classList.remove("hidden", "failed", "complete");
  analysisProgress.classList.toggle("failed", state === "failed");
  analysisProgress.classList.toggle("complete", state === "complete");
  analysisProgressLabel.textContent = label || analysisStages[clamped];
  const pct = state === "complete" ? 100 : Math.round(((clamped + 1) / analysisStages.length) * 100);
  analysisProgressFill.style.width = `${pct}%`;
  renderAnalysisStages(clamped, state);
}

function resetAnalysisProgress() {
  analysisFailed = false;
  if (!analysisProgress) return;
  analysisProgress.classList.add("hidden");
  analysisProgress.classList.remove("failed", "complete");
  analysisProgressLabel.textContent = "Analyzing with LLM / 正在使用 LLM 分析";
  analysisProgressFill.style.width = "0%";
  renderAnalysisStages();
}

function scenarioMapPreset(scenarioKey) {
  if (scenarioKey === "construction") return "construction";
  if (scenarioKey === "custom") return "custom";
  return "wildfire";
}

function scenarioMapViewKey(scenarioKey) {
  if (scenarioKey === "construction") return "construction";
  if (scenarioKey === "custom") return "custom";
  return "wildfire";
}

function localApiBase() {
  return window.location.protocol === "file:" ? "https://innospace-demo.vercel.app" : "";
}

function apiUrl(path) {
  const base = localApiBase();
  return base ? `${base}${path}` : path;
}

function hasTargetCoordinates(target = activeCustomTarget) {
  return Number.isFinite(Number(target?.location?.lat)) && Number.isFinite(Number(target?.location?.lng));
}

function cleanDisplayText(value, fallback = "Custom AOI") {
  const text = String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 120) : fallback;
}

function formatCoordinatePair(lat, lng) {
  const latValue = Number(lat);
  const lngValue = Number(lng);
  const latSuffix = latValue >= 0 ? "N" : "S";
  const lngSuffix = lngValue >= 0 ? "E" : "W";
  return `${Math.abs(latValue).toFixed(4)} deg ${latSuffix}, ${Math.abs(lngValue).toFixed(4)} deg ${lngSuffix}`;
}

function targetRefFromTarget(target) {
  const ascii = String(target?.label || target?.query || "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();

  if (ascii) return `CUSTOM-AOI-${ascii.slice(0, 30)}`;
  if (hasTargetCoordinates(target)) {
    const lat = Math.abs(Number(target.location.lat) * 100).toFixed(0);
    const lng = Math.abs(Number(target.location.lng) * 100).toFixed(0);
    return `CUSTOM-AOI-${lat}-${lng}`;
  }
  return "CUSTOM-AOI";
}

function baseMapViewForKey(viewKey) {
  if (viewKey === "wildfire" && activeResolvedTarget?.scenario === "wildfire" && hasTargetCoordinates(activeResolvedTarget)) {
    const label = cleanDisplayText(activeResolvedTarget.label || activeResolvedTarget.query, "wildfire AOI");
    return {
      ...mapLiveViews.wildfire,
      center: [Number(activeResolvedTarget.location.lat), Number(activeResolvedTarget.location.lng)],
      googleStatus: `Google Maps: ${label} / Google 地圖：語意解析 AOI`,
      freeStatus: `Free map: ${label} / 免費地圖：語意解析 AOI`,
      dynamic: true,
      markerLabel: "F"
    };
  }

  if (viewKey === "construction" && activeResolvedTarget?.scenario === "construction" && hasTargetCoordinates(activeResolvedTarget)) {
    const label = cleanDisplayText(activeResolvedTarget.label || activeResolvedTarget.query, "construction AOI");
    return {
      ...mapLiveViews.construction,
      center: [Number(activeResolvedTarget.location.lat), Number(activeResolvedTarget.location.lng)],
      googleStatus: `Google Maps: ${label} / Google 地圖：工地 AOI`,
      freeStatus: `Free map: ${label} / 免費地圖：工地 AOI`,
      dynamic: true,
      markerLabel: "C"
    };
  }

  if (viewKey === "custom" && hasTargetCoordinates()) {
    const label = cleanDisplayText(activeCustomTarget.label || activeCustomTarget.query);
    const isHazard = activeCustomTarget.need?.type === "hazard_response";
    return {
      center: [Number(activeCustomTarget.location.lat), Number(activeCustomTarget.location.lng)],
      zoom: isHazard ? 11 : 13,
      googleMapType: isHazard ? "terrain" : "hybrid",
      googleStatus: `Google Maps: ${label} / Google 地圖：自訂目標`,
      freeStatus: `Free map: ${label} / 免費地圖：自訂目標`,
      simplePreset: "custom",
      dynamic: true,
      markerLabel: "T"
    };
  }

  return mapLiveViews[viewKey] || mapLiveViews.wildfire;
}

function clampMapZoom(zoom) {
  return Math.max(3, Math.min(18, Math.round(Number(zoom) || 7)));
}

function mapViewForKey(viewKey) {
  const base = baseMapViewForKey(viewKey);
  const override = mapViewOverrides[viewKey];

  if (!override) return { ...base, zoom: clampMapZoom(base.zoom) };

  return {
    ...base,
    center: override.center || base.center,
    zoom: clampMapZoom(override.zoom ?? base.zoom)
  };
}

function setMapViewOverride(viewKey, patch) {
  const current = mapViewForKey(viewKey);
  mapViewOverrides[viewKey] = {
    center: patch.center || current.center,
    zoom: clampMapZoom(patch.zoom ?? current.zoom)
  };
}

function resetMapViewOverride(viewKey = scenarioMapViewKey(activeScenario)) {
  delete mapViewOverrides[viewKey];
}

function activeMapViewKey() {
  return scenarioMapViewKey(activeScenario);
}

function syncMapScaleBadge() {
  const view = mapViewForKey(activeMapViewKey());
  const sourceLabel =
    selectedMapImageSource === "osm"
      ? "Free map"
      : selectedMapImageSource === "google"
        ? "Google"
        : selectedMapImageSource === "simple"
          ? "Simplified"
          : "Auto";
  mapScaleBadge.textContent = `${sourceLabel} · Zoom ${view.zoom} / 比例 ${view.zoom}`;
}

function clearMissionMapImage(status = "Auto scenario imagery / 自動情境底圖") {
  activeMapImageToken += 1;
  missionMap.classList.remove("has-image");
  missionMap.classList.remove("has-osm");
  missionMap.classList.remove("has-osm-tiles");
  clearOsmTileLayer();
  missionMap.style.removeProperty("--map-image");
  missionMap.style.removeProperty("--map-position");
  missionMap.style.removeProperty("--map-size");
  osmMapFrame.classList.add("hidden");
  osmMapFrame.removeAttribute("src");
  mapImageStatus.textContent = status;
  syncMapScaleBadge();
}

function googleStaticMapUrl(viewKey) {
  const url = new URL(`${localApiBase()}/api/map-image`, window.location.href);
  const view = mapViewForKey(viewKey);
  const [lat, lng] = view.center;

  url.searchParams.set("scenario", viewKey);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("label", view.markerLabel || viewKey.slice(0, 1));
  url.searchParams.set("zoom", String(view.zoom));
  url.searchParams.set("maptype", view.googleMapType || "terrain");

  return url.toString();
}

function setMapBackground(url, status, position = "center") {
  missionMap.classList.remove("has-image");
  missionMap.classList.remove("has-osm");
  missionMap.classList.remove("has-osm-tiles");
  clearOsmTileLayer();
  osmMapFrame.classList.add("hidden");
  osmMapFrame.removeAttribute("src");
  missionMap.classList.add("has-image");
  missionMap.style.setProperty("--map-image", `url("${url}")`);
  missionMap.style.setProperty("--map-position", selectedMapImageSource === "simple" ? simpleMapBackgroundPosition(position) : position);
  missionMap.style.setProperty("--map-size", selectedMapImageSource === "simple" ? simpleMapBackgroundSize() : "cover");
  mapImageStatus.textContent = status;
  syncMapScaleBadge();
  syncAoiOverlay();
}

function applySimpleScenarioMap(scenarioKey = activeScenario, statusPrefix = "") {
  const preset = mapImagePresets[scenarioMapPreset(scenarioKey)];

  if (!preset) {
    clearMissionMapImage();
    return;
  }

  const status = statusPrefix ? `${statusPrefix} ${preset.status}` : preset.status;
  setMapBackground(mapAssetPath(preset.file), status, preset.position);
}

function simpleMapBackgroundSize() {
  const baseZoom = baseMapViewForKey(activeMapViewKey()).zoom;
  const view = mapViewForKey(activeMapViewKey());
  const scale = Math.max(100, Math.min(260, 100 + (view.zoom - baseZoom) * 22));
  return `${scale}%`;
}

function simpleMapBackgroundPosition(fallbackPosition = "center") {
  const viewKey = activeMapViewKey();
  const base = baseMapViewForKey(viewKey);
  const view = mapViewForKey(viewKey);
  const [baseLat, baseLng] = base.center;
  const [viewLat, viewLng] = view.center;
  const baseWorld = latLngToWorldPixels(baseLat, baseLng, view.zoom);
  const viewWorld = latLngToWorldPixels(viewLat, viewLng, view.zoom);
  const deltaX = Math.round(baseWorld.x - viewWorld.x);
  const deltaY = Math.round(baseWorld.y - viewWorld.y);

  if (!deltaX && !deltaY) return fallbackPosition;
  return `calc(50% + ${deltaX}px) calc(50% + ${deltaY}px)`;
}

function probeMapImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const image = new Image();
    let settled = false;
    const timeout = window.setTimeout(() => finish(false), 4200);
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve(ok);
    };

    image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0);
    image.onerror = () => finish(false);
  image.src = url;
  });
}

async function tryMapProvider({ token, url, status, loadingStatus }) {
  mapImageStatus.textContent = loadingStatus;
  const ok = await probeMapImage(url);
  if (token !== activeMapImageToken) return true;
  if (!ok) return false;
  setMapBackground(url, status, "center");
  return true;
}

function osmTileUrl(zoom, x, y) {
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

function latLngToTile(lat, lng, zoom) {
  const point = latLngToTilePoint(lat, lng, zoom);
  return { x: Math.floor(point.x), y: Math.floor(point.y) };
}

function latLngToTilePoint(lat, lng, zoom) {
  const scale = 2 ** zoom;
  const x = ((lng + 180) / 360) * scale;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  return { x, y };
}

function latLngToWorldPixels(lat, lng, zoom) {
  const tile = latLngToTilePoint(lat, lng, zoom);
  return { x: tile.x * 256, y: tile.y * 256 };
}

function worldPixelsToLatLng(x, y, zoom) {
  const scale = 256 * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return [Math.max(-85, Math.min(85, lat)), ((lng + 540) % 360) - 180];
}

function activeAoiGeometry() {
  if (activeScenario === "custom" && hasTargetCoordinates(activeCustomTarget)) {
    const isHazard = activeCustomTarget.need?.type === "hazard_response";
    return {
      center: [Number(activeCustomTarget.location.lat), Number(activeCustomTarget.location.lng)],
      widthM: isHazard ? 16000 : 1800,
      heightM: isHazard ? 10000 : 1200,
      minWidth: isHazard ? 96 : 64,
      maxWidth: isHazard ? 460 : 260,
      minHeight: isHazard ? 68 : 48,
      maxHeight: isHazard ? 300 : 190
    };
  }

  if (activeScenario === "construction") {
    const center =
      activeResolvedTarget?.scenario === "construction" && hasTargetCoordinates(activeResolvedTarget)
        ? [Number(activeResolvedTarget.location.lat), Number(activeResolvedTarget.location.lng)]
        : mapLiveViews.construction.center;
    return {
      center,
      widthM: 260,
      heightM: 170,
      minWidth: 70,
      maxWidth: 360,
      minHeight: 52,
      maxHeight: 260
    };
  }

  const center =
    activeResolvedTarget?.scenario === "wildfire" && hasTargetCoordinates(activeResolvedTarget)
      ? [Number(activeResolvedTarget.location.lat), Number(activeResolvedTarget.location.lng)]
      : mapLiveViews.wildfire.center;
  return {
    center,
    widthM: 210000,
    heightM: 105000,
    minWidth: 90,
    maxWidth: 520,
    minHeight: 58,
    maxHeight: 320
  };
}

function metersPerPixelAt(lat, zoom) {
  return (156543.03392 * Math.cos((Number(lat) * Math.PI) / 180)) / 2 ** zoom;
}

function clampPixelSize(value, min, max) {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function syncAoiOverlay() {
  if (!mapTarget || mapTarget.classList.contains("hidden")) return;

  const view = mapViewForKey(activeMapViewKey());
  const geometry = activeAoiGeometry();
  const [targetLat, targetLng] = geometry.center;
  const [viewLat, viewLng] = view.center;
  const targetWorld = latLngToWorldPixels(targetLat, targetLng, view.zoom);
  const viewWorld = latLngToWorldPixels(viewLat, viewLng, view.zoom);
  const mapWidth = missionMap.clientWidth || 900;
  const mapHeight = missionMap.clientHeight || 520;
  const x = mapWidth / 2 + (targetWorld.x - viewWorld.x);
  const y = mapHeight / 2 + (targetWorld.y - viewWorld.y);
  const metersPerPixel = metersPerPixelAt(targetLat, view.zoom);
  const width = clampPixelSize(geometry.widthM / metersPerPixel, geometry.minWidth, geometry.maxWidth);
  const height = clampPixelSize(geometry.heightM / metersPerPixel, geometry.minHeight, geometry.maxHeight);
  const outside = x < -width || x > mapWidth + width || y < -height || y > mapHeight + height;

  mapTarget.style.setProperty("--aoi-x", `${Math.round(x)}px`);
  mapTarget.style.setProperty("--aoi-y", `${Math.round(y)}px`);
  mapTarget.style.setProperty("--aoi-width", `${width}px`);
  mapTarget.style.setProperty("--aoi-height", `${height}px`);
  mapTarget.classList.toggle("out-of-view", outside);
}

function clearOsmTileLayer() {
  missionMap.querySelector(".osm-tile-layer")?.remove();
}

function renderOsmTileLayer(viewKey) {
  const view = mapViewForKey(viewKey);
  const [lat, lng] = view.center;
  const zoom = view.zoom;
  const centerTile = latLngToTilePoint(lat, lng, zoom);
  const layer = document.createElement("div");
  layer.className = "osm-tile-layer";

  const columns = Math.max(4, Math.ceil((missionMap.clientWidth || 900) / 256) + 2);
  const rows = Math.max(3, Math.ceil((missionMap.clientHeight || 520) / 256) + 2);
  const startX = Math.floor(centerTile.x - columns / 2);
  const startY = Math.floor(centerTile.y - rows / 2);
  const centerOffsetX = Math.round((centerTile.x - startX) * 256);
  const centerOffsetY = Math.round((centerTile.y - startY) * 256);

  layer.style.gridTemplateColumns = `repeat(${columns}, 256px)`;
  layer.style.gridTemplateRows = `repeat(${rows}, 256px)`;
  layer.style.width = `${columns * 256}px`;
  layer.style.height = `${rows * 256}px`;
  layer.style.left = "50%";
  layer.style.top = "50%";
  layer.style.transform = `translate(${-centerOffsetX}px, ${-centerOffsetY}px)`;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const image = document.createElement("img");
      image.alt = "";
      image.decoding = "async";
      image.src = osmTileUrl(zoom, startX + column, startY + row);
      layer.append(image);
    }
  }

  clearOsmTileLayer();
  missionMap.classList.remove("has-image");
  missionMap.classList.remove("has-osm");
  missionMap.classList.add("has-osm-tiles");
  missionMap.style.removeProperty("--map-image");
  missionMap.style.removeProperty("--map-position");
  missionMap.style.removeProperty("--map-size");
  osmMapFrame.classList.add("hidden");
  osmMapFrame.removeAttribute("src");
  missionMap.prepend(layer);
  syncMapScaleBadge();
  syncAoiOverlay();
}

async function tryFreeMapProvider({ token, viewKey, status, loadingStatus }) {
  const view = mapViewForKey(viewKey);
  const [lat, lng] = view.center;
  const centerTile = latLngToTile(lat, lng, view.zoom);
  mapImageStatus.textContent = loadingStatus;
  const ok = await probeMapImage(osmTileUrl(view.zoom, centerTile.x, centerTile.y));
  if (token !== activeMapImageToken) return true;
  if (!ok) return false;
  renderOsmTileLayer(viewKey);
  mapImageStatus.textContent = status;
  return true;
}

function syncMapSourceControls() {
  if (mapImageSelect.value !== selectedMapImageSource) {
    mapImageSelect.value = selectedMapImageSource;
  }

  mapModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mapSource === selectedMapImageSource);
  });
}

function setMapImageSource(source) {
  selectedMapImageSource = source;
  syncMapSourceControls();
  updateMapImageFromCurrentState();
}

async function applyMissionMapImage(scenarioKey = activeScenario, options = {}) {
  const forceBlankAuto = Boolean(options.forceBlankAuto);
  const token = ++activeMapImageToken;
  const viewKey = scenarioMapViewKey(scenarioKey);
  const view = mapViewForKey(viewKey);

  syncMapSourceControls();

  if (forceBlankAuto && selectedMapImageSource === "auto") {
    clearMissionMapImage("Target unresolved: map waits for address or AOI / 目標未解析：地圖等待地址或 AOI");
    return;
  }

  if (selectedMapImageSource === "upload") {
    if (uploadedMapImageUrl) {
      setMapBackground(uploadedMapImageUrl, `Uploaded: ${uploadedMapImageName} / 已上傳影像`, "center");
      return;
    }

    clearMissionMapImage("No uploaded image selected / 尚未選擇上傳影像");
    return;
  }

  if (selectedMapImageSource === "simple" || mapImagePresets[selectedMapImageSource]) {
    applySimpleScenarioMap(scenarioKey);
    return;
  }

  const googleUrl = googleStaticMapUrl(viewKey);

  if (selectedMapImageSource === "google" || selectedMapImageSource === "auto") {
    const googleOk = await tryMapProvider({
      token,
      url: googleUrl,
      status: view.googleStatus,
      loadingStatus: "Checking Google Maps for this scenario / 正在測試此情境的 Google 地圖"
    });
    if (googleOk) return;
  }

  if (selectedMapImageSource === "osm" || selectedMapImageSource === "google" || selectedMapImageSource === "auto") {
    const freeOk = await tryFreeMapProvider({
      token,
      viewKey,
      status: view.freeStatus,
      loadingStatus: "Google unavailable; checking free map / Google 不可用，正在測試免費地圖"
    });
    if (freeOk) return;
  }

  if (token === activeMapImageToken) {
    applySimpleScenarioMap(scenarioKey, "Live maps unavailable; using simplified image. / 即時地圖不可用，切換簡化圖。");
  }
}

function updateMapImageFromCurrentState() {
  if (missionMap.classList.contains("idle")) {
    if (selectedMapImageSource === "auto") {
      clearMissionMapImage();
      return;
    }

    applyMissionMapImage(activeScenario);
    return;
  }

  if (activeScenario === "construction" && !constructionResolved) {
    applyMissionMapImage(activeScenario, { forceBlankAuto: true });
    return;
  }

  if (activeScenario === "custom" && currentWorkflowState === "blocked" && !activeCustomTarget) {
    clearMissionMapImage("Custom target unresolved: map waits for GPS, address, or AOI / 自訂目標未解析：地圖等待 GPS、地址或 AOI");
    return;
  }

  applyMissionMapImage(activeScenario);
}

function changeMapZoom(delta) {
  if (missionMap.classList.contains("idle")) return;
  const viewKey = activeMapViewKey();
  const view = mapViewForKey(viewKey);
  setMapViewOverride(viewKey, { center: view.center, zoom: view.zoom + delta });
  syncAoiOverlay();
  updateMapImageFromCurrentState();
}

function resetCurrentMapView() {
  resetMapViewOverride(activeMapViewKey());
  syncAoiOverlay();
  updateMapImageFromCurrentState();
}

function panMapByPixels(deltaX, deltaY) {
  if (missionMap.classList.contains("idle")) return;
  const viewKey = activeMapViewKey();
  const view = mapViewForKey(viewKey);
  const [lat, lng] = view.center;
  const world = latLngToWorldPixels(lat, lng, view.zoom);
  const nextCenter = worldPixelsToLatLng(world.x - deltaX, world.y - deltaY, view.zoom);
  setMapViewOverride(viewKey, { center: nextCenter, zoom: view.zoom });
  syncAoiOverlay();
  updateMapImageFromCurrentState();
}

function mapPointerTargetIsControl(event) {
  return Boolean(event.target.closest("button, input, select, textarea, .map-navigation-controls"));
}

function beginMapDrag(event) {
  if (missionMap.classList.contains("idle") || mapPointerTargetIsControl(event)) return;
  mapDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };
  lastMapDragMoved = false;
  missionMap.classList.add("dragging");
  missionMap.setPointerCapture?.(event.pointerId);
}

function updateMapDrag(event) {
  if (!mapDragState || mapDragState.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - mapDragState.startX;
  const deltaY = event.clientY - mapDragState.startY;
  mapDragState.moved = Math.abs(deltaX) + Math.abs(deltaY) > 8;
}

function endMapDrag(event) {
  if (!mapDragState || mapDragState.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - mapDragState.startX;
  const deltaY = event.clientY - mapDragState.startY;
  const shouldPan = mapDragState.moved;
  lastMapDragMoved = shouldPan;
  mapDragState = null;
  missionMap.classList.remove("dragging");
  missionMap.releasePointerCapture?.(event.pointerId);

  if (shouldPan) {
    panMapByPixels(deltaX, deltaY);
  }
}

function zoomMapFromWheel(event) {
  if (missionMap.classList.contains("idle") || mapPointerTargetIsControl(event)) return;
  event.preventDefault();
  changeMapZoom(event.deltaY < 0 ? 1 : -1);
}

function mapAssetNamesFromPlan(planSource, fallbackNames = []) {
  const cards = planSource?.cards || planSource?.satellites || [];
  const cardNames = cards.map((card) => card.name).filter(Boolean);
  return cardNames.length ? cardNames : fallbackNames;
}

function selectedAssetNamesFromPlan(planSource) {
  return planSource?.command?.selected_assets || [];
}

function clearMapAssetLayer() {
  mapTracks.forEach((track) => track.remove());
  mapSatellites.forEach((satellite) => satellite.remove());
  mapTracks = [];
  mapSatellites = [];
}

function renderMapAssets(assetNames = [], selectedAssetNames = [], visible = true) {
  clearMapAssetLayer();

  if (!assetNames.length) {
    return;
  }

  const selectedSet = new Set(selectedAssetNames);

  mapTracks = assetNames.map((name, index) => {
    const geometry = mapTrackGeometries[index % mapTrackGeometries.length];
    const track = document.createElement("div");
    track.className = `track${visible ? "" : " hidden"}`;
    track.style.top = geometry.top;
    track.style.left = "-8%";
    track.style.transform = `rotate(${geometry.rotate})`;
    track.style.width = "116%";
    track.dataset.sat = name;
    missionMap.append(track);
    return track;
  });

  mapSatellites = assetNames.map((name, index) => {
    const position = mapSatellitePositions[index % mapSatellitePositions.length];
    const satellite = document.createElement("button");
    satellite.type = "button";
    satellite.className = `satellite${selectedSet.has(name) ? " selected" : ""}${visible ? "" : " hidden"}`;
    satellite.dataset.sat = name;
    satellite.style.top = position.top;
    satellite.style.left = position.left;
    satellite.textContent = name;
    missionMap.append(satellite);
    return satellite;
  });
}

const suitabilityModel = [
  {
    title: "Orbit & Geometry / 軌道與幾何",
    detail: "Access window, revisit timing, off-nadir angle, slew demand, and swath overlap with the AOI."
  },
  {
    title: "Attitude Agility / 姿態機動能力",
    detail: "Whether the spacecraft can slew off-nadir far enough, settle quickly enough, and keep ADCS energy inside the battery reserve."
  },
  {
    title: "Payload Fit / 感測器適配",
    detail: "Optical, multispectral, thermal IR, or SAR suitability; achievable GSD, spectral mode, and scene size."
  },
  {
    title: "Spacecraft Health / 衛星健康",
    detail: "Battery state of charge, post-task power margin, thermal margin, storage availability, and safe-mode exclusions."
  },
  {
    title: "Operational Conflict / 任務衝突",
    detail: "Existing mission priority, protected windows, required attitude recovery time, and whether a new task may preempt." 
  },
  {
    title: "Delivery Path / 資料交付",
    detail: "Onboard storage, next downlink window, available data rate, and whether a crosslink or relay path is needed."
  }
];

const commandBoundaryModel = [
  {
    title: "Generated by this layer / 本系統會產生",
    detail: "Validated intent, ADCS commands, camera commands, data/ground commands, time-tagged execution sequence, and operator-review packet."
  },
  {
    title: "Operator-gated / 需額外批准",
    detail: "Propulsion maneuvers, safe-mode recovery actions, and any crosslink or relay plan that affects other spacecraft."
  },
  {
    title: "Left to mission stack / 留給任務系統",
    detail: "Vendor-specific binary telecommands, final CCSDS framing, RF scheduling, and flight-certified uplink release."
  }
];

const groundStations = [
  {
    name: "KSAT Svalbard",
    region: "Arctic high-latitude / 北極高緯度",
    bands: ["X_BAND", "S_BAND"],
    nextContactUtc: "14:48 UTC",
    durationMin: 9,
    dataRateMbps: 150,
    conflictStatus: "clear",
    compatibleSatellites: ["SAT-A", "SAT-B", "SAT-01", "SAT-03", "SAT-06", "CUSTOM-01", "CUSTOM-03"]
  },
  {
    name: "Alaska Ground Network",
    region: "North America polar pass / 北美極軌通過",
    bands: ["X_BAND"],
    nextContactUtc: "15:06 UTC",
    durationMin: 7,
    dataRateMbps: 110,
    conflictStatus: "clear",
    compatibleSatellites: ["SAT-B", "SAT-C", "CUSTOM-01", "CUSTOM-02"]
  },
  {
    name: "Taiwan NSPO S-band",
    region: "Taiwan regional support / 台灣區域支援",
    bands: ["S_BAND"],
    nextContactUtc: "03:18 UTC",
    durationMin: 6,
    dataRateMbps: 24,
    conflictStatus: "clear",
    compatibleSatellites: ["CUSTOM-01", "CUSTOM-03", "CUSTOM-04"]
  },
  {
    name: "Wallops X-band",
    region: "US East Coast / 美國東岸",
    bands: ["X_BAND", "S_BAND"],
    nextContactUtc: "16:22 UTC",
    durationMin: 8,
    dataRateMbps: 95,
    conflictStatus: "maintenance watch",
    compatibleSatellites: ["SAT-01", "SAT-03", "SAT-08"]
  }
];

function commandEntry({ subsystem, command, parameters = {}, precondition, stateTransition, powerImpact, dataCustody, text }) {
  return { subsystem, command, parameters, precondition, stateTransition, powerImpact, dataCustody, text };
}

function chooseGroundStation(assetNames = [], scenarioKey = activeScenario) {
  const selected = new Set(assetNames);
  const candidates = groundStations
    .filter((station) => station.conflictStatus !== "blocked")
    .filter((station) => station.compatibleSatellites.some((satellite) => selected.has(satellite)))
    .sort((a, b) => {
      const priorityA = scenarioKey === "custom" && a.name.includes("Taiwan") ? -1 : 0;
      const priorityB = scenarioKey === "custom" && b.name.includes("Taiwan") ? -1 : 0;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return b.dataRateMbps - a.dataRateMbps;
    });

  return candidates[0] || null;
}

function groundStationSummary(station) {
  if (!station) return "No compatible ground station window; store onboard and wait for the next pass. / 無適配地面站窗口，先存星上等待下一站。";
  return `${station.name} (${station.bands.join("/")}, ${station.nextContactUtc}, ${station.durationMin} min, ${station.dataRateMbps} Mbps)`;
}

function downlinkCommandEntries(productRef, assetNames, scenarioKey = activeScenario) {
  const station = chooseGroundStation(assetNames, scenarioKey);

  if (!station) {
    return [
      commandEntry({
        subsystem: "Data/Ground / 資料與地面段",
        command: "PAYLOAD_STORE_IMAGE",
        parameters: { product_ref: productRef },
        precondition: "Image captured and quality metadata attached.",
        stateTransition: "Imaging -> Onboard Storage",
        powerImpact: "Storage only; no transmitter power draw.",
        dataCustody: "Product remains onboard until a compatible ground pass is found."
      }),
      commandEntry({
        subsystem: "Data/Ground / 資料與地面段",
        command: "STORE_ONBOARD_AND_WAIT_NEXT_PASS",
        parameters: { product_ref: productRef, reason: "no compatible ground station" },
        precondition: "No station matches satellite band, schedule, and conflict constraints.",
        stateTransition: "Onboard Storage -> Delivery Hold",
        powerImpact: "No RF downlink energy this orbit.",
        dataCustody: "Ground workflow receives a waiting-for-contact status only."
      })
    ];
  }

  return [
    commandEntry({
      subsystem: "Data/Ground / 資料與地面段",
      command: "PAYLOAD_STORE_IMAGE",
      parameters: { product_ref: productRef },
      precondition: "Capture completed and onboard storage margin confirmed.",
      stateTransition: "Imaging -> Product Staging",
      powerImpact: "Storage write only; RF transmitter remains off.",
      dataCustody: "Product is held onboard before the selected contact."
    }),
    commandEntry({
      subsystem: "Data/Ground / 資料與地面段",
      command: "COMMS_SCHEDULE_DOWNLINK",
      parameters: { product_ref: productRef, ground_station: station.name, contact_utc: station.nextContactUtc },
      precondition: "Ground station band, duration, conflict state, and selected satellite are compatible.",
      stateTransition: "Product Staging -> Downlink Scheduled",
      powerImpact: "RF power budget reserved for the contact window.",
      dataCustody: `Custody remains onboard until ${station.name} acquisition of signal.`
    }),
    commandEntry({
      subsystem: "Data/Ground / 資料與地面段",
      command: "COMMS_DOWNLINK_TO_STATION",
      parameters: { product_ref: productRef, ground_station: station.name, band: station.bands[0], data_rate_mbps: station.dataRateMbps },
      precondition: `${station.name} contact is active and no higher-priority downlink preempts it.`,
      stateTransition: "Downlink Scheduled -> Ground Received",
      powerImpact: `Transmitter active for up to ${station.durationMin} min.`,
      dataCustody: `Custody transfers to ${station.name} ground storage.`
    }),
    commandEntry({
      subsystem: "Data/Ground / 資料與地面段",
      command: "COMMS_CONFIRM_RECEIPT",
      parameters: { product_ref: productRef, ground_station: station.name },
      precondition: "Checksum and product manifest validate on ground.",
      stateTransition: "Ground Received -> Delivery Workflow",
      powerImpact: "No spacecraft power impact after receipt confirmation.",
      dataCustody: "Ground workflow can deliver the product to the requester."
    })
  ];
}

const defaultCustomSatellites = [
  { orbit: "SSO", battery: 78, position: "Ascending pass east of target AOI", payload: "optical", status: "nominal", requiredSlewDeg: 22, maxSlewDeg: 35, slewRateDegS: 0.18 },
  { orbit: "SSO", battery: 54, position: "Descending pass west of target", payload: "thermal_ir", status: "nominal", requiredSlewDeg: 31, maxSlewDeg: 28, slewRateDegS: 0.11 },
  { orbit: "LEO", battery: 38, position: "Approaching target in 18 min", payload: "sar", status: "busy", requiredSlewDeg: 16, maxSlewDeg: 45, slewRateDegS: 0.22 },
  { orbit: "GEO", battery: 82, position: "Pacific relay view", payload: "communications", status: "nominal", requiredSlewDeg: 4, maxSlewDeg: 12, slewRateDegS: 0.04 }
];

const orbitOptions = ["SSO", "LEO", "MEO", "GEO"];
const payloadOptions = [
  ["optical", "Optical imaging / 光學拍照"],
  ["multispectral", "Multispectral / 多光譜"],
  ["thermal_ir", "Thermal IR / 熱紅外"],
  ["sar", "SAR / 合成孔徑雷達"],
  ["communications", "Communications relay / 通訊中繼"]
];
const statusOptions = [
  ["nominal", "LVLH nominal / LVLH 正常飛行"],
  ["targeting", "Target pointing / 目標指向中"],
  ["busy", "Existing mission / 既有任務中"],
  ["safe", "Safe mode / 安全模式"]
];

const payloadLabels = Object.fromEntries(payloadOptions);
const statusLabels = Object.fromEntries(statusOptions);

function optionMarkup(options, selected) {
  return options
    .map((option) => {
      const value = Array.isArray(option) ? option[0] : option;
      const label = Array.isArray(option) ? option[1] : option;
      return `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`;
    })
    .join("");
}

function readCurrentCustomSatellites() {
  return [...customSatelliteEditor.querySelectorAll(".custom-sat-row")].map((row, index) => ({
    orbit: row.querySelector("[data-field='orbit']")?.value || defaultCustomSatellites[index % defaultCustomSatellites.length].orbit,
    battery: Number(row.querySelector("[data-field='battery']")?.value || 60),
    position: row.querySelector("[data-field='position']")?.value || defaultCustomSatellites[index % defaultCustomSatellites.length].position,
    payload: row.querySelector("[data-field='payload']")?.value || defaultCustomSatellites[index % defaultCustomSatellites.length].payload,
    status: row.querySelector("[data-field='status']")?.value || defaultCustomSatellites[index % defaultCustomSatellites.length].status,
    requiredSlewDeg: Number(row.querySelector("[data-field='requiredSlewDeg']")?.value || defaultCustomSatellites[index % defaultCustomSatellites.length].requiredSlewDeg),
    maxSlewDeg: Number(row.querySelector("[data-field='maxSlewDeg']")?.value || defaultCustomSatellites[index % defaultCustomSatellites.length].maxSlewDeg),
    slewRateDegS: Number(row.querySelector("[data-field='slewRateDegS']")?.value || defaultCustomSatellites[index % defaultCustomSatellites.length].slewRateDegS)
  }));
}

function renderCustomEditor() {
  const count = Math.max(1, Math.min(12, Number(customSatelliteCount.value) || 1));
  customSatelliteCount.value = count;
  const current = readCurrentCustomSatellites();
  const rows = Array.from({ length: count }, (_, index) => current[index] || defaultCustomSatellites[index % defaultCustomSatellites.length]);

  customSatelliteEditor.innerHTML = rows
    .map(
      (sat, index) => `
        <article class="custom-sat-row">
          <h3>CUSTOM-${String(index + 1).padStart(2, "0")}</h3>
          <div class="custom-sat-grid">
            <label>
              Orbit / 軌道類型
              <select data-field="orbit">${optionMarkup(orbitOptions, sat.orbit)}</select>
            </label>
            <label>
              Battery % / 電量
              <input data-field="battery" type="number" min="0" max="100" value="${sat.battery}" />
            </label>
            <label>
              Payload / 酬載類型
              <select data-field="payload">${optionMarkup(payloadOptions, sat.payload)}</select>
            </label>
            <label>
              Status / 衛星狀態
              <select data-field="status">${optionMarkup(statusOptions, sat.status)}</select>
            </label>
            <label>
              Required slew deg / 需要轉向角
              <input data-field="requiredSlewDeg" type="number" min="0" max="70" step="1" value="${sat.requiredSlewDeg}" />
            </label>
            <label>
              Max slew deg / 最大轉向角
              <input data-field="maxSlewDeg" type="number" min="0" max="80" step="1" value="${sat.maxSlewDeg}" />
            </label>
            <label>
              Slew rate deg/s / 轉向速度
              <input data-field="slewRateDegS" type="number" min="0.01" max="1" step="0.01" value="${sat.slewRateDegS}" />
            </label>
            <label class="wide-field">
              Rough position / 粗略位置
              <input data-field="position" type="text" value="${sat.position}" />
            </label>
          </div>
        </article>
      `
    )
    .join("");
}

function getCustomSatellites() {
  return readCurrentCustomSatellites().map((sat, index) => ({
    id: `CUSTOM-${String(index + 1).padStart(2, "0")}`,
    ...sat,
    battery: Math.max(0, Math.min(100, Number(sat.battery) || 0)),
    requiredSlewDeg: Math.max(0, Math.min(70, Number(sat.requiredSlewDeg) || 0)),
    maxSlewDeg: Math.max(0, Math.min(80, Number(sat.maxSlewDeg) || 0)),
    slewRateDegS: Math.max(0.01, Math.min(1, Number(sat.slewRateDegS) || 0.01))
  }));
}

function estimateSlew(sat) {
  const requiredSlewDeg = Math.max(0, Number(sat.requiredSlewDeg) || 0);
  const maxSlewDeg = Math.max(0, Number(sat.maxSlewDeg) || 0);
  const slewRateDegS = Math.max(0.01, Number(sat.slewRateDegS) || 0.01);
  const slewTimeS = Math.ceil(requiredSlewDeg / slewRateDegS);
  const settleS = Math.max(60, Math.ceil(requiredSlewDeg * 5));
  const adcsEnergyPct = Math.round((1.6 + requiredSlewDeg * 0.16 + slewTimeS / 220) * 10) / 10;
  const payloadEnergyPct = sat.payload === "communications" ? 1.2 : sat.payload === "sar" ? 5.2 : 2.4;
  const totalEnergyPct = Math.round((adcsEnergyPct + payloadEnergyPct) * 10) / 10;
  const batteryAfterTask = Math.round((sat.battery - totalEnergyPct) * 10) / 10;

  return {
    requiredSlewDeg,
    maxSlewDeg,
    slewRateDegS,
    slewTimeS,
    settleS,
    adcsEnergyPct,
    payloadEnergyPct,
    totalEnergyPct,
    batteryAfterTask,
    canSlew: requiredSlewDeg <= maxSlewDeg
  };
}

function evaluateCustomSatellite(sat, scenarioKey) {
  const desired =
    scenarioKey === "construction"
      ? ["optical", "multispectral"]
      : scenarioKey === "custom"
        ? ["optical", "multispectral", "thermal_ir", "sar"]
        : ["optical", "thermal_ir", "sar"];
  let score = 0;
  const reasons = [];
  let relayOnly = false;
  const slew = estimateSlew(sat);

  if (desired.includes(sat.payload)) {
    score += sat.payload === "optical" ? 4 : 2;
    reasons.push(`${payloadLabels[sat.payload]} matches the sensing need.`);
  } else if (sat.payload === "communications") {
    relayOnly = true;
    score += scenarioKey === "wildfire" ? 1 : 0;
    reasons.push("Communications payload can support delivery, but cannot perform imaging.");
  } else {
    score -= 2;
    reasons.push(`${payloadLabels[sat.payload]} is not the preferred payload for this request.`);
  }

  if (sat.battery >= 55) {
    score += 3;
    reasons.push(`Battery ${sat.battery}% leaves a safe task margin.`);
  } else if (sat.battery >= 35) {
    score += 1;
    reasons.push(`Battery ${sat.battery}% is usable but should be monitored.`);
  } else {
    score -= 4;
    reasons.push(`Battery ${sat.battery}% is below the safe planning threshold.`);
  }

  if (slew.canSlew) {
    score += slew.requiredSlewDeg <= 25 ? 3 : 1;
    reasons.push(`Attitude agility can cover ${slew.requiredSlewDeg} deg off-nadir within a ${slew.maxSlewDeg} deg limit.`);
  } else {
    score -= 5;
    reasons.push(`Required ${slew.requiredSlewDeg} deg slew exceeds the ${slew.maxSlewDeg} deg attitude limit.`);
  }

  if (slew.slewTimeS <= 180) {
    score += 2;
    reasons.push(`Slew completes in ${Math.round(slew.slewTimeS / 60)} min, fast enough for responsive capture.`);
  } else if (slew.slewTimeS <= 420) {
    score += 1;
    reasons.push(`Slew needs ${Math.round(slew.slewTimeS / 60)} min, acceptable but not fastest.`);
  } else {
    score -= 2;
    reasons.push(`Slew needs ${Math.round(slew.slewTimeS / 60)} min, too slow for urgent response.`);
  }

  if (slew.batteryAfterTask >= 30) {
    score += 2;
    reasons.push(`Estimated task energy ${slew.totalEnergyPct}% leaves ${slew.batteryAfterTask}% battery after capture.`);
  } else {
    score -= 4;
    reasons.push(`Estimated task energy ${slew.totalEnergyPct}% would leave only ${slew.batteryAfterTask}% battery.`);
  }

  if (sat.status === "nominal") {
    score += 2;
    reasons.push("Status is LVLH nominal and available for new tasking.");
  } else if (sat.status === "targeting") {
    score += 1;
    reasons.push("Already in target-pointing state, but recovery timing must be checked.");
  } else if (sat.status === "busy") {
    score -= 3;
    reasons.push("Existing mission is active; avoid interruption unless operator approves.");
  } else if (sat.status === "safe") {
    score -= 6;
    reasons.push("Safe mode prevents normal mission tasking.");
  }

  if (sat.orbit === "SSO") {
    score += 2;
    reasons.push("SSO is a strong fit for repeatable EO geometry.");
  } else if (sat.orbit === "LEO") {
    score += 1;
    reasons.push("LEO can support responsive tasking with pass-dependent timing.");
  } else if (sat.orbit === "GEO" && sat.payload === "communications") {
    score += 2;
    reasons.push("GEO relay geometry is useful for delivery support.");
  } else {
    score -= 1;
    reasons.push(`${sat.orbit} is less ideal for this EO imaging task.`);
  }

  if (/target|aoi|near|approach|over/i.test(sat.position)) {
    score += 1;
    reasons.push("Rough position suggests useful access geometry.");
  }

  const executable = !relayOnly && sat.status !== "safe" && desired.includes(sat.payload) && slew.canSlew && slew.batteryAfterTask >= 25;
  const tone = executable && score >= 7 ? "good" : executable ? "warn" : "bad";
  const title = executable && score >= 7 ? "Recommended" : executable ? "Feasible with trade-off" : relayOnly ? "Relay support only" : "Rejected by constraint";

  return { sat, score, reasons, executable, tone, title, relayOnly, slew };
}

function extractCustomTargetQuery(prompt) {
  const source = String(prompt || "").trim();
  const cleaned = source
    .replace(/[，。！？、,.!?]/g, " ")
    .replace(/\b(use|my|custom|constellation|fleet|satellite|satellites|reported|report|request|need|to|as|soon|possible|image|imagery|monitor|detect|observe|acquire|scan|survey|for|over|near|around|the|a|an|please|drill|test|slew|off-nadir|off nadir|include)\b/gi, " ")
    .replace(/請|幫我|使用|自訂|星系|衛星|需要|要求|回報|發生|檢測|偵測|掃描|拍攝|監測|觀測|取得|針對|快速|盡快|土石流|山崩|森林大火|山火|火災|施工|工地|狀況/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || source;
}

function addUniqueCandidate(candidates, value) {
  const text = cleanDisplayText(value, "").replace(/\bcandidate AOI\b/gi, "").trim();
  if (!text || /unspecified|ambiguous|operator-defined custom/i.test(text)) return;
  if (!candidates.some((candidate) => candidate.toLowerCase() === text.toLowerCase())) {
    candidates.push(text);
  }
}

function semanticTargetCandidates(prompt, llmResult = null, scenarioKey = activeScenario) {
  const raw = String(prompt || "").trim();
  const candidates = [];
  addUniqueCandidate(candidates, llmResult?.intent?.target_resolution?.label);

  if (/阿里山|alishan/i.test(raw)) addUniqueCandidate(candidates, "Alishan Township, Chiayi County, Taiwan");
  if (/落基山|洛磯山|rocky/i.test(raw)) addUniqueCandidate(candidates, "Rocky Mountains");
  if (/華盛頓|washington|d\.c\./i.test(raw)) addUniqueCandidate(candidates, "Washington, DC, USA");

  const locationAfterIn = raw.match(/\b(?:in|near|over|around)\s+([^.;，。]+)/i);
  if (locationAfterIn?.[1]) addUniqueCandidate(candidates, locationAfterIn[1]);

  addUniqueCandidate(candidates, extractCustomTargetQuery(raw));
  if (scenarioKey !== "construction" || !/\bthis site\b|這裡|這個地點|該地點/i.test(raw)) {
    addUniqueCandidate(candidates, raw);
  }

  return candidates;
}

async function requestBestGeocode(candidates) {
  for (const candidate of candidates) {
    const result = await requestGeocode(candidate);
    if (result?.result?.location) {
      return { ...result, query_candidate: candidate };
    }
  }

  return candidates.length ? await requestGeocode(candidates[0]) : null;
}

function inferCustomObservationNeed(prompt) {
  const text = String(prompt || "").toLowerCase();

  if (/土石流|山崩|landslide|debris|mudslide/.test(text)) {
    return {
      type: "hazard_response",
      mission: "Debris-flow / landslide detection / 土石流與坡地災害偵測",
      gsd: "3.0 m optical or multispectral rapid mapping / 3.0 公尺光學或多光譜快速判讀",
      payload: "optical, multispectral, SAR if cloud risk is high",
      cadence: "once, with optional follow-up after operator approval"
    };
  }

  if (/wildfire|forest fire|山火|火災|森林大火/.test(text)) {
    return {
      type: "hazard_response",
      mission: "Wildfire response imaging / 火災應變拍攝",
      gsd: "3.0 m optical overview, thermal IR optional / 3.0 公尺光學概覽，可搭配熱紅外",
      payload: "optical or thermal_ir",
      cadence: "once, urgent"
    };
  }

  if (/construction|工地|施工|build|site/.test(text)) {
    return {
      type: "monitoring",
      mission: "Site monitoring / 場址監測",
      gsd: "0.5-1.0 m optical repeatability / 0.5 到 1.0 公尺光學一致性拍攝",
      payload: "optical",
      cadence: "repeatable"
    };
  }

  return {
    type: "custom_imaging",
    mission: "Custom off-nadir imaging / 自訂斜視拍攝",
    gsd: "1.0-3.0 m depending on payload and access geometry / 依酬載與可見幾何決定 1.0 到 3.0 公尺",
    payload: "best available imaging payload",
    cadence: "once"
  };
}

function buildCustomTarget(prompt, geocodeResult, llmResult = null) {
  const query = cleanDisplayText(geocodeResult?.query_candidate || semanticTargetCandidates(prompt, llmResult, "custom")[0] || extractCustomTargetQuery(prompt), "Custom target");
  const result = geocodeResult?.result;
  const lat = Number(result?.location?.lat);
  const lng = Number(result?.location?.lng);
  const need = inferCustomObservationNeed(prompt);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const label = cleanDisplayText(result.formatted_address || query);
    const target = {
      status: "resolved",
      label,
      query: cleanDisplayText(query, label),
      source: geocodeResult?.source || "fallback",
      location: { lat, lng },
      need
    };
    target.ref = targetRefFromTarget(target);
    return target;
  }

  return {
    status: "unresolved",
    label: cleanDisplayText(query, "Custom target"),
    query: cleanDisplayText(query, "Custom target"),
    source: geocodeResult?.source || "none",
    warning: geocodeResult?.warning || "Target could not be converted into coordinates.",
    need
  };
}

function buildResolvedTarget(prompt, geocodeResult, llmResult = null, scenarioKey = activeScenario) {
  const query = cleanDisplayText(
    geocodeResult?.query_candidate || semanticTargetCandidates(prompt, llmResult, scenarioKey)[0] || extractCustomTargetQuery(prompt),
    scenarioKey === "wildfire" ? "wildfire AOI" : "mission AOI"
  );
  const result = geocodeResult?.result;
  const lat = Number(result?.location?.lat);
  const lng = Number(result?.location?.lng);
  const need = inferCustomObservationNeed(prompt);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const target = {
    status: "resolved",
    scenario: scenarioKey,
    label: cleanDisplayText(result.formatted_address || query),
    query,
    source: geocodeResult?.source || "fallback",
    location: { lat, lng },
    need
  };
  target.ref = targetRefFromTarget(target);
  return target;
}

function mapDefinedConstructionTarget() {
  const view = mapViewForKey("construction");
  const [lat, lng] = view.center;
  const target = {
    status: "resolved",
    scenario: "construction",
    label: "Map-defined construction AOI",
    query: "map-defined AOI",
    source: "map",
    location: { lat, lng },
    need: inferCustomObservationNeed(missionPrompt.value)
  };
  target.ref = targetRefFromTarget(target);
  return target;
}

function commandWithResolvedTarget(command, target, fallbackRef = "TARGET-AOI") {
  if (!command || !hasTargetCoordinates(target)) return command;
  const packet = JSON.parse(JSON.stringify(command));
  const targetRef = target.ref || fallbackRef;

  packet.target = {
    ...(packet.target || {}),
    label: target.label,
    center_lat: target.location.lat,
    center_lon: target.location.lng,
    geometry: target.need?.type === "hazard_response" ? "regional_area" : packet.target?.geometry || "point",
    target_ref: targetRef
  };

  for (const sequence of packet.sequences || []) {
    if (sequence.parameters?.target_ref) {
      sequence.parameters.target_ref = targetRef;
    }
  }

  return packet;
}

function customIntentEntries(target) {
  if (!target || target.status !== "resolved") {
    return [
      ["Mission type / 任務類型", target?.need?.mission || "Custom task / 自訂任務"],
      ["Target resolution / 目標解析", `Unresolved from: ${target?.query || "mission prompt"} / 無法轉成可執行座標`],
      ["System action / 系統動作", "Request clearer address, GPS coordinates, or a map-defined AOI / 要求更清楚地址、GPS 座標或地圖框選 AOI"],
      ["Planning state / 規劃狀態", "Paused before satellite tasking / 在衛星任務規劃前暫停"]
    ];
  }

  return [
    ["Mission type / 任務類型", target.need.mission],
    ["Geolocation / 地理解析", `${target.label} resolved to ${target.location.lat.toFixed(4)} deg, ${target.location.lng.toFixed(4)} deg / 已解析為可執行座標`],
    ["Requested AOI / 需求區域", `${target.query} / 使用者輸入目標`],
    ["Recommended GSD / 建議 GSD", target.need.gsd],
    ["Payload policy / 酬載策略", `${target.need.payload} / 依任務需求選擇可用感測器`],
    ["Attitude policy / 姿態策略", "Allow target pointing when required slew, settle time, and post-task battery remain inside limits / 轉向角、穩定時間與任務後電量皆安全才允許斜視拍攝"]
  ];
}

function buildCustomConstellationPlan(scenarioKey, target = null) {
  const evaluations = getCustomSatellites()
    .map((sat) => evaluateCustomSatellite(sat, scenarioKey))
    .sort((a, b) => b.score - a.score);
  const best = evaluations.find((item) => item.executable);
  const targetLabel = cleanDisplayText(target?.label, "operator-defined AOI");
  const missionLabel =
    scenarioKey === "construction"
      ? "site monitoring"
      : scenarioKey === "custom"
        ? `${targetLabel} off-nadir imaging`
        : "emergency imaging";

  const cards = evaluations.map(({ sat, tone, reasons, slew }) => ({
    name: sat.id,
    role: `${payloadLabels[sat.payload]} / ${sat.orbit}`,
    tone,
    metrics: [
      `Battery ${sat.battery}% / 電量 ${sat.battery}%`,
      `Slew ${slew.requiredSlewDeg} deg of ${slew.maxSlewDeg} deg limit / 轉向 ${slew.requiredSlewDeg} 度，上限 ${slew.maxSlewDeg} 度`,
      `Slew time ${Math.round(slew.slewTimeS / 60)} min + settle ${Math.round(slew.settleS / 60)} min / 轉向加穩定時間`,
      `Task energy ${slew.totalEnergyPct}% -> battery ${slew.batteryAfterTask}% / 任務後電量`,
      `Position: ${sat.position} / 粗略位置`,
      `Status: ${statusLabels[sat.status]} / 狀態`,
      `Planner note: ${reasons[0]}`
    ],
    footer: reasons.slice(1, 3).join(" ") || "Custom asset is available for rough testing."
  }));

  const decisions = evaluations.map(({ sat, title, reasons, tone, slew }) => [
    sat.id,
    title,
    `${reasons.join(" ")} Slew trade-off: ${slew.requiredSlewDeg} deg required, ${Math.round(slew.slewTimeS / 60)} min slew, ${slew.totalEnergyPct}% estimated task energy.`,
    tone
  ]);

  if (!best) {
    return {
      executable: false,
      constellationLabel: `${evaluations.length} custom satellites / ${evaluations.length} 顆自訂衛星`,
      cards,
      decisions,
      recommendedAsset: {
        title: "No executable imaging satellite / 無可執行拍攝衛星",
        note: "At least one non-safe imaging payload with sufficient battery is required. 通訊衛星可輔助下行，但不能取代拍攝酬載。"
      },
      timeline: [
        {
          time: "Planning hold / 規劃暫停",
          detail: "Custom constellation does not contain a currently executable imaging asset.",
          fromState: "Planning",
          toState: "Clarification",
          commands: [
            { subsystem: "Planner / 規劃器", text: "Adjust payload type, battery, status, slew limit, slew rate, or rough position and analyze again." }
          ]
        }
      ],
      command: null
    };
  }

  const captureMode = scenarioKey === "construction" ? "OPTICAL_REPEATABILITY" : scenarioKey === "custom" ? "CUSTOM_OFF_NADIR_IMAGING" : "RESPONSIVE_IMAGING";
  const targetRef = scenarioKey === "construction" ? "CUSTOM-SITE-AOI" : scenarioKey === "custom" ? targetRefFromTarget(target) : "CUSTOM-URGENT-AOI";
  const bestSlew = best.slew;

  return {
    executable: true,
    constellationLabel: `${evaluations.length} custom satellites / ${evaluations.length} 顆自訂衛星`,
    cards,
    decisions,
    recommendedAsset: {
      title: best.sat.id,
      note: `${best.sat.id} is selected for ${missionLabel} because it can slew ${bestSlew.requiredSlewDeg} deg within limits, settle in time, and remain at ${bestSlew.batteryAfterTask}% battery after tasking.`
    },
    timeline: [
      {
        time: "T+00 min",
        detail: `Prepare ${best.sat.id} for ${missionLabel}.`,
        fromState: statusLabels[best.sat.status].split(" /")[0],
        toState: "Slew Planning",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_SET_MODE",
            parameters: { from_mode: statusLabels[best.sat.status].split(" /")[0], to_mode: "SLEW_PLANNING" },
            precondition: "Custom target is geolocated and operator sandbox fleet is active.",
            stateTransition: `${statusLabels[best.sat.status].split(" /")[0]} -> Slew Planning`,
            powerImpact: "No slew energy consumed until ADCS_SLEW_TO_AOI.",
            dataCustody: "No product exists yet."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_CONFIGURE",
            parameters: { payload_family: best.sat.payload, mode: captureMode },
            precondition: `${payloadLabels[best.sat.payload]} is compatible with the custom mission need.`,
            stateTransition: "Payload Standby -> Capture Configured",
            powerImpact: "Configuration only; capture power held until pointing is stable.",
            dataCustody: "Custom product metadata is allocated."
          })
        ]
      },
      {
        time: `T+${Math.max(1, Math.round(bestSlew.slewTimeS / 60))} min`,
        detail: "Rotate off-nadir and wait for attitude settle.",
        fromState: "Slew Planning",
        toState: "Target Pointing",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_SLEW_TO_AOI",
            parameters: { target_ref: targetRef, slew_deg: bestSlew.requiredSlewDeg, slew_rate_deg_s: best.sat.slewRateDegS, settle_s: bestSlew.settleS },
            precondition: `Required ${bestSlew.requiredSlewDeg} deg slew is within the ${bestSlew.maxSlewDeg} deg spacecraft limit.`,
            stateTransition: "Slew Planning -> Target Pointing",
            powerImpact: `ADCS energy ${bestSlew.adcsEnergyPct}%; projected after task ${bestSlew.batteryAfterTask}%.`,
            dataCustody: "No product exists before imaging."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_POWER_ON",
            parameters: { payload_family: best.sat.payload },
            precondition: "Target-pointing stability is confirmed.",
            stateTransition: "Capture Configured -> Camera Ready",
            powerImpact: `Payload energy ${bestSlew.payloadEnergyPct}% reserved.`,
            dataCustody: "Product metadata remains onboard."
          })
        ]
      },
      {
        time: `T+${Math.max(3, Math.round((bestSlew.slewTimeS + bestSlew.settleS) / 60))} min`,
        detail: "Execute the custom observation window.",
        fromState: "Target Pointing",
        toState: "Imaging",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_TRACK_TARGET",
            parameters: { target_ref: targetRef, duration_s: 90 },
            precondition: "Target pointing is inside approved off-nadir and settle limits.",
            stateTransition: "Target Pointing -> Imaging",
            powerImpact: "Tracking power remains inside custom task budget.",
            dataCustody: "Data still onboard."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_CAPTURE",
            parameters: { target_ref: targetRef, mode: captureMode, product_ref: `CUSTOM-${best.sat.id}-PRODUCT` },
            precondition: "Camera is powered and AOI geometry is resolved.",
            stateTransition: "Camera Ready -> Imaging",
            powerImpact: "Capture energy included in task estimate.",
            dataCustody: "Custom product is created onboard."
          })
        ]
      },
      {
        time: `T+${Math.max(6, Math.round((bestSlew.slewTimeS + bestSlew.settleS) / 60) + 3)} min`,
        detail: "Recover and stage data delivery.",
        fromState: "Imaging",
        toState: "LVLH Recovery",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_RETURN_LVLH",
            parameters: { recovery_profile: "configured_nominal" },
            precondition: "Capture complete and no follow-on target approved.",
            stateTransition: "Imaging -> LVLH Recovery",
            powerImpact: "Recovery energy included in projected post-task battery.",
            dataCustody: "Product remains onboard until compatible ground pass."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_POWER_OFF",
            parameters: { payload_family: best.sat.payload },
            precondition: "Payload no longer needed after capture.",
            stateTransition: "Imaging -> Payload Standby",
            powerImpact: "Reduces payload draw.",
            dataCustody: "No change to product custody."
          }),
          ...downlinkCommandEntries(`CUSTOM-${best.sat.id}-PRODUCT`, [best.sat.id], "custom")
        ]
      }
    ],
    command: {
      schema_version: "mission-command-packet.v0.2",
      mission_id: `CUSTOM-${scenarioKey.toUpperCase()}-001`,
      mission_type: scenarioKey === "construction" ? "custom_recurring_site_monitoring" : scenarioKey === "custom" ? "custom_off_nadir_imaging_drill" : "custom_responsive_imaging",
      operator_gate: "required",
      target: target?.status === "resolved"
        ? {
            label: target.label,
            center_lat: target.location.lat,
            center_lon: target.location.lng,
            geometry: target.need?.type === "hazard_response" ? "regional_area" : "point",
            target_ref: targetRef
          }
        : { label: targetLabel, geometry: "unknown", target_ref: targetRef },
      planning_requirements: {
        payload_family: target?.need?.payload || "best available imaging payload",
        recommended_gsd: target?.need?.gsd || "mission-dependent",
        preserve_existing_missions: true,
        operator_gate_required: true
      },
      selected_assets: [best.sat.id],
      custom_constellation: getCustomSatellites(),
      sequences: [
        {
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_SET_MODE",
          parameters: {
            from_mode: statusLabels[best.sat.status].split(" /")[0],
            to_mode: "SLEW_PLANNING"
          }
        },
        {
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_SLEW_TO_AOI",
          parameters: {
            target_ref: targetRef,
            rough_position: best.sat.position,
            orbit_type: best.sat.orbit,
            required_slew_deg: bestSlew.requiredSlewDeg,
            max_slew_deg: bestSlew.maxSlewDeg,
            slew_rate_deg_s: best.sat.slewRateDegS,
            estimated_slew_time_s: bestSlew.slewTimeS,
            settle_s: bestSlew.settleS
          }
        },
        {
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_TRACK_TARGET",
          parameters: { target_ref: targetRef, duration_s: 90 }
        },
        {
          dispatch: "time_tagged_sequence",
          subsystem: "CAMERA",
          command: "CAMERA_POWER_ON",
          parameters: { payload_family: best.sat.payload }
        },
        {
          dispatch: "time_tagged_sequence",
          subsystem: "CAMERA",
          command: "CAMERA_CONFIGURE",
          parameters: { payload_family: best.sat.payload, mode: captureMode, gsd_m: target?.need?.type === "hazard_response" ? 3 : 1 }
        },
        {
          dispatch: "time_tagged_sequence",
          subsystem: "CAMERA",
          command: "CAMERA_CAPTURE",
          parameters: { target_ref: targetRef, payload_family: best.sat.payload, mode: captureMode, product_ref: `CUSTOM-${best.sat.id}-PRODUCT` }
        },
        {
          dispatch: "post_capture_sequence",
          subsystem: "DATA_GROUND",
          command: "PAYLOAD_STORE_IMAGE",
          parameters: { product_ref: `CUSTOM-${best.sat.id}-PRODUCT` }
        },
        {
          dispatch: "post_capture_sequence",
          subsystem: "DATA_GROUND",
          command: chooseGroundStation([best.sat.id], "custom") ? "COMMS_SCHEDULE_DOWNLINK" : "STORE_ONBOARD_AND_WAIT_NEXT_PASS",
          parameters: chooseGroundStation([best.sat.id], "custom")
            ? { product_ref: `CUSTOM-${best.sat.id}-PRODUCT`, ground_station: chooseGroundStation([best.sat.id], "custom").name }
            : { product_ref: `CUSTOM-${best.sat.id}-PRODUCT`, reason: "no compatible ground station" }
        },
        {
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_RETURN_LVLH",
          parameters: { recovery_profile: "configured_nominal" }
        }
      ],
      safety: {
        input_battery_pct: best.sat.battery,
        estimated_adcs_energy_pct: bestSlew.adcsEnergyPct,
        estimated_payload_energy_pct: bestSlew.payloadEnergyPct,
        estimated_task_energy_pct: bestSlew.totalEnergyPct,
        estimated_battery_after_task_pct: bestSlew.batteryAfterTask,
        slew_within_capability: bestSlew.canSlew,
        propulsion_required: false,
        crosslink_required: false,
        generated_from_custom_constellation: true
      }
    }
  };
}

const scenarios = {
  wildfire: {
    prompt: "A wildfire has been reported in the Rocky Mountains. Acquire optical imagery as soon as possible.",
    constellation: "3 SSO satellites / 3 顆 SSO 衛星",
    intent: [
      ["Mission type / 任務類型", "Urgent disaster response / 緊急災害應變"],
      ["Geolocation / 地理解析", "Rocky Mountains search region resolved to regional AOI / 已將落基山區域解析為可執行 AOI"],
      ["Derived target / 目標區域", "Representative AOI center: 39.18 deg N, 106.82 deg W / 代表中心點已建立"],
      ["Recommended GSD / 建議 GSD", "3.0 m optical overview / 適合快速態勢判讀的光學成像"],
      ["Planning policy / 任務策略", "Prioritize fastest valid optical capture without interrupting protected missions / 優先選擇最快且不打斷既有任務的合法方案"]
    ],
    satellites: [
      {
        name: "SAT-A",
        role: "Optical wide-area / 廣域光學遙測",
        tone: "warn",
        metrics: [
          "Access 14:24 UTC / 最早可見 14:24 UTC",
          "Needs 29 deg slew, 4 min settle / 需轉向 29 度並穩定 4 分鐘",
          "Projected GSD 3.8 m / 解析度略低於建議",
          "Battery 31% -> 22% / 電量餘裕偏窄",
          "Storage 18 GB free / 儲存仍足夠"
        ],
        footer: "Fastest access, but power reserve is weak."
      },
      {
        name: "SAT-B",
        role: "Agile VHR optical / 高機動高解析光學星",
        tone: "good",
        metrics: [
          "Access 14:32 UTC / 最早可見 14:32 UTC",
          "Slew 18 deg in 2 min, safe ADCS margin / 2 分鐘完成 18 度轉向",
          "Projected GSD 2.7 m / 符合需求",
          "Battery 73% -> 67% / 任務後仍安全",
          "No protected schedule conflict / 無既有任務衝突"
        ],
        footer: "Recommended asset for this request."
      },
      {
        name: "SAT-C",
        role: "Thermal IR fire analytics / 熱紅外火點監測",
        tone: "bad",
        metrics: [
          "Access 14:29 UTC / 幾何條件良好",
          "Can slew 12 deg, but protected pointing window active / 可轉向 12 度但既有指向任務受保護",
          "Payload useful for hotspots / 載荷適合熱點判讀",
          "Existing high-priority task / 既有高優先任務保護中",
          "Not selected for requested optical capture / 不符合此筆光學任務主需求"
        ],
        footer: "Rejected by conflict and request mismatch."
      }
    ],
    decisions: [
      ["SAT-A", "Feasible with trade-off", "Fastest access and can slew to the AOI, but the 29 deg maneuver plus imaging would leave only 22% battery and image quality is slightly below target.", "warn"],
      ["SAT-B", "Recommended", "Best combined fit across GSD, battery safety, 18 deg slew demand, 2 min slew time, and lack of schedule conflict.", "good"],
      ["SAT-C", "Rejected by constraint", "Thermal imagery is operationally relevant and the slew is feasible, but this pass is locked by a protected mission and does not satisfy the requested optical capture alone.", "bad"]
    ],
    timeline: [
      {
        time: "14:20 UTC",
        detail: "Prepare the selected spacecraft for emergency imaging.",
        fromState: "LVLH",
        toState: "Target Acquisition",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_SET_MODE",
            parameters: { from_mode: "LVLH", to_mode: "TARGET_ACQUISITION" },
            precondition: "Operator-approved urgent AOI exists and protected tasks remain untouched.",
            stateTransition: "LVLH -> Target Acquisition",
            powerImpact: "ADCS mode change only; slew energy checked in next command.",
            dataCustody: "No product exists yet."
          }),
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_SLEW_TO_AOI",
            parameters: { target_ref: "WF-AOI-001", slew_deg: 18, settle_s: 300 },
            precondition: "SAT-B battery margin remains above 60% after maneuver and imaging.",
            stateTransition: "Target Acquisition -> Target Pointing",
            powerImpact: "Estimated ADCS energy 3.4%; post-task battery 67%.",
            dataCustody: "No downlink action before capture."
          })
        ]
      },
      {
        time: "14:25 UTC",
        detail: "Lock the pointing geometry and ready the payload.",
        fromState: "Target Acquisition",
        toState: "Target Pointing",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_TRACK_TARGET",
            parameters: { target_ref: "WF-AOI-001", duration_s: 420 },
            precondition: "Attitude settle timer completed inside off-nadir tolerance.",
            stateTransition: "Target Pointing -> Target Pointing",
            powerImpact: "Wheel activity remains inside emergency imaging budget.",
            dataCustody: "Capture window is open but product is not generated yet."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_POWER_ON",
            parameters: { payload_family: "optical" },
            precondition: "Pointing lock achieved; thermal and power margins safe.",
            stateTransition: "Standby -> Camera Ready",
            powerImpact: "Camera startup budget reserved before exposure.",
            dataCustody: "Mission product ID WF-2026-001 is allocated."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_CONFIGURE",
            parameters: { mode: "OPTICAL_EMERGENCY", gsd_m: 3, calibration_profile: "WF_FAST" },
            precondition: "Optical payload powered and configured by bounded profile only.",
            stateTransition: "Camera Ready -> Capture Configured",
            powerImpact: "Configuration has negligible incremental power draw.",
            dataCustody: "Collection metadata is attached before capture."
          })
        ]
      },
      {
        time: "14:32 UTC",
        detail: "Execute the observation event.",
        fromState: "Target Pointing",
        toState: "Imaging",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_TRACK_TARGET",
            parameters: { target_ref: "WF-AOI-001", duration_s: 90 },
            precondition: "Capture timing is inside the approved access window.",
            stateTransition: "Target Pointing -> Imaging",
            powerImpact: "No extra slew beyond approved tracking window.",
            dataCustody: "Ground has no custody until the image is stored and downlinked."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_CAPTURE",
            parameters: { target_ref: "WF-AOI-001", gsd_m: 3, product_ref: "WF-2026-001-OPTICAL" },
            precondition: "Camera configured and target geometry held.",
            stateTransition: "Capture Configured -> Imaging",
            powerImpact: "Payload capture energy included in 67% post-task battery estimate.",
            dataCustody: "Product is created onboard."
          })
        ]
      },
      {
        time: "14:34 UTC",
        detail: "Stage the product for delivery.",
        fromState: "Imaging",
        toState: "Product Staging",
        commands: downlinkCommandEntries("WF-2026-001-OPTICAL", ["SAT-B"], "wildfire")
      },
      {
        time: "14:36 UTC",
        detail: "Return the spacecraft to its protected nominal profile.",
        fromState: "Product Staging",
        toState: "LVLH Recovery",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_RETURN_LVLH",
            parameters: { verify_wheel_momentum: true },
            precondition: "Capture and product staging completed.",
            stateTransition: "Product Staging -> LVLH Recovery",
            powerImpact: "Recovery slew included in remaining ADCS budget.",
            dataCustody: "Product custody follows the selected ground-station plan."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_POWER_OFF",
            parameters: { payload_family: "optical" },
            precondition: "No follow-on capture has been approved.",
            stateTransition: "Imaging -> Payload Standby",
            powerImpact: "Reduces payload draw after capture.",
            dataCustody: "No change to stored product custody."
          })
        ]
      }
    ],
    recommendedAsset: {
      title: "SAT-B",
      note: "Best balance of optical suitability, battery safety, protected-task compliance, and clean downstream delivery."
    },
    command: {
      schema_version: "mission-command-packet.v0.2",
      mission_id: "WF-2026-001",
      mission_type: "urgent_disaster_response",
      operator_gate: "required",
      target: {
        label: "Rocky Mountains wildfire AOI",
        center_lat: 39.18,
        center_lon: -106.82,
        geometry: "regional_area"
      },
      planning_requirements: {
        payload_family: "optical",
        recommended_gsd_m: 3,
        urgency: "high",
        preserve_existing_missions: true
      },
      selected_assets: ["SAT-B"],
      sequences: [
        {
          at: "2026-05-13T14:20:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_SET_MODE",
          parameters: { from_mode: "LVLH", to_mode: "TARGET_ACQUISITION" }
        },
        {
          at: "2026-05-13T14:20:30Z",
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_SLEW_TO_AOI",
          parameters: { target_ref: "WF-AOI-001", slew_deg: 18, settle_s: 300 }
        },
        {
          at: "2026-05-13T14:25:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "CAMERA",
          command: "CAMERA_POWER_ON",
          parameters: { payload_family: "optical" }
        },
        {
          at: "2026-05-13T14:25:30Z",
          dispatch: "time_tagged_sequence",
          subsystem: "CAMERA",
          command: "CAMERA_CONFIGURE",
          parameters: { mode: "OPTICAL_EMERGENCY", gsd_m: 3, calibration_profile: "WF_FAST" }
        },
        {
          at: "2026-05-13T14:32:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "CAMERA",
          command: "CAMERA_CAPTURE",
          parameters: { gsd_m: 3, target_ref: "WF-AOI-001", product_ref: "WF-2026-001-OPTICAL" }
        },
        {
          at: "2026-05-13T14:34:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "DATA_GROUND",
          command: "PAYLOAD_STORE_IMAGE",
          parameters: { product_ref: "WF-2026-001-OPTICAL" }
        },
        {
          at: "2026-05-13T14:48:00Z",
          dispatch: "ground_contact_sequence",
          subsystem: "DATA_GROUND",
          command: "COMMS_SCHEDULE_DOWNLINK",
          parameters: { product_ref: "WF-2026-001-OPTICAL", ground_station: "KSAT Svalbard", contact_utc: "14:48 UTC" }
        },
        {
          at: "2026-05-13T14:49:00Z",
          dispatch: "ground_contact_sequence",
          subsystem: "DATA_GROUND",
          command: "COMMS_DOWNLINK_TO_STATION",
          parameters: { product_ref: "WF-2026-001-OPTICAL", ground_station: "KSAT Svalbard", band: "X_BAND" }
        },
        {
          at: "2026-05-13T14:56:00Z",
          dispatch: "ground_contact_sequence",
          subsystem: "DATA_GROUND",
          command: "COMMS_CONFIRM_RECEIPT",
          parameters: { product_ref: "WF-2026-001-OPTICAL", ground_station: "KSAT Svalbard" }
        },
        {
          at: "2026-05-13T14:36:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_RETURN_LVLH",
          parameters: { verify_wheel_momentum: true }
        }
      ],
      safety: {
        required_slew_deg: 18,
        max_slew_deg: 40,
        estimated_slew_time_s: 120,
        estimated_adcs_energy_pct: 3.4,
        battery_after_task_pct: 67,
        storage_after_task_gb: 14.8,
        original_mission_interrupted: false,
        propulsion_required: false,
        crosslink_required: false
      }
    }
  },
  custom: {
    prompt: "檢測台灣阿里山土石流",
    constellation: "Operator-defined custom constellation / 操作員自訂星系",
    intent: [
      ["Mission type / 任務類型", "Custom off-nadir imaging drill / 自訂斜視拍攝驗證"],
      ["Geolocation / 地理解析", "Resolved from the operator prompt during analysis / 分析時依操作員輸入解析"],
      ["Planning question / 規劃問題", "Which custom satellite can rotate to the resolved target fastest without unsafe battery draw? / 哪顆自訂衛星能最快安全轉向到解析後目標？"],
      ["Attitude policy / 姿態策略", "Allow target pointing if required slew stays within each spacecraft limit / 只要所需轉向角不超過各衛星限制即可納入"],
      ["Safety policy / 安全策略", "Reject assets whose maneuver leaves insufficient post-task battery / 若轉向與拍攝後電量不足，則排除"]
    ],
    command: null
  },
  construction: {
    prompt: "Monitor the construction progress of this site every day with comparable lighting and viewing conditions.",
    constellation: "10 SSO satellites / 10 顆 SSO 衛星",
    unresolvedIntent: [
      ["Mission type / 任務類型", "Recurring commercial monitoring / 週期性商業監測"],
      ["Target resolution / 目標解析", "Not resolvable from phrase: \"this site\" / 無法從 this site 轉為可定位目標"],
      ["System action / 系統動作", "Request address, coordinates, or map-defined AOI / 要求地址、座標或地圖 AOI"],
      ["Planning state / 規劃狀態", "Paused before satellite tasking / 在衛星任務規劃前暫停"]
    ],
    resolvedIntent: [
      ["Mission type / 任務類型", "Recurring commercial monitoring / 週期性商業監測"],
      ["Geolocation / 地理解析", "AOI resolved from operator-supplied site boundary / 已由操作員提供的區域邊界完成定位"],
      ["Monitoring policy / 監測策略", "1 capture per day / 每日一次拍攝"],
      ["Lighting requirement / 光影需求", "Comparable local solar time and shadow profile / 維持相近光照與陰影條件"],
      ["Viewing requirement / 觀測需求", "Maintain similar off-nadir geometry / 維持相近斜視角"]
    ],
    satellites: [
      {
        name: "SAT-01",
        role: "VHR optical survey / 高解析工地巡檢",
        tone: "good",
        metrics: [
          "Day 1 slot 10:42 local / 最佳基準影像時段",
          "Off-nadir 7 deg / 幾何接近理想",
          "Slew energy 2.8% / 姿態轉向用電低",
          "Battery 78% -> 72% / 電量安全",
          "Downlink next pass available / 下一圈可下行"
        ],
        footer: "Primary baseline capture candidate."
      },
      {
        name: "SAT-03",
        role: "VHR optical continuity / 高一致性續拍",
        tone: "good",
        metrics: [
          "Day 2 slot 10:48 local / 光照一致性佳",
          "Off-nadir 6 deg / 幾何變化低",
          "Fast 90s slew / 90 秒內完成轉向",
          "Battery 69% -> 63% / 電量安全",
          "No protected task conflict / 無排程衝突"
        ],
        footer: "Strong recurring continuity asset."
      },
      {
        name: "SAT-06",
        role: "VHR optical fallback / 可接受備援星",
        tone: "warn",
        metrics: [
          "Day 3 slot 10:39 local / 時間穩定",
          "Off-nadir 8 deg / 可接受但略偏",
          "Higher slew load for continuity geometry / 為維持一致視角需較高轉向負載",
          "Storage margin tighter / 儲存空間較緊",
          "Plan remains valid with trade-off / 仍可納入排程"
        ],
        footer: "Acceptable third-day continuity option."
      },
      {
        name: "SAT-08",
        role: "SAR contingency / 全天候 SAR 備援",
        tone: "warn",
        metrics: [
          "All-weather access / 不受雲層影響",
          "Geometry differs from optical baseline / 與光學基準不完全一致",
          "Useful for construction disruption checks / 適合異常狀況判讀",
          "Not used in comparable-lighting plan / 不列入主計畫"
        ],
        footer: "Alternative asset class, not the preferred comparator."
      }
    ],
    decisions: [
      ["Day 1", "Recommended", "SAT-01 establishes the baseline image under a stable local solar time window with low slew energy.", "good"],
      ["Day 2", "Recommended", "SAT-03 preserves lighting and viewing geometry within tolerance and can complete the small slew quickly.", "good"],
      ["Day 3", "Feasible with trade-off", "SAT-06 remains acceptable, but storage, pointing margin, and maneuver power should be revalidated before release.", "warn"]
    ],
    timeline: [
      {
        time: "Day 1 / 10:42 local",
        detail: "Establish the baseline construction image.",
        fromState: "LVLH",
        toState: "Target Pointing",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_SET_MODE",
            parameters: { from_mode: "LVLH", to_mode: "SCHEDULED_TARGETING" },
            precondition: "Daily monitoring plan approved and protected tasks preserved.",
            stateTransition: "LVLH -> Scheduled Targeting",
            powerImpact: "Mode change only; daily slew budget stays below 3.5%.",
            dataCustody: "No image product exists yet."
          }),
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_SLEW_TO_AOI",
            parameters: { target_ref: "CM-AOI-014", slew_deg: 7, settle_s: 180 },
            precondition: "Comparable viewing geometry is inside the approved 5-8 deg window.",
            stateTransition: "Scheduled Targeting -> Target Pointing",
            powerImpact: "Slew energy 2.8%; battery remains at 72%.",
            dataCustody: "Product series CM-2026-014 is opened for baseline capture."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_POWER_ON",
            parameters: { payload_family: "optical" },
            precondition: "Pointing plan is valid and thermal margin is clear.",
            stateTransition: "Payload Standby -> Camera Ready",
            powerImpact: "Payload startup power included in daily budget.",
            dataCustody: "Baseline product ID is reserved."
          })
        ]
      },
      {
        time: "Day 2 / 10:48 local",
        detail: "Repeat capture under comparable lighting.",
        fromState: "Scheduled Targeting",
        toState: "Imaging",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_TRACK_TARGET",
            parameters: { target_ref: "CM-AOI-014", duration_s: 120 },
            precondition: "Local solar time and viewing angle are comparable to baseline.",
            stateTransition: "Scheduled Targeting -> Imaging",
            powerImpact: "No extra maneuver beyond planned repeatability slew.",
            dataCustody: "Daily collection remains onboard until station contact."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_CAPTURE",
            parameters: { target_ref: "CM-AOI-014", mode: "OPTICAL_REPEATABILITY", product_ref: "CM-2026-014-DAY2" },
            precondition: "Camera profile matches baseline image settings.",
            stateTransition: "Camera Ready -> Imaging",
            powerImpact: "Capture energy included in safe battery margin.",
            dataCustody: "Image is attached to the same recurring monitoring collection."
          })
        ]
      },
      {
        time: "Day 3 / 10:39 local",
        detail: "Continue the recurring monitoring sequence.",
        fromState: "Target Pointing",
        toState: "Imaging",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_SLEW_TO_AOI",
            parameters: { target_ref: "CM-AOI-014", slew_deg: 8, settle_s: 150 },
            precondition: "SAT-06 storage and battery are revalidated before release.",
            stateTransition: "Target Pointing -> Imaging",
            powerImpact: "Higher slew load remains within continuity trade-off envelope.",
            dataCustody: "Geometry metadata will be stored with the image."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_CAPTURE",
            parameters: { target_ref: "CM-AOI-014", product_ref: "CM-2026-014-DAY3" },
            precondition: "Viewing geometry remains comparable enough for monitoring.",
            stateTransition: "Target Pointing -> Imaging",
            powerImpact: "Capture allowed only after storage and battery recheck.",
            dataCustody: "Preview product enters low-latency verification queue."
          })
        ]
      },
      {
        time: "After each pass",
        detail: "Stage the daily product for downstream delivery.",
        fromState: "Imaging",
        toState: "Product Delivery",
        commands: [
          commandEntry({
            subsystem: "ADCS / 姿態控制",
            command: "ADCS_RETURN_LVLH",
            parameters: { recovery_profile: "nominal_repeatability" },
            precondition: "Daily observation window closed.",
            stateTransition: "Imaging -> LVLH Recovery",
            powerImpact: "Recovery energy remains inside daily budget.",
            dataCustody: "Product remains onboard until compatible station contact."
          }),
          commandEntry({
            subsystem: "Camera / 攝影機",
            command: "CAMERA_POWER_OFF",
            parameters: { payload_family: "optical" },
            precondition: "No additional same-pass capture is approved.",
            stateTransition: "Imaging -> Payload Standby",
            powerImpact: "Reduces payload draw between daily passes.",
            dataCustody: "No change to product custody."
          }),
          ...downlinkCommandEntries("CM-2026-014-DAILY", ["SAT-01", "SAT-03", "SAT-06"], "construction")
        ]
      }
    ],
    recommendedAsset: {
      title: "SAT-01 primary / SAT-03 and SAT-06 continuity assets",
      note: "The plan favors daily continuity under comparable illumination, stable geometry, and predictable downstream delivery."
    },
    command: {
      schema_version: "mission-command-packet.v0.2",
      mission_id: "CM-2026-014",
      mission_type: "recurring_site_monitoring",
      operator_gate: "required",
      target: {
        label: "Operator-defined construction AOI",
        geometry: "polygon"
      },
      planning_requirements: {
        payload_family: "optical",
        cadence: "daily",
        comparable_lighting: true,
        local_solar_time_window: "10:30-11:00",
        preferred_off_nadir_deg: { min: 5, max: 8 }
      },
      selected_assets: ["SAT-01", "SAT-03", "SAT-06"],
      sequences: [
        {
          dispatch: "recurring_time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_SET_MODE",
          parameters: { from_mode: "LVLH", to_mode: "SCHEDULED_TARGETING", repeat: "daily" }
        },
        {
          dispatch: "recurring_time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_SLEW_TO_AOI",
          parameters: { target_ref: "CM-AOI-014", repeat: "daily", geometry_policy: "comparable" }
        },
        {
          dispatch: "recurring_time_tagged_sequence",
          subsystem: "ADCS",
          command: "ADCS_TRACK_TARGET",
          parameters: { target_ref: "CM-AOI-014", duration_s: 120 }
        },
        {
          dispatch: "recurring_time_tagged_sequence",
          subsystem: "CAMERA",
          command: "CAMERA_CONFIGURE",
          parameters: { mode: "OPTICAL_REPEATABILITY", lighting_policy: "consistent_shadow_profile", gsd_m: 1 }
        },
        {
          dispatch: "recurring_time_tagged_sequence",
          subsystem: "CAMERA",
          command: "CAMERA_CAPTURE",
          parameters: { target_ref: "CM-AOI-014", collection_id: "CM-2026-014" }
        },
        {
          dispatch: "post_capture_sequence",
          subsystem: "DATA_GROUND",
          command: "PAYLOAD_STORE_IMAGE",
          parameters: { collection_id: "CM-2026-014", product_ref: "CM-2026-014-DAILY" }
        },
        {
          dispatch: "ground_contact_sequence",
          subsystem: "DATA_GROUND",
          command: "COMMS_SCHEDULE_DOWNLINK",
          parameters: { collection_id: "CM-2026-014", ground_station: "KSAT Svalbard", path: "NEXT_COMPATIBLE_PASS" }
        },
        {
          dispatch: "ground_contact_sequence",
          subsystem: "DATA_GROUND",
          command: "COMMS_DOWNLINK_TO_STATION",
          parameters: { collection_id: "CM-2026-014", ground_station: "KSAT Svalbard", band: "X_BAND" }
        },
        {
          dispatch: "ground_contact_sequence",
          subsystem: "DATA_GROUND",
          command: "COMMS_CONFIRM_RECEIPT",
          parameters: { collection_id: "CM-2026-014", ground_station: "KSAT Svalbard" }
        }
      ],
      safety: {
        preferred_off_nadir_deg: { min: 5, max: 8 },
        max_daily_slew_energy_pct: 3.5,
        preserve_existing_missions: true,
        revalidate_battery_before_execution: true,
        crosslink_required: false,
        propulsion_required: false
      }
    }
  }
};

function setScenario(nextScenario) {
  activeScenario = nextScenario;
  activeCustomTarget = null;
  activeResolvedTarget = null;
  Object.keys(mapViewOverrides).forEach((key) => delete mapViewOverrides[key]);
  approved = false;
  approveButton.disabled = true;
  exportButton.disabled = true;
  exportButton.textContent = "Export Command Packet / 匯出指令封包";
  commandStatus.textContent = "Locked until approval / 核准前鎖定";
  commandOutput.textContent = "Approve a validated plan to reveal the execution packet.\n/ 批准已驗證的任務計畫後，系統才會展開執行指令。";
  scenarioButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === nextScenario);
  });
  missionPrompt.value = scenarios[nextScenario].prompt;
  customConstellationToggle.checked = nextScenario === "custom";
  renderNarrativePanels();
  resetPanels();

  if (nextScenario === "wildfire") {
    constructionResolved = false;
    constructionTools.classList.add("hidden");
  } else if (nextScenario === "construction") {
    constructionResolved = false;
    constructionTools.classList.remove("hidden");
  } else {
    constructionResolved = true;
    constructionTools.classList.add("hidden");
  }

  goToPresentationStep(0);
}

function resetPanels() {
  resetAnalysisProgress();
  clarificationBox.className = "clarification-box empty-state";
  clarificationBox.innerHTML = "<strong>Awaiting analysis / 等待分析。</strong><p>Submit a mission request to begin target validation and clarification. / 請先送出任務需求，系統才會開始檢查與澄清。</p>";
  mapCaption.textContent = "No mission area has been analyzed yet. / 尚未開始任務區域分析。";
  mapBadge.className = "pill muted";
  mapBadge.textContent = "Awaiting analysis / 等待分析";
  constellationBadge.className = "pill muted";
  constellationBadge.textContent = "Awaiting analysis / 等待分析";
  missionMap.classList.add("idle");
  updateMapImageFromCurrentState();
  mapTarget.classList.add("hidden");
  renderMapAssets([]);
  aoiHint.classList.add("hidden");
  intentSummary.innerHTML = "";
  satelliteCards.innerHTML = "";
  suitabilityMatrix.innerHTML = "";
  decisionTable.innerHTML = "";
  missionTimeline.innerHTML = "";
  commandBoundary.innerHTML = "";
  planStatus.textContent = "Awaiting analysis / 等待分析";
  recommendedAsset.className = "recommended-asset empty-plan";
  recommendedAsset.innerHTML = "<span class=\"label\">Recommended asset / 最建議衛星</span><strong>Awaiting analysis / 等待分析</strong>";
  updateWorkflowProgress("idle");
  updatePresentationStep();
}

function renderDefinitionList(entries) {
  intentSummary.parentElement.querySelectorAll(".api-note").forEach((note) => note.remove());
  intentSummary.innerHTML = entries
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderSuitabilityModel() {
  suitabilityMatrix.innerHTML = suitabilityModel
    .map(
      ({ title, detail }) => `
        <article class="suitability-card">
          <strong>${title}</strong>
          <p>${detail}</p>
        </article>
      `
    )
    .join("");
}

function renderCards(cards) {
  satelliteCards.innerHTML = cards
    .map(
      ({ name, role, tone, metrics, footer }) => `
        <article class="satellite-card ${tone}">
          <div class="satellite-card-heading">
            <h3>${name}</h3>
            <span class="mini-pill ${tone}">${role}</span>
          </div>
          <ul class="metric-list">
            ${metrics.map((metric) => `<li>${metric}</li>`).join("")}
          </ul>
          <p class="satellite-footer">${footer}</p>
        </article>
      `
    )
    .join("");
}

function renderDecisionRows(rows) {
  decisionTable.innerHTML = rows
    .map(
      ([label, title, detail, tone]) => `
        <article class="decision-row">
          <strong>${label}</strong>
          <div>
            <div class="${tone}">${title}</div>
            <p>${detail}</p>
          </div>
          <span class="status-chip ${tone}">${title}</span>
        </article>
      `
    )
    .join("");
}

function renderTimeline(steps) {
  missionTimeline.innerHTML = steps
    .map(
      ({ time, detail, fromState, toState, commands }) => `
        <li>
          <strong>${time}</strong><br />
          <span>${detail}</span>
          <div class="command-lanes">
            ${commands
              .map(
                ({ subsystem, command, parameters, precondition, stateTransition, powerImpact, dataCustody, text }) => `
                  <div class="command-lane">
                    <strong>${subsystem}</strong>
                    <div class="command-detail">
                      <code>${command || "PLANNER_NOTE"}</code>
                      <span>${text || ""}</span>
                      <dl>
                        <div><dt>Parameters / 參數</dt><dd>${parameters ? JSON.stringify(parameters) : "n/a"}</dd></div>
                        <div><dt>Precondition / 前提</dt><dd>${precondition || "Planner validation required before execution."}</dd></div>
                        <div><dt>State / 狀態機</dt><dd>${stateTransition || `${fromState} -> ${toState}`}</dd></div>
                        <div><dt>Power / 用電</dt><dd>${powerImpact || "Included in mission power budget."}</dd></div>
                        <div><dt>Data custody / 資料鏈</dt><dd>${dataCustody || "Tracked by the ground workflow after capture."}</dd></div>
                      </dl>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="timeline-state">
            <span class="state-pill">${fromState}</span>
            <span class="state-arrow">-></span>
            <span class="state-pill">${toState}</span>
          </div>
        </li>
      `
    )
    .join("");
}

function renderRecommendedAsset(asset) {
  recommendedAsset.className = "recommended-asset";
  recommendedAsset.innerHTML = `
    <span class="label">Recommended asset / 最建議衛星</span>
    <strong>${asset.title}</strong>
    <span>${asset.note}</span>
  `;
}

function renderCommandBoundary() {
  commandBoundary.innerHTML = commandBoundaryModel
    .map(
      ({ title, detail }) => `
        <article class="boundary-card">
          <strong>${title}</strong>
          <p>${detail}</p>
        </article>
      `
    )
    .join("");
}

function updateWorkflowProgress(state) {
  currentWorkflowState = state;
  syncPresentationFlowClasses(state);
  renderGuidedTaskQueue(state);
}

function renderGuidedTaskQueue(state) {
  const workflowText = workflowTextByState[state] || workflowTextByState.idle;
  workflowStateBadge.textContent = workflowText.badge;
  workflowCalloutText.textContent = workflowText.text;

  guidedTaskList.innerHTML = (taskQueueByState[state] || taskQueueByState.idle)
    .map(
      ([status, title, detail], index) => `
        <li class="guided-task ${status}" data-index="${index + 1}">
          <strong>${title}</strong>
          <p>${detail}</p>
        </li>
      `
    )
    .join("");
}

function renderScenarioFlows() {
  scenarioFlowGrid.innerHTML = Object.entries(scenarioFlowModels)
    .map(
      ([key, flow]) => `
        <article class="scenario-flow ${key === activeScenario ? "active" : ""}">
          <h3>${flow.title}</h3>
          <div class="flow-line">
            ${flow.nodes
              .map(
                ([title, detail], index) => `
                  <div class="flow-node">
                    <span>${index + 1}</span>
                    <div>
                      <strong>${title}</strong>
                      <small>${detail}</small>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderNarrativePanels() {
  renderScenarioFlows();
}

function renderWildfire(target = null) {
  const scenario = scenarios.wildfire;
  activeResolvedTarget = hasTargetCoordinates(target) ? { ...target, scenario: "wildfire" } : null;
  const targetLabel = activeResolvedTarget?.label || "Rocky Mountains wildfire AOI";
  const targetLat = activeResolvedTarget?.location?.lat ?? 39.18;
  const targetLng = activeResolvedTarget?.location?.lng ?? -106.82;

  missionMap.classList.remove("idle");
  applyMissionMapImage("wildfire");
  mapBadge.className = "pill";
  constellationBadge.className = "pill";
  mapTarget.className = "map-target wildfire-target";
  mapTarget.innerHTML = "<span>AOI</span>";
  renderMapAssets(mapAssetNamesFromPlan(scenario, ["SAT-A", "SAT-B", "SAT-C"]), selectedAssetNamesFromPlan(scenario), true);
  clarificationBox.className = "clarification-box ready";
  clarificationBox.innerHTML = "<strong>Ready / 已就緒。</strong><p>The target phrase can be resolved into a wildfire search AOI, so the system can proceed into imaging requirements and tasking analysis. / 系統能將該地名轉成火災搜尋 AOI，因此可進入成像需求與任務分析。</p>";
  mapCaption.textContent = `${targetLabel} resolved from natural language. / 已從自然語言解析出 ${targetLabel}。`;
  mapBadge.textContent = "AOI resolved / 區域已解析";
  constellationBadge.textContent = scenario.constellation;

  renderDefinitionList(
    scenario.intent.map(([label, value]) => {
      if (label.startsWith("Geolocation")) {
        return [label, `${targetLabel} resolved to an executable AOI / 已將 ${targetLabel} 解析為可執行 AOI`];
      }
      if (label.startsWith("Derived target")) {
        return [label, `Representative AOI center: ${formatCoordinatePair(targetLat, targetLng)} / 代表中心點已建立`];
      }
      return [label, value];
    })
  );
  renderCards(scenario.satellites);
  renderSuitabilityModel();
  renderDecisionRows(scenario.decisions);
  renderRecommendedAsset(scenario.recommendedAsset);
  renderTimeline(scenario.timeline);
  renderCommandBoundary();
  activeCommandPacket = commandWithResolvedTarget(scenario.command, activeResolvedTarget, "WF-AOI-001");
  updateWorkflowProgress("planned");
  planStatus.textContent = "Validated recommendation ready / 已產出可審核建議";
  syncAoiOverlay();
}

function renderConstruction(resolved) {
  const scenario = scenarios.construction;

  missionMap.classList.remove("idle");
  applyMissionMapImage("construction", { forceBlankAuto: !resolved });
  constellationBadge.className = "pill";
  constellationBadge.textContent = scenario.constellation;
  mapTarget.classList.remove("hidden");
  mapBadge.className = resolved ? "pill" : "pill muted";
  renderSuitabilityModel();
  renderCommandBoundary();

  if (resolved) {
    mapTarget.className = "map-target construction-target";
    mapTarget.innerHTML = "<span>AOI</span>";
    renderMapAssets(
      mapAssetNamesFromPlan(scenario, ["SAT-01", "SAT-03", "SAT-06", "SAT-08"]),
      selectedAssetNamesFromPlan(scenario),
      true
    );
    mapCaption.textContent = "Construction site AOI resolved and ready for recurring monitoring. / 工地 AOI 已解析，可進入週期性監測。";
    mapBadge.textContent = "AOI resolved / 區域已解析";
    syncAoiOverlay();
  } else {
    mapTarget.className = "map-target construction-target";
    mapTarget.innerHTML = "<span>?</span>";
    renderMapAssets([]);
    clarificationBox.className = "clarification-box warning";
    clarificationBox.innerHTML = "<strong>Clarification required / 需要補充資訊。</strong><p>\"This site\" cannot be converted into GPS coordinates or an AOI. Please provide an address, coordinates, or define the site on the map. / 這個描述無法直接轉成 GPS 或 AOI，請補充地址、座標，或在地圖上框選。</p>";
    mapCaption.textContent = "Planning is paused until the construction site is geolocated. / 在工地位置被解析前，系統暫停往下規劃。";
    mapBadge.textContent = "Target unresolved / 目標未解析";
    syncAoiOverlay();
  }

  renderDefinitionList(resolved ? scenario.resolvedIntent : scenario.unresolvedIntent);
  renderCards(resolved ? scenario.satellites : []);
  renderDecisionRows(
    resolved
      ? scenario.decisions
      : [["System", "Paused", "Mission planning has not started because the target is not yet geolocated.", "warn"]]
  );
  renderTimeline(
    resolved
      ? scenario.timeline
      : [
          {
            time: "Awaiting target",
            detail: "Provide an address, coordinates, or map AOI to continue.",
            fromState: "Planning Hold",
            toState: "Planning Hold",
            commands: [
              { subsystem: "Planner / 規劃器", text: "No satellite commands are generated before geolocation succeeds." }
            ]
          }
        ]
  );

  if (resolved) {
    renderRecommendedAsset(scenario.recommendedAsset);
    activeCommandPacket = commandWithResolvedTarget(scenario.command, activeResolvedTarget, "CM-AOI-014");
    updateWorkflowProgress("planned");
  } else {
    recommendedAsset.className = "recommended-asset empty-plan";
    recommendedAsset.innerHTML = "<span class=\"label\">Recommended asset / 最建議衛星</span><strong>Awaiting geolocation / 等待定位</strong>";
    activeCommandPacket = null;
    updateWorkflowProgress("blocked");
  }

  planStatus.textContent = resolved
    ? "Recurring plan ready for approval / 週期任務可供批准"
    : "Clarification required / 需要補充資訊";
}

function renderCustomScenario(llmResult = null, target = null) {
  activeCustomTarget = target?.status === "resolved" ? target : null;
  const customPlan = target?.status === "resolved" ? buildCustomConstellationPlan("custom", target) : null;

  missionMap.classList.remove("idle");
  constellationBadge.className = "pill";
  constellationBadge.textContent = customPlan?.constellationLabel || `${getCustomSatellites().length} custom satellites / ${getCustomSatellites().length} 顆自訂衛星`;
  mapTarget.className = "map-target construction-target";

  if (!target || target.status !== "resolved") {
    clearMissionMapImage("Custom target unresolved: map waits for GPS, address, or AOI / 自訂目標未解析：地圖等待 GPS、地址或 AOI");
    mapBadge.className = "pill muted";
    mapBadge.textContent = "Target unresolved / 目標未解析";
    mapTarget.innerHTML = "<span>?</span>";
    renderMapAssets([]);
    clarificationBox.className = "clarification-box warning";
    clarificationBox.innerHTML =
      `<strong>Clarification required / 需要補充資訊。</strong><p>${target?.label || "The custom target"} could not be converted into GPS coordinates. Provide a clearer place name, address, coordinates, or draw an AOI before spacecraft tasking. / 目前無法轉成 GPS 座標；請提供更清楚地名、地址、座標或框選 AOI，系統才會往下規劃。</p>`;
    mapCaption.textContent = "Custom planning is paused until the target is geolocated. / 自訂任務會停在目標檢核，直到位置被解析。";
    renderDefinitionList(customIntentEntries(target));
    renderCards([]);
    renderSuitabilityModel();
    renderDecisionRows([["Target Gate", "Paused", "No satellite is scored or commanded before the custom target becomes coordinates or AOI.", "warn"]]);
    renderRecommendedAsset({
      title: "Awaiting geolocation / 等待定位",
      note: "The system preserves the command boundary by blocking satellite tasking until the target is real and explainable."
    });
    renderTimeline([
      {
        time: "Planning hold / 規劃暫停",
        detail: "Resolve the custom target before evaluating access, slew, payload fit, or battery.",
        fromState: "Mission Intake",
        toState: "Target Gate",
        commands: [
          { subsystem: "Planner / 規劃器", text: "ASK_CLARIFICATION for address, GPS coordinate, or AOI polygon." }
        ]
      }
    ]);
    renderCommandBoundary();
    activeCommandPacket = null;
    updateWorkflowProgress("blocked");
    planStatus.textContent = "Clarification required / 需要補充資訊";
    return;
  }

  applyMissionMapImage("custom");
  mapBadge.className = "pill";
  mapTarget.innerHTML = "<span>AOI</span>";
  renderMapAssets(mapAssetNamesFromPlan(customPlan, []), selectedAssetNamesFromPlan(customPlan), true);

  clarificationBox.className = "clarification-box ready";
  clarificationBox.innerHTML =
    `<strong>Custom drill ready / 自訂驗證就緒。</strong><p>${target.label} is geolocated, so the planner can score only the sandbox constellation against payload, slew, battery, and existing task constraints. / ${target.label} 已定位；系統只會用沙盒星系評估酬載、轉向、電量與既有任務限制。</p>`;
  mapCaption.textContent = `${target.label} resolved from the custom request; planner is testing whether custom satellites can slew off-nadir to image it. / 已從自訂需求解析 ${target.label}，規劃器正在檢查自訂衛星能否斜視轉向拍攝。`;
  mapBadge.textContent = "Custom target resolved / 自訂目標已解析";

  renderDefinitionList(customIntentEntries(target, llmResult));
  renderCards(customPlan.cards);
  renderSuitabilityModel();
  renderDecisionRows(customPlan.decisions);
  renderRecommendedAsset(customPlan.recommendedAsset);
  renderTimeline(customPlan.timeline);
  renderCommandBoundary();
  activeCommandPacket = customPlan.command;
  updateWorkflowProgress("planned");
  planStatus.textContent = customPlan.executable
    ? "Custom off-nadir plan ready / 自訂斜視計畫可供審核"
    : "Custom constellation has no safe executable imaging asset / 自訂星系無安全可執行拍攝資產";
  syncAoiOverlay();
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      let body = {};
      try {
        body = await response.json();
      } catch (error) {
        body = { error: await response.text() };
      }
      const message = body.error || body.warning || `Request failed with ${response.status}`;
      const requestError = new Error(message);
      requestError.details = body;
      requestError.status = response.status;
      throw requestError;
    }
    return await response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function requestLlmIntent() {
  const result = await fetchJsonWithTimeout(apiUrl("/api/interpret"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: missionPrompt.value, provider: "auto" })
  }, 45000);

  if (!result?.intent) {
    throw new Error(result?.error || "The LLM response did not include a mission intent.");
  }

  return result;
}

async function requestGeocode(address) {
  try {
    return await fetchJsonWithTimeout(apiUrl(`/api/geocode?q=${encodeURIComponent(address)}`), {}, 1800);
  } catch (error) {
    return null;
  }
}

function appendLlmIntentSummary(result) {
  if (!result || !result.intent) return;

  const rows = [
    ["LLM source / LLM 來源", llmSourceLabel(result.source)],
    ["LLM mission / LLM 任務分類", result.intent.mission_category],
    ["Target status / 目標狀態", result.intent.target_resolution?.status || "unknown"],
    ["Payload family / 載荷族群", result.intent.observation_request?.payload_family || "unknown"]
  ];

  const fragment = document.createDocumentFragment();
  rows.forEach(([label, value]) => {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    wrapper.append(dt, dd);
    fragment.append(wrapper);
  });
  intentSummary.append(fragment);

  if (result.warning) {
    const note = document.createElement("p");
    note.className = "api-note";
    note.textContent = result.warning;
    intentSummary.parentElement.append(note);
  }
}

function llmSourceLabel(source) {
  if (source === "openrouter") return "OpenRouter Free / OpenRouter 免費路由";
  if (source === "openrouter_grok") return "OpenRouter Grok / OpenRouter Grok 備援";
  if (source === "openai") return "OpenAI API";
  return "LLM provider / LLM 供應商";
}

async function analyzeMission() {
  if (analysisInProgress) return;

  analysisInProgress = true;
  analysisFailed = false;
  setAnalysisProgress(0, "LLM semantic interpretation in progress / LLM 正在解析任務語意");
  updatePresentationStep();

  try {
    approved = false;
    exportButton.disabled = true;
    exportButton.textContent = "Export Command Packet / 匯出指令封包";
    activeCommandPacket = null;
    commandStatus.textContent = "Locked until approval / 核准前鎖定";
    commandOutput.textContent = "Approve a validated plan to reveal the execution packet.\n/ 批准已驗證的任務計畫後，系統才會展開執行指令。";

    const llmResult = await requestLlmIntent();
    setAnalysisProgress(1, "AOI and geocode check / AOI 與地理解析");

    if (activeScenario === "wildfire") {
      const geocodeResult = await requestBestGeocode(semanticTargetCandidates(missionPrompt.value, llmResult, "wildfire"));
      const target = buildResolvedTarget(missionPrompt.value, geocodeResult, llmResult, "wildfire");
      setAnalysisProgress(2, "Mission boundary validation / 任務邊界檢查");
      renderWildfire(target);
      setAnalysisProgress(4, "Bounded command plan generated / 已產生受控指令計畫", "complete");
      approveButton.disabled = !activeCommandPacket;
      goToPresentationStep(1);
      appendLlmIntentSummary(llmResult);
      return;
    }

    if (activeScenario === "custom") {
      const geocodeResult = await requestBestGeocode(semanticTargetCandidates(missionPrompt.value, llmResult, "custom"));
      const customTarget = buildCustomTarget(missionPrompt.value, geocodeResult, llmResult);
      setAnalysisProgress(customTarget?.status === "resolved" ? 3 : 2, customTarget?.status === "resolved" ? "Fleet feasibility scoring / 星系可行性評估" : "Mission boundary hold / 任務邊界暫停");
      renderCustomScenario(llmResult, customTarget);
      setAnalysisProgress(4, activeCommandPacket ? "Bounded command plan generated / 已產生受控指令計畫" : "Clarification required before commands / 產生指令前需要澄清", activeCommandPacket ? "complete" : "active");
      approveButton.disabled = !activeCommandPacket;
      goToPresentationStep(activeCommandPacket ? 2 : 1);
      appendLlmIntentSummary(llmResult);
      return;
    }

    if (!constructionResolved) {
      const candidates = semanticTargetCandidates(missionPrompt.value, llmResult, "construction");
      const canAutoResolve =
        llmResult?.intent?.target_resolution?.status !== "needs_clarification" &&
        candidates.length &&
        !/\bthis site\b|這裡|這個地點|該地點/i.test(missionPrompt.value);
      const geocodeResult = canAutoResolve ? await requestBestGeocode(candidates) : null;

      if (geocodeResult?.result?.location) {
        setAnalysisProgress(3, "Fleet feasibility scoring / 星系可行性評估");
        constructionResolved = true;
        activeResolvedTarget = buildResolvedTarget(missionPrompt.value, geocodeResult, llmResult, "construction");
        resetMapViewOverride("construction");
        renderConstruction(true);
        clarificationBox.className = "clarification-box ready";
        clarificationBox.innerHTML =
          `<strong>Target resolved / 目標已解析。</strong><p>Google geocoding converted the prompt into ${geocodeResult.result.formatted_address} (${geocodeResult.result.location.lat.toFixed(4)}, ${geocodeResult.result.location.lng.toFixed(4)}). The recurring imaging planner can continue. / 系統已將需求解析為 ${geocodeResult.result.formatted_address}（${geocodeResult.result.location.lat.toFixed(4)}, ${geocodeResult.result.location.lng.toFixed(4)}），可以繼續建立週期性拍攝計畫。</p>`;
        setAnalysisProgress(4, "Bounded recurring plan generated / 已產生受控週期任務計畫", "complete");
        approveButton.disabled = !activeCommandPacket;
        goToPresentationStep(2);
        appendLlmIntentSummary(llmResult);
        return;
      }

      setAnalysisProgress(2, "Target needs clarification before tasking / 進入任務前需要澄清目標");
      renderConstruction(false);
      setAnalysisProgress(2, "Clarification required before commands / 產生指令前需要澄清", "active");
      approveButton.disabled = true;
      goToPresentationStep(1);
      appendLlmIntentSummary(llmResult);
      return;
    }

    setAnalysisProgress(3, "Fleet feasibility scoring / 星系可行性評估");
    renderConstruction(true);
    setAnalysisProgress(4, "Bounded recurring plan generated / 已產生受控週期任務計畫", "complete");
    approveButton.disabled = !activeCommandPacket;
    goToPresentationStep(2);
    appendLlmIntentSummary(llmResult);
  } catch (error) {
    analysisFailed = true;
    const providerErrors = error.details?.provider_errors || error.details?.providerErrors || [];
    const providerSummary = providerErrors.length
      ? providerErrors.map((item) => item.source).join(", ")
      : "configured providers";
    setAnalysisProgress(0, `LLM analysis failed: ${providerSummary} / LLM 分析失敗：${providerSummary}`, "failed");
    clarificationBox.className = "clarification-box warning";
    clarificationBox.innerHTML =
      `<strong>LLM analysis did not complete / LLM 分析未完成。</strong><p>The system did not generate a mission plan because no LLM provider returned a valid MissionIntent. Check OpenRouter, Grok, or OpenAI credentials and retry. / 因為沒有 LLM 供應商回傳有效任務意圖，系統不會產生任務計畫；請檢查 OpenRouter、Grok 或 OpenAI 金鑰後重試。</p>`;
    approveButton.disabled = true;
    activeCommandPacket = null;
    updateWorkflowProgress("idle");
  } finally {
    analysisInProgress = false;
    updatePresentationStep();
  }
}

function resolveConstructionTarget(mode, geocodeResult = null) {
  constructionResolved = true;
  activeResolvedTarget =
    buildResolvedTarget(addressInput.value || missionPrompt.value, geocodeResult, null, "construction") ||
    mapDefinedConstructionTarget();
  resetMapViewOverride("construction");
  const geocodeNote =
    geocodeResult?.source === "google" && geocodeResult.result?.location
      ? ` Google Maps resolved it to ${geocodeResult.result.formatted_address} (${geocodeResult.result.location.lat.toFixed(4)}, ${geocodeResult.result.location.lng.toFixed(4)}).`
      : "";
  const geocodeNoteZh =
    geocodeResult?.source === "google" && geocodeResult.result?.location
      ? ` Google Maps 已解析為 ${geocodeResult.result.formatted_address}（${geocodeResult.result.location.lat.toFixed(4)}, ${geocodeResult.result.location.lng.toFixed(4)}）。`
      : "";

  renderConstruction(true);
  clarificationBox.className = "clarification-box ready";
  clarificationBox.innerHTML =
    mode === "address"
      ? `<strong>Target resolved / 目標已解析。</strong><p>The provided address has been converted into a geolocated construction AOI.${geocodeNote} The recurring imaging planner can continue. / 地址已轉為可定位的工地 AOI。${geocodeNoteZh}系統可以繼續建立週期性拍攝計畫。</p>`
      : "<strong>AOI accepted / AOI 已接受。</strong><p>The map-defined construction boundary has been converted into a target geometry. The recurring imaging planner can continue. / 地圖框選的工地邊界已轉為目標幾何，系統可以繼續規劃。</p>";
  aoiHint.classList.add("hidden");
  approveButton.disabled = !activeCommandPacket;
  updatePresentationStep();
}

function approveMission() {
  if (approveButton.disabled) {
    return;
  }
  approved = true;
  commandStatus.textContent = "Released after operator approval / 經操作員批准後釋出";
  commandOutput.textContent = JSON.stringify(activeCommandPacket || scenarios[activeScenario].command, null, 2);
  exportButton.disabled = false;
  updateWorkflowProgress("approved");
  goToPresentationStep(7);
}

function exportCommandPacket() {
  if (exportButton.disabled) {
    return;
  }

  commandStatus.textContent = "Export simulated for demo / 展示用匯出已完成";
  exportButton.textContent = "Packet Exported / 指令已匯出";
  updateWorkflowProgress("exported");
  goToPresentationStep(7);
}

mapImageSelect.addEventListener("change", () => {
  setMapImageSource(mapImageSelect.value);
});

mapModeButtons.forEach((button) => {
  button.addEventListener("click", () => setMapImageSource(button.dataset.mapSource));
});

mapZoomInButton.addEventListener("click", () => changeMapZoom(1));
mapZoomOutButton.addEventListener("click", () => changeMapZoom(-1));
mapResetViewButton.addEventListener("click", resetCurrentMapView);
missionMap.addEventListener("pointerdown", beginMapDrag);
missionMap.addEventListener("pointermove", updateMapDrag);
missionMap.addEventListener("pointerup", endMapDrag);
missionMap.addEventListener("pointercancel", endMapDrag);
missionMap.addEventListener("wheel", zoomMapFromWheel, { passive: false });
window.addEventListener("resize", syncAoiOverlay);

mapImageUpload.addEventListener("change", () => {
  const [file] = mapImageUpload.files;
  if (!file) return;

  if (uploadedMapImageUrl) {
    URL.revokeObjectURL(uploadedMapImageUrl);
  }

  uploadedMapImageUrl = URL.createObjectURL(file);
  uploadedMapImageName = file.name;
  syncMapSourceControls();
  selectedMapImageSource = "upload";
  syncMapSourceControls();
  updateMapImageFromCurrentState();
});

clearMapImageButton.addEventListener("click", () => {
  if (uploadedMapImageUrl) {
    URL.revokeObjectURL(uploadedMapImageUrl);
  }

  uploadedMapImageUrl = null;
  uploadedMapImageName = "";
  mapImageUpload.value = "";
  setMapImageSource("auto");
});

scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => setScenario(button.dataset.scenario));
});

dashboardModeToggle.addEventListener("click", () => {
  setPresentationMode(!presentationModeEnabled);
});

prevStepButton.addEventListener("click", () => {
  const previousStep = nearestAvailableStep(activePresentationStepIndex, -1);
  if (previousStep !== null) goToPresentationStep(previousStep);
});

nextStepButton.addEventListener("click", () => {
  if (presentationSteps[activePresentationStepIndex]?.key === "request") {
    analyzeMission();
    return;
  }

  const nextStep = nearestAvailableStep(activePresentationStepIndex, 1);
  if (nextStep !== null) goToPresentationStep(nextStep);
});

analyzeButton.addEventListener("click", analyzeMission);
approveButton.addEventListener("click", approveMission);
exportButton.addEventListener("click", exportCommandPacket);
resolveAddressButton.addEventListener("click", async () => {
  if (!addressInput.value.trim()) {
    addressInput.focus();
    return;
  }

  resolveAddressButton.disabled = true;
  resolveAddressButton.textContent = "Resolving / 解析中";
  const geocodeResult = await requestGeocode(addressInput.value.trim());
  resolveAddressButton.disabled = false;
  resolveAddressButton.textContent = "Resolve Address / 解析地址";
  resolveConstructionTarget("address", geocodeResult);
});

generateConstellationButton.addEventListener("click", () => {
  renderCustomEditor();
});

applyCustomConstellationButton.addEventListener("click", () => {
  setScenario("custom");
  analyzeMission();
});

customConstellationToggle.addEventListener("change", () => {
  if (customConstellationToggle.checked) {
    setScenario("custom");
  } else if (activeScenario === "custom") {
    setScenario("wildfire");
  }
});

drawAoiButton.addEventListener("click", () => {
  aoiHint.classList.remove("hidden");
  mapCaption.textContent = "AOI drawing mode active. Click the map to confirm the construction site boundary. / 已進入 AOI 框選模式，請點擊地圖確認工地範圍。";
  goToPresentationStep(3);
});

document.querySelector(".mission-map").addEventListener("click", () => {
  if (lastMapDragMoved) {
    lastMapDragMoved = false;
    return;
  }

  if (activeScenario === "construction" && !constructionResolved && !aoiHint.classList.contains("hidden")) {
    resolveConstructionTarget("map");
  }
});

renderPresentationFlow();
renderCustomEditor();
setScenario("wildfire");
setPresentationMode(true);
