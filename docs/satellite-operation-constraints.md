# Satellite Operation Constraints Reference / 衛星操作限制參考

Last updated: 2026-05-20

## Purpose / 用途

This reference constrains the demo LLM and planner. The LLM may translate human language into a structured `MissionIntent`; the deterministic planner still owns satellite selection, safety checks, ground-station fit, and bounded command generation.

這份文件用來約束 demo 的 LLM 與 planner。LLM 可以把人類抽象語言轉成結構化 `MissionIntent`；衛星選擇、安全檢查、地面站適配與受控指令生成仍由可驗證的 planner 負責。

## Mission Fit Checks / 任務適配檢查

| Constraint | What to Check | Demo Behavior |
| --- | --- | --- |
| Orbit and access / 軌道與可見性 | SSO/LEO pass timing, access window, revisit, AOI overlap | Show earliest feasible observation and avoid assuming overhead pass is required. |
| Off-nadir pointing / 斜視指向 | Required slew angle, max off-nadir, image-quality penalty | Allow imaging when the satellite can rotate safely, even if not directly overhead. |
| Slew dynamics / 轉向動態 | Slew rate, settle time, jitter, wheel momentum | Score slew time and ADCS energy as trade-offs. |
| Payload fit / 酬載適配 | Optical, multispectral, SAR, thermal IR, communications relay | Reject satellites that cannot satisfy the sensing need; comms payloads can support delivery but not imaging. |
| GSD and FOV / 解析度與視場 | Required GSD, achievable GSD, swath/FOV coverage | Pick a realistic planning GSD and explain trade-offs. |
| Power / 電力 | Battery before task, ADCS energy, payload energy, transmitter energy, post-task reserve | Reject or warn when post-task battery falls below reserve. |
| Storage / 儲存 | Product size, free storage, metadata, compression | Store capture onboard before downlink is scheduled. |
| Thermal / 熱控 | Payload warm-up, transmitter heat, cooldown | Treat as a planning constraint for future versions; do not claim flight certification. |
| Existing tasks / 既有任務 | Protected windows, higher-priority missions, attitude recovery time | Do not interrupt protected tasks without explicit operator approval. |
| Ground station / 地面站 | Band compatibility, next contact, data rate, conflict status | Select a compatible ground station or store onboard and wait. |

## Satellite Types for Demo Scenarios / 可用於 demo 的衛星種類

- **VHR optical EO**: best for construction, buildings, roads, visible disaster damage; needs daylight and low cloud.
- **Multispectral EO**: useful for vegetation, burn scar, water, and land-cover classification; moderate GSD is acceptable.
- **Thermal IR**: useful for wildfire hotspots and night thermal anomalies; usually coarser than optical.
- **SAR**: useful for all-weather, night, flood, maritime, and deformation monitoring; interpretation differs from optical imagery.
- **Communication relay**: supports downlink or relay; cannot replace an imaging payload.

## Ground Command Boundary / 地面站可下指令邊界

The demo exposes subsystem-level planning commands, not flight-certified binary telecommands.

本 demo 顯示的是子系統層級的任務規劃指令，不是可直接上傳飛行軟體的二進位 telecommand。

### ADCS / 姿態控制

- `ADCS_SET_MODE`: switch from LVLH or current attitude mode into an approved planning mode.
- `ADCS_SLEW_TO_AOI`: slew toward the approved target/AOI within off-nadir, slew-rate, settle-time, and power limits.
- `ADCS_TRACK_TARGET`: hold target pointing during the capture window.
- `ADCS_RETURN_LVLH`: return to nominal LVLH or configured recovery attitude.

### Camera / 攝影機

- `CAMERA_POWER_ON`: power the selected imaging payload after pointing is valid.
- `CAMERA_CONFIGURE`: set imaging mode, GSD target, exposure/profile metadata.
- `CAMERA_CAPTURE`: capture the approved AOI.
- `CAMERA_POWER_OFF`: return payload to standby or off state after capture.

### Data and Ground Segment / 資料與地面段

- `PAYLOAD_STORE_IMAGE`: store image product and metadata onboard.
- `COMMS_SCHEDULE_DOWNLINK`: reserve a compatible ground-station contact.
- `COMMS_DOWNLINK_TO_STATION`: downlink to the selected ground station.
- `COMMS_CONFIRM_RECEIPT`: confirm checksum/manifest and transfer custody to the ground workflow.
- `STORE_ONBOARD_AND_WAIT_NEXT_PASS`: hold product onboard if no compatible contact exists.
- `REQUEST_CROSSLINK_RELAY`: future/operator-gated path for relay or crosslink support.

### Propulsion / 推進

Propulsion is out of scope for normal demo tasking. Any maneuver-related item must remain a review request and must not auto-release.

推進不屬於此 demo 的一般任務指令。任何軌道機動只能形成 review request，不能自動釋出。

## Ground Station Compatibility Matrix / 地面站適配矩陣

| Ground station | Bands | Planning role | Constraint |
| --- | --- | --- | --- |
| KSAT Svalbard | S/X band | High-latitude SSO contacts, strong EO downlink option | Must reserve contact and avoid conflicts. |
| Alaska Ground Network | X band | North America polar pass support | Short contacts; schedule conflicts matter. |
| Taiwan NSPO S-band | S band | Regional support for Taiwan custom scenario | Lower data rate; good for status or smaller products. |
| Wallops X-band | S/X band | US East Coast support | Maintenance or higher-priority contacts may block use. |

## Planner Rules / Planner 規則

1. Never generate spacecraft commands before target coordinates, AOI, or accepted AOI reference is available.
2. Never treat a natural-language preset as stronger than the user’s latest typed target.
3. Do not score communications-only satellites as imaging satellites.
4. Include off-nadir pointing as a valid trade-off, not a binary overhead-only rule.
5. Include slew time, settle time, and ADCS energy in the recommendation.
6. After image capture, choose a compatible ground station before downlink.
7. If no station is compatible, keep the product onboard and show `STORE_ONBOARD_AND_WAIT_NEXT_PASS`.
8. Keep operator approval as the final release gate before command packet export.

## LLM Prompting Boundary / LLM 提示邊界

The LLM should infer:

- mission category
- target label or ambiguity
- payload family
- GSD target
- cadence
- urgency and delivery latency
- constraints and clarification questions

The LLM must not infer:

- final satellite choice
- final access window truth
- battery safety truth
- protected-task override
- ground-station reservation truth
- flight-certified binary commands

Those decisions remain deterministic planner outputs.
