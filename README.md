# Mission Abstraction Layer Demo / 任務抽象層展示系統

This prototype is a browser-ready competition demo for an operator-supervised EO mission orchestration concept.
這是一個可直接於瀏覽器展示的競賽 demo，用來呈現「操作員監督式」地球觀測任務編排概念。

It is designed to show both future product value and practical mission feasibility.
它的目標是同時展現未來產品價值，以及在任務操作上的實務可行性。

## What is included / 目前包含內容

- Wildfire response scenario / 森林大火應變情境
  - Natural-language request / 自然語言需求輸入
  - Geolocation resolution / 地理位置解析
  - GSD recommendation / GSD 建議
  - Satellite suitability comparison / 衛星適配性比較
  - Off-nadir slew feasibility, slew time, and ADCS power trade-off / 斜視轉向可行性、轉向時間與姿態控制用電取捨
  - Recommended satellite selection / 推薦衛星選擇
  - ADCS and camera command breakdown / ADCS 與攝影機指令拆分
  - Per-step spacecraft state transition / 每一步的衛星狀態轉移
  - Operator approval / 操作員批准
  - Machine command packet reveal / 展開機器指令封包

- Construction monitoring scenario / 建築工地監測情境
  - Clarification loop when the phrase `this site` is not geolocatable / 當 `this site` 無法轉成位置資訊時，系統會主動要求補充
  - Address-based or map-based AOI resolution / 支援地址解析或地圖框選 AOI
  - Daily monitoring plan with comparable lighting and viewing conditions / 產出每日拍攝，且盡量維持相近光影與觀測角度的監測計畫
  - Comparable off-nadir geometry and maneuver energy checks / 檢查相近斜視角與轉向用電
  - Multi-asset recurring observation strategy / 多顆衛星輪值式長期觀測策略
  - ADCS and camera command breakdown / ADCS 與攝影機指令拆分
  - Per-step spacecraft state transition / 每一步的衛星狀態轉移
  - Operator approval / 操作員批准
  - Machine command packet reveal / 展開機器指令封包

- Guided demo flow / 導覽式展示流程
  - Initial blank analysis state before any request is processed / 初始進站時維持空白分析狀態
  - Results appear only after the operator clicks `Analyze Request` / 只有按下 `Analyze Request` 後才顯示系統分析結果
  - Mission cards unlock through one state machine: `idle`, `blocked`, `planned`, `approved`, `exported` / 任務卡片依照同一套狀態機解鎖：`idle`、`blocked`、`planned`、`approved`、`exported`
  - Fleet sandbox and map display are setup cards, not spacecraft tasking steps / 星系沙盒與地圖顯示屬於展示設定，不算衛星任務步驟
  - Mission approval is placed directly below the recommended plan / 批准任務按鈕直接放在建議任務計畫下方
  - An export action becomes available after approval / 批准後才顯示匯出指令封包的下一步動作

- Custom Fleet Drill scenario / 自訂星系驗證情境
  - Custom constellation is now its own scenario; presets keep fixed default fleets / 自訂星系現在是獨立情境，預設情境保留固定星系
  - Activate the scenario from the third scenario button or `Run Custom Fleet Drill` / 可用第三個情境按鈕或 `Run Custom Fleet Drill` 執行
  - Set satellite count from 1 to 12 / 可設定 1 到 12 顆衛星
  - Configure orbit type, battery, rough position, payload type, spacecraft status, required slew angle, max slew angle, and slew rate / 可設定軌道類型、電量、粗略位置、酬載、衛星狀態、需要轉向角、最大轉向角與轉向速度
  - The planner estimates slew time, settle time, ADCS energy, total task energy, and post-task battery / 規劃器估算轉向時間、穩定時間、ADCS 用電、總任務用電與任務後電量
  - Mission map markers follow only the active custom scenario constellation / 地圖標記只會在自訂情境中跟著自訂星系同步

