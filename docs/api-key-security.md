# API Key Security / API Key 安全

## Immediate action / 立即處理

If an OpenAI API key has been pasted into chat, an issue, a public repo, a screenshot, or any shared document, treat it as exposed.

如果 OpenAI API key 曾被貼進對話、issue、公開 repo、截圖或任何共享文件，請視為已暴露。

Recommended action:

1. Delete or revoke the exposed key in the OpenAI API key dashboard.
2. Create a new key.
3. Store the new key only as a server-side environment variable.
4. Never place the key in `index.html`, `script.js`, frontend bundles, or committed files.

建議處理：

1. 到 OpenAI API key 頁面刪除或停用已暴露的 key。
2. 建立新的 key。
3. 新 key 只放在後端環境變數。
4. 不要把 key 放進 `index.html`、`script.js`、前端 bundle 或任何會 commit 的檔案。

## Public repository rule / 公開 repo 規則

This repository is public, so secrets must never be committed.

本 repo 是 public，因此絕對不要 commit 任何 secrets。

This project includes:

- `.gitignore` to block `.env` and `.env.*`
- `.env.example` as a safe template

## Local usage / 本地使用

For local backend development, create a private file such as `.env.local`:

```bash
OPENAI_API_KEY=your_new_key_here
```

Do not commit `.env.local`.

## Vercel or hosted usage / 線上部署使用

Set the key in the hosting provider's environment variable settings, for example:

```text
OPENAI_API_KEY = your_new_key_here
```

Then the backend route reads it from `process.env.OPENAI_API_KEY`.

## Security controls / 防濫用建議

- Use project-scoped API keys.
- Set usage limits and notification thresholds.
- Keep the key server-side only.
- Add rate limiting to the API route.
- Require a demo password or private route before public launch.
- Validate all LLM outputs against `mission-intent.schema.json` and `command-envelope.schema.json`.
- Run final commands through `lib/command-boundary.js`.
- Keep operator approval required for mission execution.
