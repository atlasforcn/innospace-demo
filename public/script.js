const scenarioButtons = document.querySelectorAll(".scenario-button");
const missionPrompt = document.getElementById("missionPrompt");
const analyzeButton = document.getElementById("analyzeButton");
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
const mapTracks = document.querySelectorAll(".track");
const mapSatellites = document.querySelectorAll(".satellite");
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
  ".suitability-panel",
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
let activePresentationStepIndex = 0;
let presentationModeEnabled = true;
let currentWorkflowState = "idle";
let progressSteps = [];

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
    title: "Mission Requirements / 任務需求模型",
    detail: "Translate intent into payload, cadence, urgency, and safety policy. / 將意圖轉成酬載、週期、急迫性與安全策略。"
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
    phase: "05",
    group: "Mission Flow / 任務流程",
    title: "Fleet Readiness / 衛星可用性",
    detail: "Check payload, battery, current attitude state, storage, and existing tasks. / 檢查酬載、電量、姿態狀態、儲存與既有任務。"
  },
  {
    key: "plan",
    phase: "06",
    group: "Mission Flow / 任務流程",
    title: "Feasibility Rules / 可行性規則",
    detail: "Explain the planning constraints before showing a recommendation. / 在推薦前先說明任務規劃約束。"
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
  approve: 7,
  export: 8
};

const mapImagePresets = {
  wildfire: {
    file: "images/mission-area-wildfire.svg",
    status: "Preset: Rocky Mountain wildfire AOI / 預存：落基山火場 AOI",
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
    badge: "Step 1 / 第一步",
    text: "Start by selecting a scenario and analyzing the mission request. Optional constellation setup can be adjusted before analysis. / 先選情境並分析任務需求；自訂星系可在分析前調整。"
  },
  blocked: {
    badge: "Blocked / 等待澄清",
    text: "Planning is intentionally paused because the target cannot yet become coordinates or an AOI. / 系統刻意暫停，因為目標尚未能轉成座標或 AOI。"
  },
  planned: {
    badge: "Review / 審核中",
    text: "Review the mission area, constellation evidence, decision analysis, and recommended plan before approval. / 批准前請依序檢查任務區域、星系證據、決策分析與建議計畫。"
  },
  approved: {
    badge: "Released / 已釋出",
    text: "Operator approval has unlocked the bounded command packet for export. / 操作員批准後，受控指令封包已可匯出。"
  }
};