## How to view / 如何查看

Open `index.html` in a browser.
以瀏覽器開啟 `index.html` 即可查看。

Recommended walkthrough / 建議展示順序：

1. Start with the wildfire preset and click `Analyze Request`
   先選擇森林大火情境，按下 `Analyze Request`
2. Move through the unlocked mission cards: target gate, requirements, AOI/access, fleet readiness, feasibility rules, and candidate decision
   依序查看已解鎖的任務卡片：目標檢核、任務需求、區域與可見性、衛星可用性、可行性規則與候選決策
3. Review the recommended plan and the selected spacecraft
   查看建議任務計畫與最建議衛星
4. Inspect the ADCS and camera commands under each step
   檢視每一步底下拆分出的 ADCS 與攝影機指令
5. Click `Approve Mission Plan`
   按下 `Approve Mission Plan`
6. Review the revealed machine command packet
   查看展開後的機器指令封包
7. Switch to the construction preset
   切換到建築工地監測情境
8. Observe that the system pauses because `this site` is not geolocatable
   觀察系統因為 `this site` 無法定位，而暫停往下規劃
9. Resolve the target using an address or AOI drawing flow
   透過地址或地圖 AOI 框選完成目標解析
10. Review the recurring monitoring plan and command sequence
   查看週期性監測計畫與對應命令序列
11. Switch to `Custom Fleet Drill`, edit the sandbox satellites, and run the custom drill
    切換到 `Custom Fleet Drill`，修改沙盒衛星後執行自訂驗證
12. Review why each custom satellite is recommended, traded off, or rejected by slew capability and battery safety
    查看每顆自訂衛星為何因轉向能力與電量安全被推薦、保留或拒絕

## Operator flow logic / 操作流程邏輯

The demo uses a single tasking state machine so the interface cannot advance into spacecraft planning before the request is valid.
這個 demo 使用單一任務狀態機，避免介面在需求尚未有效前就進入衛星規劃。

- `idle`: only mission intake is available; result cards are locked / 只開放任務輸入，結果卡片鎖定
- `blocked`: target clarification is required; no satellite is scored or commanded / 需要補充目標資訊，不評分也不產生命令
- `planned`: feasibility evidence and recommended plan are visible, but commands remain locked / 可看見可行性證據與建議計畫，但指令仍鎖定
- `approved`: operator approval unlocks the command packet / 操作員批准後解鎖指令封包
- `exported`: command packet export is simulated for handoff / 模擬匯出指令封包以供展示交接

The left flow is always visible. Mission cards are opened only when their state allows it; setup cards stay available for scenario testing.
左側流程常駐顯示。任務卡片只有在狀態允許時才能開啟；展示設定卡片則保持可用，方便測試情境。

Preset wildfire and construction scenarios intentionally ignore the custom sandbox so they remain stable for presentation. The sandbox feeds only the Custom Fleet Drill scenario.
森林大火與工地監測會刻意忽略自訂沙盒，確保展演時預設情境穩定；沙盒只會套用到自訂星系驗證情境。

## Research-backed model / 研究後新增的模型

The current demo now reflects a deeper satellite tasking model.
目前 demo 已加入更完整的衛星任務判斷模型：

- Orbit and viewing geometry / 軌道與觀測幾何
- Attitude agility, slew time, settle time, and maneuver power / 姿態機動、轉向時間、穩定時間與機動用電
- Payload family and achievable image quality / 載荷類型與可達成影像品質
- Battery, storage, and spacecraft health / 電量、儲存與衛星健康狀態
- Existing mission conflict handling / 既有任務衝突處理
- Downlink and crosslink delivery path awareness / 下行與星間鏈路交付考量
- Clear command-boundary separation between ADCS, payload, comms/data, and operator-gated actions / 明確區分 ADCS、載荷、通訊資料鏈路與需操作員批准的動作

Related files / 相關檔案：

