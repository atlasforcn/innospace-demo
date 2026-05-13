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
  - Recommended satellite selection / 推薦衛星選擇
  - ADCS and camera command breakdown / ADCS 與攝影機指令拆分
  - Per-step spacecraft state transition / 每一步的衛星狀態轉移
  - Operator approval / 操作員批准
  - Machine command packet reveal / 展開機器指令封包

- Construction monitoring scenario / 建築工地監測情境
  - Clarification loop when the phrase `this site` is not geolocatable / 當 `this site` 無法轉成位置資訊時，系統會主動要求補充
  - Address-based or map-based AOI resolution / 支援地址解析或地圖框選 AOI
  - Daily monitoring plan with comparable lighting and viewing conditions / 產出每日拍攝，且盡量維持相近光影與觀測角度的監測計畫
  - Multi-asset recurring observation strategy / 多顆衛星輪值式長期觀測策略
  - ADCS and camera command breakdown / ADCS 與攝影機指令拆分
  - Per-step spacecraft state transition / 每一步的衛星狀態轉移
  - Operator approval / 操作員批准
  - Machine command packet reveal / 展開機器指令封包

- Guided demo flow / 導覽式展示流程
  - Initial blank analysis state before any request is processed / 初始進站時維持空白分析狀態
  - Results appear only after the operator clicks `Analyze Request` / 只有按下 `Analyze Request` 後才顯示系統分析結果
  - Mission approval is placed directly below the recommended plan / 批准任務按鈕直接放在建議任務計畫下方
  - An export action becomes available after approval / 批准後才顯示匯出指令封包的下一步動作

- Custom constellation test area / 自訂衛星星系測試區
  - Enable or disable custom constellation analysis / 可切換是否使用自訂星系進行分析
  - Set satellite count from 1 to 12 / 可設定 1 到 12 顆衛星
  - Configure orbit type, battery, rough position, payload type, and spacecraft status / 可設定軌道類型、電量、粗略位置、酬載類型與衛星狀態
  - Re-run the scenario planner using the custom assets / 可用自訂衛星重新執行情境規劃

## How to view / 如何查看

Open `index.html` in a browser.  
以瀏覽器開啟 `index.html` 即可查看。

Recommended walkthrough / 建議展示順序：

1. Start with the wildfire preset and click `Analyze Request`  
   先選擇森林大火情境，按下 `Analyze Request`
2. Review mission abstraction, satellite selection, and the recommended plan  
   查看任務抽象化結果、衛星選擇與建議任務計畫
3. Inspect the ADCS and camera commands under each step  
   檢視每一步底下拆分出的 ADCS 與攝影機指令
4. Click `Approve Mission Plan`  
   按下 `Approve Mission Plan`
5. Review the revealed machine command packet  
   查看展開後的機器指令封包
6. Switch to the construction preset  
   切換到建築工地監測情境
7. Observe that the system pauses because `this site` is not geolocatable  
   觀察系統因為 `this site` 無法定位，而暫停往下規劃
8. Resolve the target using an address or AOI drawing flow  
   透過地址或地圖 AOI 框選完成目標解析
9. Review the recurring monitoring plan and command sequence  
   查看週期性監測計畫與對應命令序列

## Research-backed model / 研究後新增的模型

The current demo now reflects a deeper satellite tasking model.  
目前 demo 已加入更完整的衛星任務判斷模型：

- Orbit and viewing geometry / 軌道與觀測幾何
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

## Current implementation note / 目前實作說明

This first version is intentionally implemented as a deployable static prototype so the interaction model can be reviewed quickly.  
第一版刻意先做成可部署的靜態 prototype，目的是快速驗證互動流程與展示敘事。

The next engineering step is to replace the current in-browser scenario logic with:  
下一步工程化方向，是將目前寫在瀏覽器中的情境邏輯逐步替換為：

1. A hosted intent parsing API / 雲端自然語言任務解析 API
2. A geolocation resolution service / 地理位置解析服務
3. A deterministic mission planning API / 可驗證的任務規劃 API
4. A cloud deployment target for competition presentation / 適合競賽展示的線上部署版本
