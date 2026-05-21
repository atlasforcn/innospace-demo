import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "Content-Type"
};

const SATELLITE_KNOWLEDGE_RELATIVE_PATH = path.join("docs", "satellite-operation-constraints.md");
const SATELLITE_KNOWLEDGE_MAX_CHARS = 28000;

let satelliteKnowledgeCache = null;

function knownAoiFromText(text) {
  const source = String(text || "");
  if (/阿里山|alishan|chiayi|嘉義/i.test(source)) {
    return {
      label: "Alishan Township, Chiayi County, Taiwan",
      geometry: "regional_area",
      coordinates: { lat: 23.51, lon: 120.81 }
    };
  }
  if (/落基山|洛磯山|rocky/i.test(source)) {
    return {
      label: "Rocky Mountains, Colorado, USA regional AOI",
      geometry: "regional_area",
      coordinates: { lat: 40.3428, lon: -105.6836 }
    };
  }
  if (/西雅圖|seattle/i.test(source)) {
    return {
      label: "Downtown Seattle, Seattle, WA, USA",
      geometry: "point",
      coordinates: { lat: 47.605, lon: -122.3344 }
    };
  }
  if (/華盛頓|washington|d\.c\./i.test(source)) {
    return {
      label: "Washington, DC, USA",
      geometry: "point",
      coordinates: { lat: 38.9072, lon: -77.0369 }
    };
  }
  return null;
}

function normalizeCoordinates(value, fallbackValue = null) {
  const lat = Number(value?.lat ?? value?.latitude);
  const lon = Number(value?.lon ?? value?.lng ?? value?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };

  const fallbackLat = Number(fallbackValue?.lat ?? fallbackValue?.latitude);
  const fallbackLon = Number(fallbackValue?.lon ?? fallbackValue?.lng ?? fallbackValue?.longitude);
  if (Number.isFinite(fallbackLat) && Number.isFinite(fallbackLon)) {
    return { lat: fallbackLat, lon: fallbackLon };
  }
  return null;
}

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init.headers || {})
    }
  });
}

async function loadSatelliteMissionKnowledge() {
  if (satelliteKnowledgeCache !== null) return satelliteKnowledgeCache;

  try {
    const knowledgePath = path.join(process.cwd(), SATELLITE_KNOWLEDGE_RELATIVE_PATH);
    const content = await fs.readFile(knowledgePath, "utf8");
    satelliteKnowledgeCache = content.length > SATELLITE_KNOWLEDGE_MAX_CHARS
      ? content.slice(0, SATELLITE_KNOWLEDGE_MAX_CHARS) + "\n\n[Reference truncated for prompt budget.]"
      : content;
  } catch (error) {
    satelliteKnowledgeCache = "";
  }

  return satelliteKnowledgeCache;
}

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

function fallbackTargetLabel(prompt, { isCustomDrill, isWildfire, isConstruction, isLandslide }) {
  const text = String(prompt || "");
  const knownAoi = knownAoiFromText(text);
  if (knownAoi) return knownAoi.label;
  if (/taiwan|台灣|臺灣/i.test(text)) return "Taiwan candidate AOI";
  if (isCustomDrill) return "operator-defined custom AOI";
  if (isWildfire) return "Rocky Mountains candidate AOI";
  if (isLandslide) return "debris-flow candidate AOI";
  if (isConstruction) return "ambiguous construction site";
  return "unspecified target";
}