const taskQueueByState = {
  idle: [
    ["done", "Select scenario / 選擇情境", "Use wildfire or construction as the demo path."],
    ["active", "Review request / 檢查需求", "Edit the natural-language prompt if needed."],
    ["pending", "Optional constellation / 可選星系", "Use defaults or apply custom satellite states."],
    ["pending", "Analyze request / 分析需求", "Start target validation and planning."],
    ["locked", "Review plan / 審核計畫", "Unlocked after analysis succeeds."],
    ["locked", "Approve + export / 批准並匯出", "Unlocked only after a valid plan exists."]
  ],
  blocked: [
    ["done", "Request analyzed / 需求已分析", "The system understood the mission intent."],
    ["blocked", "Clarify target / 澄清目標", "Provide address, coordinates, or draw AOI."],
    ["locked", "Access analysis / 可見性分析", "Waiting for a resolvable AOI."],
    ["locked", "Satellite scoring / 衛星評分", "No spacecraft is tasked before geolocation."],
    ["locked", "Approve plan / 批准計畫", "Approval stays disabled."],
    ["locked", "Export commands / 匯出指令", "No command packet is generated yet."]
  ],
  planned: [
    ["done", "Intent parsed / 意圖已解析", "Mission intent has been structured."],
    ["done", "Target validated / 目標已驗證", "AOI and imaging need are available."],
    ["active", "Review evidence / 檢查證據", "Check access, payload, battery, conflict, and FOV evidence."],
    ["active", "Inspect plan / 檢查計畫", "Read the recommended satellite and ordered operation sequence."],
    ["pending", "Approve plan / 批准計畫", "Operator approval is the next manual gate."],
    ["locked", "Export commands / 匯出指令", "Locked until approval."]
  ],
  approved: [
    ["done", "Intent parsed / 意圖已解析", "The request has been translated safely."],
    ["done", "Evidence reviewed / 證據已審核", "Feasibility checks are visible."],
    ["done", "Plan approved / 計畫已批准", "The operator gate has been passed."],
    ["active", "Inspect packet / 檢查封包", "Review ADCS, payload, and downlink commands."],
    ["active", "Export packet / 匯出封包", "Use export for the demo handoff."],
    ["done", "Audit ready / 可供稽核", "Command boundary and safety rationale remain visible."]
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

function syncPresentationFlowClasses(state) {
  const progressByState = {
    idle: { completeThrough: -1, availableThrough: 0 },
    blocked: { completeThrough: 0, availableThrough: 1, blockedIndex: 1 },
    planned: { completeThrough: 7, availableThrough: 7 },
    approved: { completeThrough: 8, availableThrough: 8 },
    exported: { completeThrough: 8, availableThrough: 8 }
  };
  const progress = progressByState[state] || progressByState.idle;

  progressSteps.forEach((step) => {
    const index = Number(step.dataset.panelIndex);
    const setup = presentationSteps[index]?.key === "setup";
    step.classList.toggle("complete", index <= progress.completeThrough);
    step.classList.toggle("active", index === activePresentationStepIndex);
    step.classList.toggle("blocked", index === progress.blockedIndex);
    step.classList.toggle("locked", !setup && index > progress.availableThrough);
    step.classList.toggle("presentation-current", index === activePresentationStepIndex);
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

  currentStepBadge.textContent = `Step ${activePresentationStepIndex + 1} of ${presentationPanels.length} / 第 ${activePresentationStepIndex + 1} 步，共 ${presentationPanels.length} 步`;
  currentStepTitle.textContent = `${label} · ${title}`;
  currentStepHint.textContent = stepHintFromPanel(activePanel);

  prevStepButton.disabled = activePresentationStepIndex === 0;
  nextStepButton.disabled = activePresentationStepIndex === presentationPanels.length - 1;

  syncPresentationFlowClasses(currentWorkflowState);
}

function goToPresentationStep(index) {
  activePresentationStepIndex = clampPresentationStep(index);
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

function scenarioMapPreset(scenarioKey) {
  return scenarioKey === "construction" ? "construction" : "wildfire";
}

function clearMissionMapImage(status = "Auto scenario imagery / 自動情境底圖") {
  missionMap.classList.remove("has-image");
  missionMap.classList.remove("has-osm");
  missionMap.style.removeProperty("--map-image");
  missionMap.style.removeProperty("--map-position");
  osmMapFrame.classList.add("hidden");
  osmMapFrame.removeAttribute("src");
  mapImageStatus.textContent = status;
}

function openStreetMapUrl(view) {
  const bbox = view.bbox.join("%2C");
  const marker = view.marker.join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

function applyOpenStreetMap(scenarioKey = activeScenario, options = {}) {
  const viewKey = scenarioKey === "construction" ? "construction" : scenarioKey === "washington" ? "washington" : "wildfire";
  const view = options.forceBlank ? null : osmMapViews[viewKey];

  missionMap.classList.remove("has-image");
  missionMap.style.removeProperty("--map-image");
  missionMap.style.removeProperty("--map-position");

  if (!view) {
    missionMap.classList.remove("has-osm");
    osmMapFrame.classList.add("hidden");
    osmMapFrame.removeAttribute("src");
    mapImageStatus.textContent = "OpenStreetMap waits for a resolved AOI / OpenStreetMap 等待 AOI 解析";
    return;
  }

  missionMap.classList.add("has-osm");
  osmMapFrame.src = openStreetMapUrl(view);
  osmMapFrame.classList.remove("hidden");
  mapImageStatus.textContent = view.status;
}

function applyMissionMapImage(scenarioKey = activeScenario, options = {}) {
  const forceBlankAuto = Boolean(options.forceBlankAuto);

  if (selectedMapImageSource === "osm") {
    applyOpenStreetMap(scenarioKey, { forceBlank: forceBlankAuto });
    return;
  }

  if (selectedMapImageSource === "upload") {
    if (uploadedMapImageUrl) {
      missionMap.classList.remove("has-osm");
      osmMapFrame.classList.add("hidden");
      osmMapFrame.removeAttribute("src");
      missionMap.classList.add("has-image");
      missionMap.style.setProperty("--map-image", `url("${uploadedMapImageUrl}")`);
      missionMap.style.setProperty("--map-position", "center");
      mapImageStatus.textContent = `Uploaded: ${uploadedMapImageName} / 已上傳影像`;
      return;
    }

    clearMissionMapImage("No uploaded image selected / 尚未選擇上傳影像");
    return;
  }

  const presetKey = selectedMapImageSource === "auto" ? (forceBlankAuto ? null : scenarioMapPreset(scenarioKey)) : selectedMapImageSource;
  const preset = presetKey ? mapImagePresets[presetKey] : null;

  if (!preset) {
    clearMissionMapImage();
    return;
  }

  missionMap.classList.remove("has-osm");
  osmMapFrame.classList.add("hidden");
  osmMapFrame.removeAttribute("src");
  missionMap.classList.add("has-image");
  missionMap.style.setProperty("--map-image", `url("${mapAssetPath(preset.file)}")`);
  missionMap.style.setProperty("--map-position", preset.position);
  mapImageStatus.textContent = preset.status;
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

  applyMissionMapImage(activeScenario);
}

const suitabilityModel = [
  {
    title: "Orbit & Geometry / 軌道與幾何",
    detail: "Access window, revisit timing, off-nadir angle, slew demand, and swath overlap with the AOI."
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
    detail: "Validated intent, subsystem-level command plan, time-tagged execution sequence, and operator-review packet."
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

const defaultCustomSatellites = [
  { orbit: "SSO", battery: 78, position: "Ascending pass near target AOI", payload: "optical", status: "nominal" },
  { orbit: "SSO", battery: 54, position: "Descending pass west of target", payload: "thermal_ir", status: "nominal" },
  { orbit: "LEO", battery: 38, position: "Approaching target in 18 min", payload: "sar", status: "busy" },
  { orbit: "GEO", battery: 82, position: "Pacific relay view", payload: "communications", status: "nominal" }
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
    status: row.querySelector("[data-field='status']")?.value || defaultCustomSatellites[index % defaultCustomSatellites.length].status
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
    battery: Math.max(0, Math.min(100, Number(sat.battery) || 0))
  }));
}

function isCustomEnabled() {
  return customConstellationToggle.checked;
}

function evaluateCustomSatellite(sat, scenarioKey) {
  const desired = scenarioKey === "construction" ? ["optical", "multispectral"] : ["optical", "thermal_ir", "sar"];
  let score = 0;
  const reasons = [];
  let relayOnly = false;

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

  const executable = !relayOnly && sat.status !== "safe" && sat.battery >= 30 && desired.includes(sat.payload);
  const tone = executable && score >= 7 ? "good" : executable ? "warn" : "bad";
  const title = executable && score >= 7 ? "Recommended" : executable ? "Feasible with trade-off" : relayOnly ? "Relay support only" : "Rejected by constraint";

  return { sat, score, reasons, executable, tone, title, relayOnly };
}

function buildCustomConstellationPlan(scenarioKey) {
  const evaluations = getCustomSatellites()
    .map((sat) => evaluateCustomSatellite(sat, scenarioKey))
    .sort((a, b) => b.score - a.score);
  const best = evaluations.find((item) => item.executable);
  const missionLabel = scenarioKey === "construction" ? "site monitoring" : "emergency imaging";

  const cards = evaluations.map(({ sat, tone, reasons }) => ({
    name: sat.id,
    role: `${payloadLabels[sat.payload]} / ${sat.orbit}`,
    tone,
    metrics: [
      `Battery ${sat.battery}% / 電量 ${sat.battery}%`,
      `Position: ${sat.position} / 粗略位置`,
      `Status: ${statusLabels[sat.status]} / 狀態`,
      `Planner note: ${reasons[0]}`
    ],
    footer: reasons.slice(1, 3).join(" ") || "Custom asset is available for rough testing."
  }));

  const decisions = evaluations.map(({ sat, title, reasons, tone }) => [sat.id, title, reasons.join(" "), tone]);

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
            { subsystem: "Planner / 規劃器", text: "Adjust payload type, battery, status, or position and analyze again." }
          ]
        }
      ],
      command: null
    };
  }

  const captureMode = scenarioKey === "construction" ? "OPTICAL_REPEATABILITY" : "RESPONSIVE_IMAGING";
  const targetRef = scenarioKey === "construction" ? "CUSTOM-SITE-AOI" : "CUSTOM-URGENT-AOI";

  return {
    executable: true,
    constellationLabel: `${evaluations.length} custom satellites / ${evaluations.length} 顆自訂衛星`,
    cards,
    decisions,
    recommendedAsset: {
      title: best.sat.id,
      note: `${best.sat.id} is selected for ${missionLabel} based on custom battery, payload, status, orbit, and rough position.`
    },
    timeline: [
      {
        time: "T+00 min",
        detail: `Prepare ${best.sat.id} for ${missionLabel}.`,
        fromState: statusLabels[best.sat.status].split(" /")[0],
        toState: "Target Acquisition",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: `SET_TARGET_POINTING using rough position: ${best.sat.position}.` },
          { subsystem: "Payload / 感測器", text: `SELECT_PAYLOAD_MODE for ${payloadLabels[best.sat.payload]}.` },
          { subsystem: "Comms & Data / 通訊與資料", text: "RESERVE_STORAGE for custom test product." }
        ]
      },
      {
        time: "T+05 min",
        detail: "Execute the custom observation window.",
        fromState: "Target Acquisition",
        toState: "Imaging",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "HOLD_POINTING during the requested capture window." },
          { subsystem: "Payload / 感測器", text: `TRIGGER_CAPTURE in ${captureMode} mode.` },
          { subsystem: "Comms & Data / 通訊與資料", text: "Attach custom constellation metadata to the product." }
        ]
      },
      {
        time: "T+08 min",
        detail: "Recover and stage data delivery.",
        fromState: "Imaging",
        toState: "LVLH Recovery",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "RETURN_LVLH or configured nominal recovery attitude." },
          { subsystem: "Payload / 感測器", text: "POWER_OFF_PAYLOAD or return payload to standby." },
          { subsystem: "Comms & Data / 通訊與資料", text: "QUEUE_DOWNLINK; relay-only assets stay optional and operator-gated." }
        ]
      }
    ],
    command: {
      schema_version: "mission-command-packet.v0.2",
      mission_id: `CUSTOM-${scenarioKey.toUpperCase()}-001`,
      mission_type: scenarioKey === "construction" ? "custom_recurring_site_monitoring" : "custom_responsive_imaging",
      operator_gate: "required",
      selected_assets: [best.sat.id],
      custom_constellation: getCustomSatellites(),
      sequences: [
        {
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "SET_TARGET_POINTING",
          parameters: { target_ref: targetRef, rough_position: best.sat.position, orbit_type: best.sat.orbit }
        },
        {
          dispatch: "time_tagged_sequence",
          subsystem: "PAYLOAD",
          command: "TRIGGER_CAPTURE",
          parameters: { payload_family: best.sat.payload, mode: captureMode }
        },
        {
          dispatch: "post_capture_sequence",
          subsystem: "COMMS_DATA",
          command: "QUEUE_DOWNLINK",
          parameters: { product_ref: `CUSTOM-${best.sat.id}-PRODUCT` }
        }
      ],
      safety: {
        input_battery_pct: best.sat.battery,
        estimated_battery_after_task_pct: Math.max(0, best.sat.battery - 6),
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
          "Payload useful for hotspots / 載荷適合熱點判讀",
          "Existing high-priority task / 既有高優先任務保護中",
          "Not selected for requested optical capture / 不符合此筆光學任務主需求"
        ],
        footer: "Rejected by conflict and request mismatch."
      }
    ],
    decisions: [
      ["SAT-A", "Feasible with trade-off", "Fastest access, but the projected post-task battery margin is narrow and image quality is slightly below target.", "warn"],
      ["SAT-B", "Recommended", "Best combined fit across GSD, battery safety, maneuver demand, and lack of schedule conflict.", "good"],
      ["SAT-C", "Rejected by constraint", "Thermal imagery is operationally relevant, but this pass is locked by a protected mission and does not satisfy the requested optical capture alone.", "bad"]
    ],
    timeline: [
      {
        time: "14:20 UTC",
        detail: "Prepare the selected spacecraft for emergency imaging.",
        fromState: "LVLH",
        toState: "Target Acquisition",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "SET_TARGET_POINTING with +18 deg planned slew and target-settle timer." },
          { subsystem: "Payload / 感測器", text: "Keep optical payload in standby while attitude converges." },
          { subsystem: "Comms & Data / 通訊與資料", text: "Reserve 3.2 GB onboard storage for the wildfire product bundle." }
        ]
      },
      {
        time: "14:25 UTC",
        detail: "Lock the pointing geometry and ready the payload.",
        fromState: "Target Acquisition",
        toState: "Target Pointing",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "HOLD_TARGET_POINTING inside the approved off-nadir tolerance." },
          { subsystem: "Payload / 感測器", text: "POWER_ON_CAMERA and select optical emergency imaging mode." },
          { subsystem: "Comms & Data / 通訊與資料", text: "Tag the capture as mission WF-2026-001 for downstream packaging." }
        ]
      },
      {
        time: "14:32 UTC",
        detail: "Execute the observation event.",
        fromState: "Target Pointing",
        toState: "Imaging",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "MAINTAIN_POINTING through the capture window and freeze unnecessary slews." },
          { subsystem: "Payload / 感測器", text: "TRIGGER_CAPTURE at 3.0 m planning GSD over the resolved AOI." },
          { subsystem: "Comms & Data / 通訊與資料", text: "Store image strip and quality metadata in the mission product queue." }
        ]
      },
      {
        time: "14:34 UTC",
        detail: "Stage the product for delivery.",
        fromState: "Imaging",
        toState: "Product Staging",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "Release target hold and begin attitude recovery planning." },
          { subsystem: "Payload / 感測器", text: "CAMERA_STANDBY after acquisition completes." },
          { subsystem: "Comms & Data / 通訊與資料", text: "QUEUE_DOWNLINK for the next X-band ground pass; no crosslink relay requested." }
        ]
      },
      {
        time: "14:36 UTC",
        detail: "Return the spacecraft to its protected nominal profile.",
        fromState: "Product Staging",
        toState: "LVLH Recovery",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "RETURN_LVLH and verify wheel momentum remains inside planning limits." },
          { subsystem: "Payload / 感測器", text: "Keep the payload in standby pending operator-selected follow-on tasking." },
          { subsystem: "Comms & Data / 通訊與資料", text: "Publish a delivery-ready status to the ground workflow." }
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
          command: "SET_TARGET_POINTING",
          parameters: { slew_deg: 18, frame: "TARGET_AOI", settle_s: 300 }
        },
        {
          at: "2026-05-13T14:25:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "PAYLOAD",
          command: "POWER_ON_CAMERA",
          parameters: { mode: "OPTICAL_EMERGENCY", calibration_profile: "WF_FAST" }
        },
        {
          at: "2026-05-13T14:32:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "PAYLOAD",
          command: "TRIGGER_CAPTURE",
          parameters: { gsd_m: 3, target_ref: "WF-AOI-001" }
        },
        {
          at: "2026-05-13T14:34:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "COMMS_DATA",
          command: "QUEUE_DOWNLINK",
          parameters: { data_product: "WF-2026-001-OPTICAL", path: "NEXT_X_BAND_PASS" }
        },
        {
          at: "2026-05-13T14:36:00Z",
          dispatch: "time_tagged_sequence",
          subsystem: "ADCS",
          command: "RETURN_LVLH",
          parameters: { verify_wheel_momentum: true }
        }
      ],
      safety: {
        battery_after_task_pct: 67,
        storage_after_task_gb: 14.8,
        original_mission_interrupted: false,
        propulsion_required: false,
        crosslink_required: false
      }
    }
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
      ["Day 1", "Recommended", "SAT-01 establishes the baseline image under a stable local solar time window.", "good"],
      ["Day 2", "Recommended", "SAT-03 preserves lighting and viewing geometry within the selected monitoring tolerance.", "good"],
      ["Day 3", "Feasible with trade-off", "SAT-06 remains acceptable, but storage and pointing margin should be revalidated before release.", "warn"]
    ],
    timeline: [
      {
        time: "Day 1 / 10:42 local",
        detail: "Establish the baseline construction image.",
        fromState: "LVLH",
        toState: "Target Pointing",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "SET_TARGET_POINTING toward the operator-defined construction AOI." },
          { subsystem: "Payload / 感測器", text: "POWER_ON_CAMERA in repeatability-first optical mode." },
          { subsystem: "Comms & Data / 通訊與資料", text: "Create recurring product series CM-2026-014 and reserve catalog slot." }
        ]
      },
      {
        time: "Day 2 / 10:48 local",
        detail: "Repeat capture under comparable lighting.",
        fromState: "Scheduled Targeting",
        toState: "Imaging",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "HOLD_VIEWING_GEOMETRY inside the approved off-nadir tolerance." },
          { subsystem: "Payload / 感測器", text: "TRIGGER_CAPTURE for continuity monitoring." },
          { subsystem: "Comms & Data / 通訊與資料", text: "Attach image to the same recurring monitoring collection." }
        ]
      },
      {
        time: "Day 3 / 10:39 local",
        detail: "Continue the recurring monitoring sequence.",
        fromState: "Target Pointing",
        toState: "Imaging",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "Apply a slight pointing correction while remaining within policy limits." },
          { subsystem: "Payload / 感測器", text: "TRIGGER_CAPTURE and record geometry metadata." },
          { subsystem: "Comms & Data / 通訊與資料", text: "Queue low-latency preview product for quick operator verification." }
        ]
      },
      {
        time: "After each pass",
        detail: "Stage the daily product for downstream delivery.",
        fromState: "Imaging",
        toState: "Product Delivery",
        commands: [
          { subsystem: "ADCS / 姿態控制", text: "RETURN_LVLH after the site observation window closes." },
          { subsystem: "Payload / 感測器", text: "CAMERA_STANDBY after the recurring capture completes." },
          { subsystem: "Comms & Data / 通訊與資料", text: "QUEUE_DOWNLINK; optional crosslink relay stays disabled unless explicitly approved." }
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
          command: "SET_TARGET_POINTING",
          parameters: { target_ref: "CM-AOI-014", repeat: "daily", geometry_policy: "comparable" }
        },
        {
          dispatch: "recurring_time_tagged_sequence",
          subsystem: "PAYLOAD",
          command: "TRIGGER_CAPTURE",
          parameters: { mode: "OPTICAL_REPEATABILITY", lighting_policy: "consistent_shadow_profile" }
        },
        {
          dispatch: "post_capture_sequence",
          subsystem: "COMMS_DATA",
          command: "QUEUE_DOWNLINK",
          parameters: { collection_id: "CM-2026-014", path: "NEXT_AVAILABLE_PASS" }
        }
      ],
      safety: {
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
  renderNarrativePanels();
  resetPanels();

  if (nextScenario === "wildfire") {
    constructionResolved = false;
    constructionTools.classList.add("hidden");
  } else {
    constructionResolved = false;
    constructionTools.classList.remove("hidden");
  }

  goToPresentationStep(0);
}

