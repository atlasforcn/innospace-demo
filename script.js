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
const mapTracks = document.querySelectorAll(".track");
const mapSatellites = document.querySelectorAll(".satellite");
const constellationBadge = document.getElementById("constellationBadge");
const satelliteCards = document.getElementById("satelliteCards");
const intentSummary = document.getElementById("intentSummary");
const decisionTable = document.getElementById("decisionTable");
const missionTimeline = document.getElementById("missionTimeline");
const planStatus = document.getElementById("planStatus");
const recommendedAsset = document.getElementById("recommendedAsset");
const commandStatus = document.getElementById("commandStatus");
const commandOutput = document.getElementById("commandOutput");
const exportButton = document.getElementById("exportButton");

let activeScenario = "wildfire";
let constructionResolved = false;
let approved = false;

const scenarios = {
  wildfire: {
    prompt: "A wildfire has been reported in the Rocky Mountains. Acquire optical imagery as soon as possible.",
    constellation: "3 SSO satellites",
    intent: [
      ["Mission type / 任務類型", "Urgent disaster response / 緊急災害應變"],
      ["Geolocation / 地理解析", "Rocky Mountains search region resolved to regional AOI / 已將落基山區域解析為可執行 AOI"],
      ["Derived target / 目標區域", "Representative AOI center: 39.18 deg N, 106.82 deg W / 代表中心點已建立"],
      ["Recommended GSD / 建議 GSD", "3.0 m rapid-response overview / 適合快速態勢判讀"],
      ["Observation priority / 觀測優先級", "Fastest safe optical capture / 以最快且安全的光學拍攝為優先"]
    ],
    satellites: [
      ["SAT-A", "Earliest access: 14:24 UTC", "Battery: 31%", "Payload: Optical medium-res"],
      ["SAT-B", "Earliest access: 14:32 UTC", "Battery: 73%", "Payload: Optical high-res"],
      ["SAT-C", "Earliest access: 14:29 UTC", "Battery: 66%", "Existing mission: high priority"]
    ],
    decisions: [
      ["SAT-A", "Feasible with trade-off", "Fastest access, but battery reserve is narrow after imaging.", "warn"],
      ["SAT-B", "Recommended", "Meets optical requirement, safer battery margin, no task conflict.", "good"],
      ["SAT-C", "Rejected by constraint", "Would interrupt an already committed high-priority mission.", "bad"]
    ],
    timeline: [
      [
        "14:20 UTC",
        "Prepare the selected satellite for emergency imaging.",
        "LVLH",
        "Target Acquisition",
        "Slew attitude by +18 deg toward the wildfire AOI.",
        "Keep optical payload off; camera remains in standby."
      ],
      [
        "14:25 UTC",
        "Lock target geometry and prepare the sensor.",
        "Target Acquisition",
        "Target Pointing",
        "Hold target-pointing mode and stabilize line of sight.",
        "Power on the optical payload and enter imaging-ready mode."
      ],
      [
        "14:32 UTC",
        "Execute the observation event.",
        "Target Pointing",
        "Imaging",
        "Maintain target-pointing attitude through the capture window.",
        "Trigger 3.0 m GSD optical capture."
      ],
      [
        "14:33 UTC",
        "Recover the spacecraft after capture.",
        "Imaging",
        "LVLH Recovery",
        "Return from target pointing toward nominal LVLH flight.",
        "Stop capture and place the camera back into standby."
      ]
    ],
    recommendedAsset: {
      title: "SAT-B",
      note: "Best balance of payload suitability, battery safety, and zero conflict with existing tasks."
    },
    command: {
      mission_id: "WF-2026-001",
      mission_type: "urgent_disaster_response",
      target: {
        label: "Rocky Mountains wildfire AOI",
        center_lat: 39.18,
        center_lon: -106.82,
        geometry: "regional_area"
      },
      imaging_requirements: {
        payload: "optical",
        recommended_gsd_m: 3,
        urgency: "high"
      },
      selected_asset: "SAT-B",
      timeline: [
        { time: "14:20:00Z", action: "begin_attitude_slew", angle_deg: 18 },
        { time: "14:25:00Z", action: "switch_payload_mode", mode: "optical_imaging" },
        { time: "14:32:00Z", action: "start_capture", gsd_m: 3 },
        { time: "14:33:10Z", action: "end_capture" }
      ],
      safety: {
        battery_after_task_pct: 67,
        original_mission_interrupted: false,
        operator_approval_required: true
      }
    }
  },
  construction: {
    prompt: "Monitor the construction progress of this site every day with comparable lighting and viewing conditions.",
    constellation: "10 SSO satellites",
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
      ["SAT-01", "Best Day 1 slot", "Local solar time: 10:42", "Off-nadir: 7 deg"],
      ["SAT-03", "Best Day 2 slot", "Local solar time: 10:48", "Off-nadir: 6 deg"],
      ["SAT-06", "Best Day 3 slot", "Local solar time: 10:39", "Off-nadir: 8 deg"],
      ["SAT-08", "Fallback option", "Lighting slightly degraded", "Available if primary conflicts"]
    ],
    decisions: [
      ["Day 1", "Recommended", "SAT-01 matches target solar time and viewing geometry.", "good"],
      ["Day 2", "Recommended", "SAT-03 preserves comparable illumination within tolerance.", "good"],
      ["Day 3", "Feasible with trade-off", "SAT-06 remains acceptable, with slight angle deviation.", "warn"]
    ],
    timeline: [
      [
        "Day 1 / 10:42 local",
        "Establish the baseline construction image.",
        "LVLH",
        "Target Pointing",
        "Transition from LVLH to the scheduled construction-site pointing geometry.",
        "Enable the optical payload for baseline imaging."
      ],
      [
        "Day 2 / 10:48 local",
        "Repeat capture under comparable lighting.",
        "Scheduled Targeting",
        "Imaging",
        "Hold requested off-nadir geometry inside the allowed tolerance.",
        "Trigger repeat capture for continuity analysis."
      ],
      [
        "Day 3 / 10:39 local",
        "Continue the recurring monitoring sequence.",
        "Target Pointing",
        "Imaging",
        "Preserve comparable observation geometry with a slight pointing adjustment.",
        "Capture the third progress-monitoring image."
      ],
      [
        "Ongoing",
        "Close the daily cycle and prepare for rescheduling.",
        "Imaging",
        "LVLH Recovery",
        "Return to nominal attitude profile after the capture window.",
        "Disable capture and return the camera to standby."
      ]
    ],
    recommendedAsset: {
      title: "SAT-01 primary / SAT-03 and SAT-06 continuity assets",
      note: "The plan favors daily continuity under comparable illumination and viewing geometry."
    },
    command: {
      mission_id: "CM-2026-014",
      mission_type: "recurring_site_monitoring",
      target: {
        label: "Operator-defined construction AOI",
        geometry: "polygon"
      },
      imaging_policy: {
        cadence: "daily",
        comparable_lighting: true,
        local_solar_time_window: "10:30-11:00",
        preferred_off_nadir_deg: { min: 5, max: 8 }
      },
      selected_assets: ["SAT-01", "SAT-03", "SAT-06"],
      scheduler_policy: {
        protect_existing_missions: true,
        revalidate_battery_before_execution: true
      },
      operator_approval_required: true
    }
  }
};

