# INNOSpace Demo Core Requirements / 核心需求備忘

Last updated: 2026-05-20

## Product Thesis / 產品主張

This demo presents an operator-supervised intent-to-command satellite mission layer.
The product value is that an operator can describe an Earth-observation task in natural language, and the system can convert abstract human intent into a structured, explainable, bounded mission plan and concrete subsystem command packet.

這個 demo 的核心不是一般 dashboard，也不是把任務變得更抽象，而是「人類抽象自然語言 -> 具體任務需求 -> 可解釋任務規劃 -> 有邊界的衛星/地面段指令封包」。評審需要看到它未來有產品價值，也要相信實務上可行。

## Non-Negotiable Core / 不可偏離的核心

1. LLM semantic interpretation is the core demo capability.
   The system must visibly use an LLM to interpret natural-language mission requests into structured mission intent.

2. Do not silently bypass the LLM with only deterministic rules.
   A deterministic parser may exist only as an explicitly labeled degraded fallback when all LLM providers fail. It must not be the normal demo path and must not pretend to be LLM reasoning.

3. If performance is slow, fix it by improving LLM provider/model choice, response format, caching, progress feedback, or separating non-LLM map/geocode work from the first intent result.
   Do not fix speed by skipping LLM interpretation.

4. The LLM may interpret intent, target hints, payload needs, urgency, cadence, ambiguity, and constraints.
   The LLM must not directly fabricate final satellite commands or override mission safety.

5. Deterministic mission logic must validate and bound all output.
   Asset scoring, battery checks, existing-task preservation, pointing feasibility, and final command generation are controlled by planner logic and operator approval.

## Demo Audience / 展示對象

Primary audience: competition judges.

They should understand:

- why natural-language satellite tasking is valuable
- how the system avoids unsafe autonomous command generation
- how the system handles ambiguity instead of pretending to know
- how it preserves original satellite missions
- how it checks battery, payload, pointing, and timing feasibility
- how operator approval remains the final release gate

## Main Workflow / 主要流程

1. Mission Intake
   Operator enters a natural-language task request.

2. LLM Intent Interpretation
   LLM returns a structured `MissionIntent` object:
   - mission category
   - target resolution status
   - target label or ambiguity
   - payload family
   - GSD target
   - cadence
   - urgency / delivery latency
   - constraints
   - clarification questions when needed

3. Target Gate
   System checks whether the target can become coordinates, a map AOI, or an accepted AOI reference.
   If not, planning pauses and asks for clearer information.

4. AOI & Access
   The map must reflect the interpreted AOI, including user-entered locations that differ from preset scenarios.

5. Fleet Readiness
   The system evaluates candidate satellites using payload, battery, storage, attitude state, existing missions, orbital/access window, and off-nadir slew feasibility.

6. Candidate Decision
   The system recommends the best satellite and explains trade-offs.

7. Operator Approval
   Commands remain locked until the operator approves the mission plan.

8. Command Packet
   After approval, system shows bounded command families:
   - ADCS / attitude pointing commands
   - payload / camera commands
- data handling / downlink or delivery commands
   - ground-station scheduling and receipt confirmation commands

## Required Demo Scenarios / 必要情境

### Scenario 1: Wildfire Response / 森林大火應變

Input example:
`A wildfire has been reported in the Rocky Mountains. Acquire optical imagery as soon as possible.`

Required behavior:

- LLM identifies urgent disaster response.
- Target is resolved as a regional Rocky Mountains wildfire AOI.
- System proposes suitable optical GSD, roughly 3 m for rapid response.
- Fleet has 3 satellites with different status, battery, payload, and existing-task constraints.
- System ranks candidates by:
  - earliest feasible access
  - optical payload fit
  - off-nadir pointing feasibility
  - slew time and slew energy
  - post-task battery safety
  - no interruption of protected existing missions
- Output should show recommended satellite, why others are rejected or traded off, timeline, state transitions, and commands.

### Scenario 2: Construction Monitoring / 工地週期監測

Input example:
`Monitor the construction progress of this site every day with comparable lighting and viewing conditions.`

Required behavior:

