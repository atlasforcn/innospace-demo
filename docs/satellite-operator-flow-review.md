# Satellite Operator Flow Review

This note records the current operator-flow rules after reviewing the demo as a satellite tasking workflow.

這份文件記錄目前 demo 的操作流程規則：它不是一般 dashboard，而是一個「操作員批准後才釋出衛星指令」的任務編排流程。

## Round 1
Operator concern: Demo setup controls were mixed into the mission execution flow.

Decision: Keep fleet sandbox and map display as setup cards, but separate them from the mission flow in navigation.

## Round 2
Operator concern: A real tasking flow cannot evaluate satellites before the target is geolocated.

Decision: Mission flow must be intake -> target gate -> requirements -> AOI/access -> fleet readiness.

## Round 3
Operator concern: Approval should happen after candidate decision and before command packet visibility.

Decision: Keep the command packet locked until operator approval, then auto-advance to the command packet.

## Round 4
Operator concern: The left flow showed only coarse phases and could contradict the current card.

Decision: The detailed left flow was merged into the top mission progress strip so the active card, current state, and next operator action are visible in one place.

## Round 5
Operator concern: The demo should not require extra navigation after output-producing actions.

Decision: Analyze, target resolve, AOI draw, approve, and export actions now advance to the relevant result card automatically.

## Final Flow Contract / 最終流程契約

Mission flow cards / 任務流程卡片：

1. Mission Intake / 任務輸入
2. Target Gate / 目標檢核
3. Intent-to-Command Translation / 語意轉具體指令
4. AOI & Access / 區域與可見性
5. Fleet Status + Fit / 星系狀態與適配
6. Candidate Decision / 候選決策
7. Plan & Approval / 計畫與批准
8. Command Packet / 指令封包

Demo setup cards / 展示設定卡片：

- Fleet Sandbox / 星系沙盒
- Map Display / 地圖顯示

Setup cards are always available because they configure the demo environment. They are not counted as spacecraft tasking steps.

設定卡片常駐可用，因為它們只是展示環境設定，不是衛星任務指令流程的一部分。

## State Machine / 狀態機

- `idle`: only Mission Intake is available. Results are blank.
- `blocked`: intake is parsed, but Target Gate blocks planning because the target cannot become GPS coordinates or an AOI.
- `planned`: Target Gate through Candidate Decision are complete, Plan & Approval is available, and Command Packet is still locked.
- `approved`: operator approval unlocks the Command Packet.
- `exported`: command export is simulated and remains visible for audit.

中文摘要：

- `idle`：只有任務輸入可操作，結果區保持空白。
- `blocked`：需求已讀懂，但目標無法定位，系統停在目標檢核。
- `planned`：完成目標、需求、可見性、星系、可行性與候選決策，等待操作員批准。
- `approved`：批准後才解鎖指令封包。
- `exported`：展示用匯出完成，仍保留指令供審核。

## Navigation Rules / 導覽規則

- Locked mission cards cannot be opened from the top mission strip.
- Previous and Next only move through currently available cards in the same group.
- Mission cards do not jump into setup cards by pressing Next.
- Setup cards can be opened anytime and Next/Previous only moves between setup cards.
- On step 1, Next triggers the real LLM analysis if the request has not been analyzed yet; it does not skip directly to a static template.
- Analyze, clarify, approve, and export actions move the operator to the next meaningful card automatically.

## LLM And Command Boundary / LLM 與指令邊界

- The demo is not a mission abstraction tool. It translates human intent into concrete, bounded spacecraft and ground-segment commands.
- The normal path must wait for a real LLM response from OpenRouter, Grok, or OpenAI. If all providers fail, the UI shows a retry/error state instead of silently generating a deterministic success result.
- The LLM may interpret target, AOI, payload need, GSD, cadence, and ambiguity status, but the command planner constrains the output to the approved command catalog.
- Step 08 plans must select a compatible ground-station window after imaging. If no compatible station is available, the plan stores the image onboard and waits for the next pass.

## Data Consistency Rules / 資料一致性規則

- The map satellites must be generated from the currently evaluated constellation.
- Wildfire and construction presets must keep their fixed demo constellations for reliable presentation.
- The custom sandbox feeds only the Custom Fleet Drill scenario.
- If the operator enables a custom four-satellite drill, the custom scenario map shows those four custom assets instead of fixed SAT-A/B/C.
- Candidate decisions, recommended asset, timeline, command packet, and map markers must share the same plan source.
- After a custom natural-language target is resolved, map center, AOI, candidate decisions, and command plan must follow that resolved target instead of reverting to a preset city.

## Custom Fleet Drill Review / 自訂星系驗證審查

Round 1, UI planner: the sandbox should not silently change preset scenarios because that makes the demo unpredictable.  
Decision: add `Custom Fleet Drill` as a third scenario and keep wildfire/construction on their default fleets.

Round 2, satellite operator: a satellite does not need to pass directly overhead if it can slew off-nadir safely.  
Decision: add required slew angle, maximum slew angle, slew rate, settle time, ADCS energy, total task energy, and post-task battery to the custom planner.

Round 3, power systems view: battery should be evaluated after the maneuver and capture, not only as an initial percentage.  
Decision: reject custom assets if estimated post-task battery falls below the safety threshold.

Round 4, mission planning view: a fast pass is not enough if the spacecraft cannot settle before capture.  
Decision: custom recommendations now show slew time and settle time as explicit trade-off evidence.

Round 5, demo narrative view: judges need to see why a non-overhead pass can still be valid.  
Decision: the custom scenario prompt explicitly asks for off-nadir imaging over Washington D.C., and the command packet includes slew parameters.

## Test Checklist / 實測檢查

- Wildfire preset remains fixed at SAT-A/SAT-B/SAT-C even after editing the custom sandbox.
- Construction preset remains fixed at SAT-01/SAT-03/SAT-06/SAT-08 after target resolution.
- Custom Fleet Drill uses CUSTOM-01...CUSTOM-N on the map and in the recommendation table.
- A satellite whose required slew exceeds max slew is rejected.
- A satellite whose maneuver would leave unsafe battery is rejected.
- The command packet exposes ADCS slew parameters only after operator approval.

## Test Results / 實測結果

- Static ownership check passed: `renderWildfire()` and `renderConstruction()` no longer call the custom planner.
- Custom planning logic passed: feasible agile optical satellite is executable, over-slew satellite is rejected, unsafe post-task battery satellite is rejected.
- Production build passed with the updated scenario and command API route.
- Local dev server test was not used for final validation because the machine hit an `EMFILE` file-watcher limit; this does not affect the production build path.
