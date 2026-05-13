# LLM Provider Decision / LLM 供應商接入決策

## Recommendation / 建議

Use the **OpenAI API** directly for this demo, not the ChatGPT consumer web app.

本 demo 建議直接使用 **OpenAI API**，不要試圖把 ChatGPT 網頁版或 ChatGPT 訂閱本身接進系統。

## Why / 原因

The product needs a backend-callable LLM that can:

- accept natural-language mission requests
- return a strict JSON mission-intent object
- support schema-constrained output
- be called from a server-side API route
- keep the API key outside the browser

這個產品需要的是能由後端呼叫的 LLM：

- 接收自然語言任務需求
- 回傳嚴格 JSON 任務意圖物件
- 支援 schema 約束輸出
- 能從 server-side API route 呼叫
- API key 不會暴露在前端瀏覽器

## Can I connect my ChatGPT account directly? / 可以直接接我的 ChatGPT 嗎？

Not as a production API. ChatGPT subscriptions and the OpenAI API are separate surfaces. A ChatGPT Plus/Pro/Team subscription does not automatically become an API key for an external app.

不能當作正式 API 直接接。ChatGPT 訂閱和 OpenAI API 是不同產品面。ChatGPT Plus/Pro/Team 不會自動變成外部 app 可使用的 API key。

If you want this demo to call a model, create an OpenAI API key from the OpenAI platform and store it as a server-side environment variable:

如果要讓 demo 呼叫模型，請在 OpenAI platform 建立 API key，並把它放在後端環境變數中：

```bash
OPENAI_API_KEY=...
```

## Best architecture for this project / 本專案最佳架構

```text
Browser UI
  -> Backend API route
    -> OpenAI Responses API with Structured Outputs
      -> MissionIntent JSON
        -> Deterministic planner
          -> Bounded command envelope
            -> command-boundary validator
              -> operator approval
```

## What the LLM should do / LLM 應該做什麼

The LLM should only produce mission intent, not final operational authority.

LLM 只應該產生任務意圖，不應該直接成為最終操作權威。

Allowed:

- parse intent
- classify mission type
- infer preliminary sensing needs
- detect missing location information
- ask clarification questions
- return JSON matching `schemas/mission-intent.schema.json`

Not allowed:

- choose final satellite without planner validation
- invent commands
- bypass operator approval
- emit propulsion or crosslink execution commands directly

## Implementation path / 實作路徑

1. Add a small backend endpoint such as `/api/interpret`.
2. The endpoint calls OpenAI with a strict mission-intent schema.
3. The frontend sends the prompt to `/api/interpret` instead of using hard-coded scenario parsing.
4. The deterministic planner validates target, payload, orbital opportunity, battery, storage, and conflicts.
5. The planner emits only `command-envelope.schema.json` compliant output.
6. `command-boundary.js` validates the final command envelope before operator approval.

## Local demo note / 本地 demo 注意事項

The current static demo must not put the OpenAI API key in `script.js`, because that would expose the key in the browser.

目前靜態 demo 不應把 OpenAI API key 寫進 `script.js`，因為前端瀏覽器會暴露 key。

For real model calls, convert the project to a lightweight backend app such as:

- Next.js API route
- Express server
- Cloudflare Worker
- Vercel serverless function

Recommended first production-ish step: **Next.js on Vercel**.