function setScenario(nextScenario) {
  activeScenario = nextScenario;
  approved = false;
  approveButton.disabled = true;
  exportButton.disabled = true;
  commandStatus.textContent = "Locked until approval / 核准前鎖定";
  commandOutput.textContent = "Approve a validated plan to reveal the execution packet.\n/ 批准已驗證的任務計畫後，系統才會展開執行指令。";
  scenarioButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === nextScenario);
  });
  missionPrompt.value = scenarios[nextScenario].prompt;
  resetPanels();

  if (nextScenario === "wildfire") {
    constructionResolved = false;
    constructionTools.classList.add("hidden");
  } else {
    constructionResolved = false;
    constructionTools.classList.remove("hidden");
  }
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
  mapTarget.classList.add("hidden");
  mapTracks.forEach((track) => track.classList.add("hidden"));
  mapSatellites.forEach((satellite) => satellite.classList.add("hidden"));
  aoiHint.classList.add("hidden");
  intentSummary.innerHTML = "";
  satelliteCards.innerHTML = "";
  decisionTable.innerHTML = "";
  missionTimeline.innerHTML = "";
  planStatus.textContent = "Awaiting analysis / 等待分析";
  recommendedAsset.className = "recommended-asset empty-plan";
  recommendedAsset.innerHTML = "<span class=\"label\">Recommended asset / 最建議衛星</span><strong>Awaiting analysis / 等待分析</strong>";
}