function fallbackIntent(prompt) {
  const raw = String(prompt || "");
  const lower = String(prompt || "").toLowerCase();
  const isConstruction = lower.includes("construction") || lower.includes("site") || /施工|工地/.test(raw);
  const isWildfire = lower.includes("wildfire") || lower.includes("fire") || /森林大火|山火|火災/.test(raw);
  const isLandslide = lower.includes("landslide") || lower.includes("debris") || lower.includes("mudslide") || /土石流|山崩/.test(raw);
  const isMaritime = lower.includes("maritime") || lower.includes("ship") || lower.includes("vessel") || lower.includes("ais") || /船舶|海事|港口|漁船/.test(raw);
  const isComms = lower.includes("communications") || lower.includes("communication") || lower.includes("relay") || lower.includes("downlink") || lower.includes("iot") || /通訊|中繼|下傳|物聯網/.test(raw);
  const isCustomDrill = lower.includes("custom") || lower.includes("slew") || lower.includes("off-nadir") || lower.includes("washington");
  const needsClarification = isConstruction && lower.includes("this site");
  const knownAoi = knownAoiFromText(raw);
  const targetLabel = fallbackTargetLabel(raw, { isCustomDrill, isWildfire, isConstruction, isLandslide });
  const hasCandidateTarget = isWildfire || isCustomDrill || isLandslide || /alishan|阿里山|taiwan|台灣|臺灣/i.test(raw);
  const missionCategory = isComms
    ? "communications_relay_request"
    : isMaritime
      ? "maritime_monitoring"
      : isCustomDrill
        ? "custom_off_nadir_imaging_drill"
        : isConstruction
          ? "recurring_site_monitoring"
          : isWildfire || isLandslide
            ? "urgent_disaster_response"
            : "change_detection";
  const payloadFamily = isComms ? "communications_relay" : isMaritime ? "sar" : "optical";

  return {
    mission_category: missionCategory,
    priority: isWildfire || isCustomDrill || isLandslide || isMaritime ? "high" : "routine",
    target_resolution: {
      status: needsClarification ? "needs_clarification" : hasCandidateTarget ? "candidate" : "needs_clarification",
      label: targetLabel,
      coordinates: knownAoi?.coordinates || null,
      geometry: knownAoi?.geometry || (isWildfire || isLandslide ? "regional_area" : "point")
    },
    observation_request: {
      payload_family: payloadFamily,
      gsd_target_m: isComms ? null : isMaritime ? 10 : isWildfire || isLandslide ? 3 : 1,
      cadence: isConstruction ? "daily" : "once",
      delivery_latency: isWildfire || isLandslide || isMaritime ? "rapid" : "best_effort"
    },
    constraints: {
      preserve_existing_missions: true,
      comparable_lighting: isConstruction,
      max_off_nadir_deg: isConstruction ? 8 : isCustomDrill ? 35 : 25,
      cloud_tolerance_pct: null
    },
    operator_gate: true,
    clarification_questions: needsClarification
      ? ["Please provide an address, coordinates, or draw an AOI for the construction site."]
      : []
  };
}

function normalizePayloadFamily(value, fallbackValue) {
  const payloadFamilies = new Set(["optical", "multispectral", "thermal_ir", "sar", "communications_relay"]);
  const normalized = String(value || "").toLowerCase().trim();
  const aliases = {
    vhr_optical: "optical",
    panchromatic: "optical",
    rgb: "optical",
    electro_optical: "optical",
    eo: "optical",
    hyperspectral: "multispectral",
    thermal: "thermal_ir",
    infrared: "thermal_ir",
    radar: "sar",
    insar: "sar",
    ais: "sar",
    adsb: "communications_relay",
    rf_monitor: "communications_relay",
    communications: "communications_relay",
    comms: "communications_relay",
    relay: "communications_relay",
    pnt: "communications_relay",
    gnss: "communications_relay"
  };

  if (payloadFamilies.has(normalized)) return normalized;
  return aliases[normalized] || fallbackValue;
}

