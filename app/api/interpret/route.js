import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function fallbackIntent(prompt) {
  const lower = String(prompt || "").toLowerCase();
  const isConstruction = lower.includes("construction") || lower.includes("site");
  const isWildfire = lower.includes("wildfire") || lower.includes("fire");
  const isCustomDrill = lower.includes("custom") || lower.includes("slew") || lower.includes("off-nadir") || lower.includes("washington");
  const needsClarification = isConstruction && lower.includes("this site");

  return {
    mission_category: isCustomDrill ? "custom_off_nadir_imaging_drill" : isConstruction ? "recurring_site_monitoring" : isWildfire ? "urgent_disaster_response" : "change_detection",
    priority: isWildfire || isCustomDrill ? "high" : "routine",
    target_resolution: {
      status: needsClarification ? "needs_clarification" : isWildfire || isCustomDrill ? "candidate" : "needs_clarification",
      label: isCustomDrill ? "Washington D.C. custom AOI" : isWildfire ? "Rocky Mountains candidate AOI" : isConstruction ? "ambiguous construction site" : "unspecified target",
      geometry: isWildfire ? "regional_area" : "point"
    },
    observation_request: {
      payload_family: "optical",
      gsd_target_m: isWildfire ? 3 : 1,
      cadence: isConstruction ? "daily" : "once",
      delivery_latency: isWildfire ? "rapid" : "best_effort"
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
  const missionCategories = new Set(["custom_off_nadir_imaging_drill", "recurring_site_monitoring", "urgent_disaster_response", "change_detection"]);
  const priorities = new Set(["routine", "elevated", "high", "critical"]);
  const targetStatuses = new Set(["resolved", "candidate", "needs_clarification"]);
  const geometries = new Set(["point", "bbox", "polygon", "regional_area"]);
  const payloadFamilies = new Set(["optical", "multispectral", "thermal_ir", "sar", "communications_relay"]);
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

  return {
    ...fallback,
    ...intent,
    mission_category: missionCategories.has(intent?.mission_category) ? intent.mission_category : fallback.mission_category,
    priority: priorities.has(intent?.priority) ? intent.priority : fallback.priority,
    target_resolution: {
      ...targetResolution,
      status: targetStatuses.has(targetResolution.status) ? targetResolution.status : fallback.target_resolution.status,
      geometry: geometries.has(targetResolution.geometry) ? targetResolution.geometry : fallback.target_resolution.geometry
    },
    observation_request: {
      ...observationRequest,
      payload_family: payloadFamilies.has(observationRequest.payload_family) ? observationRequest.payload_family : fallback.observation_request.payload_family,
      cadence: cadences.has(observationRequest.cadence) ? observationRequest.cadence : fallback.observation_request.cadence,
      delivery_latency: deliveryLatencies.has(observationRequest.delivery_latency) ? observationRequest.delivery_latency : fallback.observation_request.delivery_latency
    },
    constraints: {
      ...fallback.constraints,
      ...(intent?.constraints || {})
    },
    clarification_questions: Array.isArray(intent?.clarification_questions)
      ? intent.clarification_questions
      : fallback.clarification_questions
  };
}

const missionIntentSystem =
  "Convert EO mission requests into MissionIntent JSON only. If target location is ambiguous, set target_resolution.status to needs_clarification and ask precise clarification questions. Never invent spacecraft commands. The JSON object must include mission_category, priority, target_resolution, observation_request, constraints, operator_gate, and clarification_questions.";

async function callOpenRouter(prompt, options = {}) {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const model = options.model || process.env.OPENROUTER_MODEL || "openrouter/free";
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
    return Response.json({ error: "Missing prompt" }, { status: 400 });
  }

  const requestedProvider = ["auto", "openrouter", "grok", "openai"].includes(provider) ? provider : "auto";
  const schemaPath = path.join(process.cwd(), "schemas", "mission-intent.schema.json");
  const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
  const providerErrors = [];

  if (requestedProvider === "auto" || requestedProvider === "openrouter") {
    try {
      const openRouterIntent = await callOpenRouter(prompt, {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL || "openrouter/free",
        responseFormat: false
      });
      if (openRouterIntent) {
        return Response.json({ source: "openrouter", intent: openRouterIntent });
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
        return Response.json({ source: "openrouter_grok", intent: grokIntent });
      }
    } catch (error) {
      providerErrors.push({ source: "openrouter_grok", message: error.message });
    }
  }

  if (requestedProvider === "auto" || requestedProvider === "openai") {
    try {
      const openAiIntent = await callOpenAI(prompt, schema);
      if (openAiIntent) {
        return Response.json({ source: "openai", intent: openAiIntent });
      }
    } catch (error) {
      providerErrors.push({ source: "openai", message: error.message });
    }
  }

  return Response.json({
    source: "fallback",
    warning: providerErrors.length
      ? "Configured LLM provider failed. Returning deterministic fallback intent."
      : "No LLM provider API key is configured. Returning deterministic fallback intent.",
    provider_errors: providerErrors,
    intent: fallbackIntent(prompt)
  });
}