function resetPanels() {
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
  mapTracks.forEach((track) => track.classList.add("hidden"));
  mapSatellites.forEach((satellite) => satellite.classList.add("hidden"));
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
                ({ subsystem, text }) => `
                  <div class="command-lane">
                    <strong>${subsystem}</strong>
                    <span>${text}</span>
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

function renderWildfire() {
  const scenario = scenarios.wildfire;
  const customPlan = isCustomEnabled() ? buildCustomConstellationPlan("wildfire") : null;
  const planSource = customPlan || scenario;

  missionMap.classList.remove("idle");
  applyMissionMapImage("wildfire");
  mapBadge.className = "pill";
  constellationBadge.className = "pill";
  mapTarget.className = "map-target wildfire-target";
  mapTarget.innerHTML = "<span>AOI</span>";
  mapTracks.forEach((track) => track.classList.remove("hidden"));
  mapSatellites.forEach((satellite) => satellite.classList.remove("hidden"));
  clarificationBox.className = "clarification-box ready";
  clarificationBox.innerHTML = "<strong>Ready / 已就緒。</strong><p>The target phrase can be resolved into a wildfire search AOI, so the system can proceed into imaging requirements and tasking analysis. / 系統能將該地名轉成火災搜尋 AOI，因此可進入成像需求與任務分析。</p>";
  mapCaption.textContent = customPlan
    ? "Custom constellation is being evaluated against the wildfire AOI. / 正以自訂星系評估火災 AOI。"
    : "Rocky Mountains wildfire search region resolved from natural language. / 已從自然語言解析出落基山火災搜尋區域。";
  mapBadge.textContent = customPlan ? "Custom constellation / 自訂星系" : "AOI resolved / 區域已解析";
  constellationBadge.textContent = customPlan ? customPlan.constellationLabel : scenario.constellation;

  renderDefinitionList(scenario.intent);
  renderCards(planSource.cards || planSource.satellites);
  renderSuitabilityModel();
  renderDecisionRows(planSource.decisions);
  renderRecommendedAsset(planSource.recommendedAsset);
  renderTimeline(planSource.timeline);
  renderCommandBoundary();
  activeCommandPacket = customPlan ? customPlan.command : scenario.command;
  updateWorkflowProgress("planned");
  planStatus.textContent = customPlan
    ? customPlan.executable
      ? "Custom constellation plan ready / 自訂星系計畫可供審核"
      : "Custom constellation has no executable imaging asset / 自訂星系無可執行拍攝資產"
    : "Validated recommendation ready / 已產出可審核建議";
}

function renderConstruction(resolved) {
  const scenario = scenarios.construction;
  const customPlan = resolved && isCustomEnabled() ? buildCustomConstellationPlan("construction") : null;
  const planSource = customPlan || scenario;

  missionMap.classList.remove("idle");
  applyMissionMapImage("construction", { forceBlankAuto: !resolved });
  constellationBadge.className = "pill";
  constellationBadge.textContent = customPlan ? customPlan.constellationLabel : scenario.constellation;
  mapTarget.classList.remove("hidden");
  mapBadge.className = resolved ? "pill" : "pill muted";
  renderSuitabilityModel();
  renderCommandBoundary();

  if (resolved) {
    mapTarget.className = "map-target construction-target";
    mapTarget.innerHTML = "<span>AOI</span>";
    mapTracks.forEach((track) => track.classList.remove("hidden"));
    mapSatellites.forEach((satellite) => satellite.classList.remove("hidden"));
    mapCaption.textContent = customPlan
      ? "Custom constellation is being evaluated against the resolved construction AOI. / 正以自訂星系評估已解析工地 AOI。"
      : "Construction site AOI resolved and ready for recurring monitoring. / 工地 AOI 已解析，可進入週期性監測。";
    mapBadge.textContent = customPlan ? "Custom constellation / 自訂星系" : "AOI resolved / 區域已解析";
  } else {
    mapTarget.className = "map-target construction-target";
    mapTarget.innerHTML = "<span>?</span>";
    mapTracks.forEach((track) => track.classList.add("hidden"));
    mapSatellites.forEach((satellite) => satellite.classList.add("hidden"));
    clarificationBox.className = "clarification-box warning";
    clarificationBox.innerHTML = "<strong>Clarification required / 需要補充資訊。</strong><p>\"This site\" cannot be converted into GPS coordinates or an AOI. Please provide an address, coordinates, or define the site on the map. / 這個描述無法直接轉成 GPS 或 AOI，請補充地址、座標，或在地圖上框選。</p>";
    mapCaption.textContent = "Planning is paused until the construction site is geolocated. / 在工地位置被解析前，系統暫停往下規劃。";
    mapBadge.textContent = "Target unresolved / 目標未解析";
  }

  renderDefinitionList(resolved ? scenario.resolvedIntent : scenario.unresolvedIntent);
  renderCards(resolved ? planSource.cards || planSource.satellites : []);
  renderDecisionRows(
    resolved
      ? planSource.decisions
      : [["System", "Paused", "Mission planning has not started because the target is not yet geolocated.", "warn"]]
  );
  renderTimeline(
    resolved
      ? planSource.timeline
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
    renderRecommendedAsset(planSource.recommendedAsset);
    activeCommandPacket = customPlan ? customPlan.command : scenario.command;
    updateWorkflowProgress("planned");
  } else {
    recommendedAsset.className = "recommended-asset empty-plan";
    recommendedAsset.innerHTML = "<span class=\"label\">Recommended asset / 最建議衛星</span><strong>Awaiting geolocation / 等待定位</strong>";
    activeCommandPacket = null;
    updateWorkflowProgress("blocked");
  }

  planStatus.textContent = resolved
    ? customPlan
      ? customPlan.executable
        ? "Custom recurring plan ready / 自訂週期任務可供批准"
        : "Custom constellation has no executable imaging asset / 自訂星系無可執行拍攝資產"
      : "Recurring plan ready for approval / 週期任務可供批准"
    : "Clarification required / 需要補充資訊";
}

async function requestLlmIntent() {
  try {
    const response = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: missionPrompt.value })
    });

    if (!response.ok) {
      return { source: "api_error", warning: "Interpret API returned an error." };
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

function appendLlmIntentSummary(result) {
  if (!result || !result.intent) return;

  const rows = [
    ["LLM source / LLM 來源", result.source === "openai" ? "OpenAI API" : "Fallback parser / 後備解析器"],
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

async function analyzeMission() {
  approved = false;
  exportButton.disabled = true;
  exportButton.textContent = "Export Command Packet / 匯出指令封包";
  activeCommandPacket = null;
  commandStatus.textContent = "Locked until approval / 核准前鎖定";
  commandOutput.textContent = "Approve a validated plan to reveal the execution packet.\n/ 批准已驗證的任務計畫後，系統才會展開執行指令。";

  const llmPromise = requestLlmIntent();

  if (activeScenario === "wildfire") {
    renderWildfire();
    approveButton.disabled = !activeCommandPacket;
    goToPresentationStep(1);
    appendLlmIntentSummary(await llmPromise);
    updatePresentationStep();
    return;
  }

  if (!constructionResolved) {
    renderConstruction(false);
    approveButton.disabled = true;
    goToPresentationStep(1);
    appendLlmIntentSummary(await llmPromise);
    updatePresentationStep();
    return;
  }

  renderConstruction(true);
  approveButton.disabled = !activeCommandPacket;
  goToPresentationStep(2);
  appendLlmIntentSummary(await llmPromise);
  updatePresentationStep();
}

function resolveConstructionTarget(mode) {
  constructionResolved = true;
  clarificationBox.className = "clarification-box ready";
  clarificationBox.innerHTML =
    mode === "address"
      ? "<strong>Target resolved / 目標已解析。</strong><p>The provided address has been converted into a geolocated construction AOI. The recurring imaging planner can continue. / 地址已轉為可定位的工地 AOI，系統可以繼續建立週期性拍攝計畫。</p>"
      : "<strong>AOI accepted / AOI 已接受。</strong><p>The map-defined construction boundary has been converted into a target geometry. The recurring imaging planner can continue. / 地圖框選的工地邊界已轉為目標幾何，系統可以繼續規劃。</p>";
  mapCaption.textContent = "Construction site AOI resolved and ready for recurring monitoring. / 工地 AOI 已解析，可進入週期性監測。";
  mapBadge.className = "pill";
  mapBadge.textContent = "AOI resolved / 區域已解析";
  mapTarget.className = "map-target construction-target";
  mapTarget.innerHTML = "<span>AOI</span>";
  aoiHint.classList.add("hidden");
  analyzeMission();
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
  goToPresentationStep(8);
}

function exportCommandPacket() {
  if (exportButton.disabled) {
    return;
  }

  commandStatus.textContent = "Export simulated for demo / 展示用匯出已完成";
  exportButton.textContent = "Packet Exported / 指令已匯出";
  updateWorkflowProgress("exported");
  goToPresentationStep(8);
}

mapImageSelect.addEventListener("change", () => {
  selectedMapImageSource = mapImageSelect.value;
  updateMapImageFromCurrentState();
});

mapImageUpload.addEventListener("change", () => {
  const [file] = mapImageUpload.files;
  if (!file) return;

  if (uploadedMapImageUrl) {
    URL.revokeObjectURL(uploadedMapImageUrl);
  }

  uploadedMapImageUrl = URL.createObjectURL(file);
  uploadedMapImageName = file.name;
  selectedMapImageSource = "upload";
  mapImageSelect.value = "upload";
  updateMapImageFromCurrentState();
});

clearMapImageButton.addEventListener("click", () => {
  if (uploadedMapImageUrl) {
    URL.revokeObjectURL(uploadedMapImageUrl);
  }

  uploadedMapImageUrl = null;
  uploadedMapImageName = "";
  mapImageUpload.value = "";
  selectedMapImageSource = "auto";
  mapImageSelect.value = "auto";
  updateMapImageFromCurrentState();
});

scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => setScenario(button.dataset.scenario));
});

dashboardModeToggle.addEventListener("click", () => {
  setPresentationMode(!presentationModeEnabled);
});

prevStepButton.addEventListener("click", () => {
  goToPresentationStep(activePresentationStepIndex - 1);
});

nextStepButton.addEventListener("click", () => {
  goToPresentationStep(activePresentationStepIndex + 1);
});

analyzeButton.addEventListener("click", analyzeMission);
approveButton.addEventListener("click", approveMission);
exportButton.addEventListener("click", exportCommandPacket);
resolveAddressButton.addEventListener("click", () => {
  if (!addressInput.value.trim()) {
    addressInput.focus();
    return;
  }
  resolveConstructionTarget("address");
});

generateConstellationButton.addEventListener("click", () => {
  renderCustomEditor();
});

applyCustomConstellationButton.addEventListener("click", () => {
  customConstellationToggle.checked = true;
  if (!missionMap.classList.contains("idle")) {
    analyzeMission();
  }
});

customConstellationToggle.addEventListener("change", () => {
  if (!missionMap.classList.contains("idle")) {
    analyzeMission();
  }
});

drawAoiButton.addEventListener("click", () => {
  aoiHint.classList.remove("hidden");
  mapCaption.textContent = "AOI drawing mode active. Click the map to confirm the construction site boundary. / 已進入 AOI 框選模式，請點擊地圖確認工地範圍。";
  goToPresentationStep(3);
});

document.querySelector(".mission-map").addEventListener("click", () => {
  if (activeScenario === "construction" && !constructionResolved && !aoiHint.classList.contains("hidden")) {
    resolveConstructionTarget("map");
  }
});

renderPresentationFlow();
renderCustomEditor();
setScenario("wildfire");
setPresentationMode(true);