- `docs/research-brief.md`
- `docs/llm-integration-contract.md`
- `schemas/mission-intent.schema.json`

## LLM boundary choice / LLM 邊界方案

The recommended architecture is **not RAG-first** and **not skill-first**.
建議架構不是以 RAG 為主，也不是以 skill 為主。

The strongest option is a layered boundary: **Structured intent schema + deterministic planner + allowlisted command DSL + validator gate**.
最穩的方案是：**結構化任務 schema + 可驗證 planner + 白名單指令 DSL + 驗證器 gate**。

See / 詳見：

- `docs/llm-boundary-architecture.md`
- `schemas/command-envelope.schema.json`
- `lib/allowed-command-catalog.json`
- `lib/command-boundary.js`

## LLM provider decision / LLM 接入決策

Use the OpenAI API directly. Do not connect the ChatGPT consumer app as the backend API.
建議直接使用 OpenAI API，不要把 ChatGPT 網頁版或訂閱本身當作後端 API。

The API key should live only on the server side.
API key 只能放在後端，不能放在瀏覽器前端。

Related files / 相關檔案：

- `docs/llm-provider-decision.md`
- `examples/openai-intent-parser.example.mjs`

## API key safety / API Key 安全

This repository is public, so real API keys must never be committed.
這個 repo 是公開的，所以絕對不能 commit 真實 API key。

Use `.env.example` as a template and store the real key only in `.env.local` or a hosting provider secret manager.
請用 `.env.example` 當模板，真實 key 只能放在 `.env.local` 或部署平台的 secret manager。

If a key has been pasted into a shared place, revoke it and create a new one.
如果 key 曾被貼到共享環境，請刪除那把 key 並重新建立。

See / 詳見：

- `docs/api-key-security.md`
- `.env.example`

## Vercel deployment and API route / Vercel 部署與 API

The project has been upgraded to a Next.js app so Vercel can run a server-side API route.
專案已升級成 Next.js，讓 Vercel 可以執行後端 API route。

- Frontend page / 前端頁面: `app/page.jsx`
- LLM API route / LLM 後端 API: `app/api/interpret/route.js`
- Static browser assets / 前端靜態資源: `public/styles.css`, `public/script.js`

Set these environment variables in Vercel Project Settings before using the real model chain:
若要使用真實模型鏈，請在 Vercel Project Settings 設定環境變數：

```text
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_API_GROK_KEY=your_backup_openrouter_key_for_grok_here
OPENAI_API_KEY=your_openai_backup_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

Optional / 可選：

```text
OPENROUTER_MODEL=openrouter/free
OPENROUTER_GROK_MODEL=x-ai/grok-4.3
OPENAI_MODEL=gpt-4.1-mini
```

The LLM route uses this fallback order: OpenRouter free route, OpenRouter Grok route, OpenAI, then deterministic fallback.
LLM route 的備援順序是：OpenRouter 免費路由、OpenRouter Grok 路由、OpenAI，最後才是固定規則解析。

If all LLM providers are missing or unavailable, `/api/interpret` returns a deterministic fallback intent so the demo remains usable.
如果所有 LLM provider 都沒有設定或暫時不可用，`/api/interpret` 會回傳後備解析結果，demo 仍可操作。

## Current implementation note / 目前實作說明

This first version is intentionally implemented as a deployable static prototype so the interaction model can be reviewed quickly.
第一版刻意先做成可部署的靜態 prototype，目的是快速驗證互動流程與展示敘事。

The next engineering step is to replace the current in-browser scenario logic with:
下一步工程化方向，是將目前寫在瀏覽器中的情境邏輯逐步替換為：

1. A hosted intent parsing API / 雲端自然語言任務解析 API
2. A geolocation resolution service / 地理位置解析服務
3. A deterministic mission planning API / 可驗證的任務規劃 API
4. A cloud deployment target for competition presentation / 適合競賽展示的線上部署版本