function extractOutputText(responseJson) {
  if (typeof responseJson.output_text === "string") return responseJson.output_text;

  const chunks = [];
  for (const item of responseJson.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("");
}

function parseJsonObject(text) {
  const trimmed = String(text || "").trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw error;
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function normalizeIntent(intent, prompt) {
  const fallback = fallbackIntent(prompt);
  const knownAoi = knownAoiFromText(`${prompt} ${intent?.target_resolution?.label || ""}`);
  const missionCategories = new Set([
    "custom_off_nadir_imaging_drill",
    "recurring_site_monitoring",
    "urgent_disaster_response",
    "change_detection",
    "maritime_monitoring",
    "communications_relay_request"
  ]);
  const priorities = new Set(["routine", "elevated", "high", "critical"]);
  const targetStatuses = new Set(["resolved", "candidate", "needs_clarification"]);
  const geometries = new Set(["point", "bbox", "polygon", "regional_area"]);
  const cadences = new Set(["once", "daily", "weekly", null]);
  const deliveryLatencies = new Set(["best_effort", "rapid", "near_real_time", null]);

  const targetResolution = {
    ...fallback.target_resolution,
    ...(intent?.target_resolution || {})
  };
  const observationRequest = {
    ...fallback.observation_request,
    ...(intent?.observation_request || {})
  };
  const constraintOverrides =
    intent?.constraints && typeof intent.constraints === "object" && !Array.isArray(intent.constraints)
      ? intent.constraints
      : {};
  const normalizedTargetStatus = targetStatuses.has(targetResolution.status)
    ? targetResolution.status
    : fallback.target_resolution.status;
  const targetStatus =
    fallback.target_resolution.status !== "needs_clarification" && normalizedTargetStatus === "needs_clarification"
      ? fallback.target_resolution.status
      : normalizedTargetStatus;
  const targetCoordinates = normalizeCoordinates(
    targetResolution.coordinates,
    knownAoi?.coordinates || fallback.target_resolution.coordinates
  );

  return {
    ...fallback,
    ...intent,
    mission_category: missionCategories.has(intent?.mission_category) ? intent.mission_category : fallback.mission_category,
    priority: priorities.has(intent?.priority) ? intent.priority : fallback.priority,
    target_resolution: {
      ...targetResolution,
      label: knownAoi && targetStatus !== "needs_clarification" ? knownAoi.label : targetResolution.label,
      status: targetStatus,
      coordinates: targetCoordinates,
      geometry: knownAoi?.geometry || (geometries.has(targetResolution.geometry) ? targetResolution.geometry : fallback.target_resolution.geometry)
    },
    observation_request: {
      ...observationRequest,
      payload_family: normalizePayloadFamily(observationRequest.payload_family, fallback.observation_request.payload_family),
      cadence: cadences.has(observationRequest.cadence) ? observationRequest.cadence : fallback.observation_request.cadence,
      delivery_latency: deliveryLatencies.has(observationRequest.delivery_latency) ? observationRequest.delivery_latency : fallback.observation_request.delivery_latency
    },
    constraints: {
      ...fallback.constraints,
      ...constraintOverrides
    },
    operator_gate: typeof intent?.operator_gate === "boolean" ? intent.operator_gate : fallback.operator_gate,
    clarification_questions: targetStatus === "needs_clarification" && Array.isArray(intent?.clarification_questions)
      ? intent.clarification_questions
      : fallback.clarification_questions
  };
}

function buildMissionIntentSystem(satelliteKnowledge) {
  const referenceBlock = satelliteKnowledge
    ? `\n\nSatellite mission reference loaded from ${SATELLITE_KNOWLEDGE_RELATIVE_PATH}:\n\n${satelliteKnowledge}`
    : "";

  return [
    "Convert satellite mission requests into MissionIntent JSON only.",
    "Use the satellite mission reference to choose payload_family, GSD target, cadence, latency, and constraints.",
    "Stay within the MissionIntent schema. Use only these payload_family values: optical, multispectral, thermal_ir, sar, communications_relay.",
    "For maritime monitoring, generally prefer sar for wide-area or all-weather detection, optical for requested visual detail, and communications_relay only for AIS/RF/relay-only requests.",
    "For communications, relay, IoT, PNT, AIS-only, ADS-B-only, or RF-monitoring requests, use communications_relay and set gsd_target_m to null unless an imaging product is also requested.",
    "For wildfire or urgent disaster response, choose optical/multispectral/SAR/thermal_ir according to cloud, daylight, smoke, heat, and speed constraints; do not assume high-resolution optical works through cloud.",
    "For named regional disaster targets such as the Rocky Mountains or Alishan, return a candidate regional_area with approximate coordinates instead of blocking the mission; the ground system can refine the AOI later.",
    "If target location is ambiguous, set target_resolution.status to needs_clarification and ask precise clarification questions.",
    "Do not invent exact future capture times or historical observation windows in MissionIntent; leave timing to the downstream access planner.",
    "Never invent spacecraft commands, final satellite selection, or flight-certified telecommands.",
    "The JSON object must include mission_category, priority, target_resolution, observation_request, constraints, operator_gate, and clarification_questions.",
    referenceBlock
  ].join(" ");
}

async function callOpenRouter(prompt, options = {}) {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const model = options.model || process.env.OPENROUTER_MODEL || "openrouter/free";
  const missionIntentSystem = await buildMissionIntentSystem(await loadSatelliteMissionKnowledge());
  const requestBody = {
    model,
    messages: [
      { role: "system", content: missionIntentSystem },
      { role: "user", content: prompt }
    ],
    temperature: 0.1
  };

  if (options.responseFormat !== false) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
      "HTTP-Referer": "https://innospace-demo.vercel.app",
      "X-Title": "INNOspace Mission Demo"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const responseJson = await response.json();
  const content = responseJson.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`OpenRouter returned an empty message from ${responseJson.model || model}`);
  }
  return normalizeIntent(parseJsonObject(content), prompt);
}