function renderDefinitionList(entries) {
  intentSummary.innerHTML = entries
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderCards(cards) {
  satelliteCards.innerHTML = cards
    .map(
      ([name, line1, line2, line3]) => `
        <article class="satellite-card">
          <h3>${name}</h3>
          <p>${line1}</p>
          <p>${line2}</p>
          <p><strong>${line3}</strong></p>
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
      ([time, detail, fromState, toState, adcsCommand, cameraCommand]) => `
        <li>
          <strong>${time}</strong><br />
          <span>${detail}</span>
          <div class="command-lanes">
            <div class="command-lane">
              <strong>ADCS / 姿態控制</strong>
              <span>${adcsCommand}</span>
            </div>
            <div class="command-lane">
              <strong>Camera / 攝影機</strong>
              <span>${cameraCommand}</span>
            </div>
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

function renderWildfire() {
  const scenario = scenarios.wildfire;
  missionMap.classList.remove("idle");
  mapBadge.className = "pill";
  constellationBadge.className = "pill";
  mapTarget.className = "map-target wildfire-target";
  mapTarget.innerHTML = "<span>AOI</span>";
  mapTracks.forEach((track) => track.classList.remove("hidden"));
  mapSatellites.forEach((satellite) => satellite.classList.remove("hidden"));
  clarificationBox.className = "clarification-box ready";
  clarificationBox.innerHTML = "<strong>Ready / 已就緒。</strong><p>The target phrase can be resolved into a wildfire search AOI, so the system can proceed into imaging requirements and tasking analysis. / 系統能將該地名轉成火災搜尋 AOI，因此可進入成像需求與任務分析。</p>";
  mapCaption.textContent = "Rocky Mountains wildfire search region resolved from natural language. / 已從自然語言解析出落基山火災搜尋區域。";
  mapBadge.textContent = "AOI resolved / 區域已解析";
  constellationBadge.textContent = scenario.constellation;
  renderDefinitionList(scenario.intent);
  renderCards(scenario.satellites);
  renderDecisionRows(scenario.decisions);
  renderRecommendedAsset(scenario.recommendedAsset);
  renderTimeline(scenario.timeline);
  planStatus.textContent = "Validated recommendation ready / 已產出可審核建議";
}

function renderConstruction(resolved) {
  const scenario = scenarios.construction;
  missionMap.classList.remove("idle");
  constellationBadge.className = "pill";
  constellationBadge.textContent = scenario.constellation;
  mapTarget.classList.remove("hidden");
  mapBadge.className = resolved ? "pill" : "pill muted";
  if (resolved) {
    mapTarget.className = "map-target construction-target";
    mapTarget.innerHTML = "<span>AOI</span>";
    mapTracks.forEach((track) => track.classList.remove("hidden"));
    mapSatellites.forEach((satellite) => satellite.classList.remove("hidden"));
    mapCaption.textContent = "Construction site AOI resolved and ready for recurring monitoring. / 工地 AOI 已解析，可進入週期性監測。";
    mapBadge.textContent = "AOI resolved / 區域已解析";
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
  renderCards(resolved ? scenario.satellites : []);
  renderDecisionRows(
    resolved
      ? scenario.decisions
      : [["System", "Paused", "Mission planning has not started because the target is not yet geolocated.", "warn"]]
  );
  renderTimeline(
    resolved
      ? scenario.timeline
      : [["Awaiting target", "Provide an address, coordinates, or map AOI to continue."]]
  );
  if (resolved) {
    renderRecommendedAsset(scenario.recommendedAsset);
  } else {
    recommendedAsset.className = "recommended-asset empty-plan";
    recommendedAsset.innerHTML = "<span class=\"label\">Recommended asset / 最建議衛星</span><strong>Awaiting geolocation / 等待定位</strong>";
  }
  planStatus.textContent = resolved ? "Recurring plan ready for approval / 週期任務可供批准" : "Clarification required / 需要補充資訊";
}

function analyzeMission() {
  approved = false;
  exportButton.disabled = true;
  commandStatus.textContent = "Locked until approval / 核准前鎖定";
  commandOutput.textContent = "Approve a validated plan to reveal the execution packet.\n/ 批准已驗證的任務計畫後，系統才會展開執行指令。";
  if (activeScenario === "wildfire") {
    approveButton.disabled = false;
    renderWildfire();
    return;
  }

  if (!constructionResolved) {
    approveButton.disabled = true;
    renderConstruction(false);
    return;
  }

  approveButton.disabled = false;
  renderConstruction(true);
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
  commandOutput.textContent = JSON.stringify(scenarios[activeScenario].command, null, 2);
  exportButton.disabled = false;
}

scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => setScenario(button.dataset.scenario));
});

analyzeButton.addEventListener("click", analyzeMission);
approveButton.addEventListener("click", approveMission);
resolveAddressButton.addEventListener("click", () => {
  if (!addressInput.value.trim()) {
    addressInput.focus();
    return;
  }
  resolveConstructionTarget("address");
});
drawAoiButton.addEventListener("click", () => {
  aoiHint.classList.remove("hidden");
  mapCaption.textContent = "AOI drawing mode active. Click the map to confirm the construction site boundary. / 已進入 AOI 框選模式，請點擊地圖確認工地範圍。";
});
document.querySelector(".mission-map").addEventListener("click", () => {
  if (activeScenario === "construction" && !constructionResolved && !aoiHint.classList.contains("hidden")) {
    resolveConstructionTarget("map");
  }
});

setScenario("wildfire");