- LLM identifies recurring commercial monitoring.
- If the location is ambiguous, the system must pause and ask for address, coordinates, or map-defined AOI.
- If the user later enters a clearer location such as `Downtown Seattle`, `西雅圖市中心`, or another address, the map and command target must update to that resolved location, not the preset Washington D.C. location.
- Fleet has 10 SSO satellites.
- Planning must prefer similar lighting and similar viewing geometry.
- The plan should support daily or repeated capture when satellites pass the area.
- The system must avoid interrupting protected existing missions.

### Scenario 3: Custom Fleet Drill / 自訂星系驗證

Purpose:
Allow the operator to create a custom constellation for testing.

Required editable parameters:

- satellite count
- orbit type, default SSO but configurable
- battery level
- approximate position
- payload type: optical, multispectral, SAR, thermal, communication relay
- current state / attitude mode
- existing task status

Required behavior:

- This is separate from preset scenarios.
- Custom fleet settings should not overwrite preset scenario fleets.
- The system must evaluate whether satellites can slew off-nadir to image the AOI even if they do not pass exactly overhead.
- Trade-offs must include slew capability, slew time, slew energy, and post-task battery safety.

## Satellite Evaluation Parameters / 衛星評估參數

The demo should evaluate or display:

- orbit type
- approximate ground track / access timing
- payload type and imaging mode
- FOV
- GSD suitability
- max off-nadir angle
- required slew angle
- slew time
- ADCS settle time
- slew energy cost
- current attitude state, such as LVLH or target pointing
- battery before task
- battery after task
- storage availability
- existing mission conflict
- protected mission interruption risk
- downlink or delivery availability
- compatible ground station availability
- whether propulsion is required

## Command Boundary / 指令邊界

The system may output high-level, bounded mission commands only.
It should not claim to generate flight-certified binary telecommands.

Allowed command families:

- ADCS:
  - slew to target
  - switch from LVLH to target pointing
  - settle attitude
  - return to LVLH or nominal state

- Payload / Camera:
  - camera power on/off
  - configure imaging mode
  - set exposure or imaging profile
  - capture image over AOI

- Data:
  - store collection
  - schedule compatible ground-station downlink
  - downlink to the selected station
  - confirm ground receipt
  - store onboard and wait when no compatible station exists
  - deliver product to requester
  - relay or crosslink only if supported by scenario

- Propulsion:
  - generally out of scope for this demo unless explicitly modeled as a non-default future capability.

## UI Requirements / 介面需求

- UI is bilingual English / Traditional Chinese where helpful.
- Each major workflow step is an independent card for demo delivery.
- A persistent flow guide must show the operator where they are.
- Cards should unlock in logical order.
- The Analyze / Next interaction should not feel duplicated.
- Mission plan approval button must appear near the mission plan, not only at the top.
- After approval, command export can be represented as a demo action; it does not need full real export behavior.
- Map should prefer Google Maps when available, then free map, then simplified/preset image.
- Map source selection should be scenario-aware.
- AOI overlay must move and scale with map zoom/pan.
- The top presentation strip should carry the active flow guide; side-rail flow text should not duplicate the step card.
- Suitability factors should live inside constellation status as expandable planning details, not as a separate presentation step.

## Performance Direction / 速度優化方向

Do:

- show `Analyzing with LLM...` progress clearly, including staged progress for semantic interpretation, AOI/geocode, boundary validation, feasibility, and command generation
- use a faster LLM model/provider if needed
- optionally cache identical prompt results during a demo session only if clearly labeled as cached LLM output
- run map image loading after intent interpretation when possible
- make geocoding retries short and visible
- show provider source in the intent summary

Do not:

- replace the LLM path with silent deterministic parsing
- return a fake successful mission plan when all LLM providers fail
- hide fallback as if it were LLM output
- let a static preset AOI override the user's natural-language target

## Current Implementation Reminder / 目前實作提醒

- LLM endpoint: `app/api/interpret/route.js`
- Mission intent schema: `schemas/mission-intent.schema.json`
- Main UI logic: `script.js` and `public/script.js`
- Vercel app shell: `app/page.jsx`
- Hotfix file currently used by deployment: `public/construction-target-hotfix.js`

Next engineering priority:
Preserve LLM-first semantic interpretation while improving perceived latency. Do not optimize by bypassing LLM.
