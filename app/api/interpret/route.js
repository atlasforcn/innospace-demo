import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function fallbackIntent(prompt) {
  const lower = String(prompt || "").toLowerCase();
  const isConstruction = lower.includes("construction") || lower.includes("site");
  const isWildfire = lower.includes("wildfire") || lower.includes("fire");
  const needsClarification = isConstruction && lower.includes("this site");

  return {
    mission_category: isConstruction ? "recurring_site_monitoring" : isWildfire ? "urgent_disaster_response" : "change_detection",
    priority: isWildfire ? "high" : "routine",
    target_resolution: {
      status: needsClarification ? "needs_clarification" : isWildfire ? "candidate" : "needs_clarification",
      label: isWildfire ? "Rocky Mountains candidate AOI" : isConstruction ? "ambiguous construction site" : "unspecified target",
      coordinates: null,
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
      max_off_nadir_deg: isConstruction ? 8 : 25,
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

export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Missing prompt" }, { status: 400 });
  }

  const schemaPath = path.join(process.cwd(), "schemas", "mission-intent.schema.json");
  const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      source: "fallback",
      warning: "OPENAI_API_KEY is not configured. Returning deterministic fallback intent.",
      intent: fallbackIntent(prompt)
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Convert EO mission requests into MissionIntent JSON only. If target location is ambiguous, set target_resolution.status to needs_clarification and ask precise clarification questions. Never invent spacecraft commands."
        },
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
    const errorText = await response.text();
    return Response.json({ error: "OpenAI API request failed", detail: errorText }, { status: 502 });
  }

  const responseJson = await response.json();
  const outputText = extractOutputText(responseJson);
  const intent = JSON.parse(outputText);

  return Response.json({ source: "openai", intent });
}
