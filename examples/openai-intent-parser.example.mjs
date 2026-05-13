// Example only. Do not run this in the browser.
// Set OPENAI_API_KEY in a server-side environment before using.

import OpenAI from "openai";
import fs from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const schema = JSON.parse(
  await fs.readFile(new URL("../schemas/mission-intent.schema.json", import.meta.url), "utf8")
);

export async function parseMissionIntent(prompt) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You convert EO mission requests into MissionIntent JSON only. If target location is ambiguous, set target_resolution.status to needs_clarification and ask precise clarification questions. Never invent spacecraft commands."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "MissionIntent",
        schema,
        strict: true
      }
    }
  });

  return JSON.parse(response.output_text);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv.slice(2).join(" ") ||
    "A wildfire has been reported in the Rocky Mountains. Acquire optical imagery as soon as possible.";
  console.log(JSON.stringify(await parseMissionIntent(prompt), null, 2));
}