async function callOpenAI(prompt, schema) {
  if (!process.env.OPENAI_API_KEY) return null;
  const missionIntentSystem = await buildMissionIntentSystem(await loadSatelliteMissionKnowledge());

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: missionIntentSystem },
        { role: "user", content: prompt }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "MissionIntent",
          schema,
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const responseJson = await response.json();
  return normalizeIntent(parseJsonObject(extractOutputText(responseJson)), prompt);
}

export async function POST(request) {
  const { prompt, provider } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return json({ error: "Missing prompt" }, { status: 400 });
  }

  const requestedProvider = ["auto", "openrouter", "grok", "openai"].includes(provider) ? provider : "auto";
  const schemaPath = path.join(process.cwd(), "schemas", "mission-intent.schema.json");
  const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
  await loadSatelliteMissionKnowledge();
  const providerErrors = [];

  if (requestedProvider === "auto" || requestedProvider === "openrouter") {
    try {
      const openRouterIntent = await callOpenRouter(prompt, {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL || "openrouter/free",
        responseFormat: false
      });
      if (openRouterIntent) {
        return json({ source: "openrouter", intent: openRouterIntent, knowledge_base: SATELLITE_KNOWLEDGE_RELATIVE_PATH });
      }
    } catch (error) {
      providerErrors.push({ source: "openrouter", message: error.message });
    }
  }

  if (requestedProvider === "auto" || requestedProvider === "grok") {
    try {
      const grokIntent = await callOpenRouter(prompt, {
        apiKey: process.env.OPENROUTER_API_GROK_KEY,
        model: process.env.OPENROUTER_GROK_MODEL || "x-ai/grok-4.3"
      });
      if (grokIntent) {
        return json({ source: "openrouter_grok", intent: grokIntent, knowledge_base: SATELLITE_KNOWLEDGE_RELATIVE_PATH });
      }
    } catch (error) {
      providerErrors.push({ source: "openrouter_grok", message: error.message });
    }
  }

  if (requestedProvider === "auto" || requestedProvider === "openai") {
    try {
      const openAiIntent = await callOpenAI(prompt, schema);
      if (openAiIntent) {
        return json({ source: "openai", intent: openAiIntent, knowledge_base: SATELLITE_KNOWLEDGE_RELATIVE_PATH });
      }
    } catch (error) {
      providerErrors.push({ source: "openai", message: error.message });
    }
  }

  return json({
    error: providerErrors.length
      ? "Configured LLM providers failed. No deterministic mission intent was returned."
      : "No LLM provider API key is configured. No deterministic mission intent was returned.",
    provider_errors: providerErrors,
    deterministic_fallback_allowed: false
  }, { status: 503 });
}
