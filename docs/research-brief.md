# Satellite Tasking Research Brief / 衛星任務編排研究摘要

## 1. Suitability model / 任務適配判斷模型

A mission orchestration layer should evaluate candidate satellites across five families of constraints:

1. Orbit and geometry / 軌道與幾何
   - access window and revisit timing
   - AOI visibility and swath overlap
   - off-nadir angle or SAR look geometry
   - required slew angle, settle time, and attitude recovery time

2. Attitude agility / 姿態機動能力
   - maximum off-nadir slew angle allowed by the spacecraft and payload
   - slew rate and whether the spacecraft can point quickly enough for the request
   - settle time before the payload can capture a usable image
   - ADCS energy draw and post-task battery reserve
   - whether attitude recovery would collide with a protected mission window

3. Payload fit / 感測器適配
   - optical, multispectral, thermal infrared, SAR, or relay payload class
   - achievable GSD or image quality target
   - cloud/daylight restrictions for passive imaging
   - scene size, spectral mode, and whether the sensor matches the mission question

4. Spacecraft health / 衛星健康
   - current battery state of charge and post-task reserve
   - power draw during imaging or communications
   - thermal margin
   - storage margin
   - current spacecraft mode, including safe or protected states

5. Operational conflict / 任務衝突
   - protected task windows
   - mission priority
   - whether the new request may preempt existing work
   - recovery time after off-nadir pointing or high-power operations

6. Delivery path / 資料交付
   - product size and storage reservation
   - next ground downlink window and expected data rate
   - whether crosslink or relay is needed
   - whether the product is urgent preview, full product, or both

## 2. Satellite classes worth modeling in the demo / 建議納入 demo 的衛星類型

- Agile optical VHR satellite / 高機動高解析光學衛星
  - strong for urban, infrastructure, and time-sensitive scene capture
  - key parameters: GSD, off-nadir angle, sunlight, cloud tolerance, slew demand

- Multispectral EO satellite / 多光譜遙測衛星
  - strong for vegetation, burn scars, flood extent, and material change
  - key parameters: spectral bands, GSD, revisit, scene size

- Thermal IR satellite / 熱紅外衛星
  - strong for hotspots, active fire signatures, and nighttime heat detection
  - key parameters: thermal bands, sensitivity, revisit, data latency

- SAR satellite / 合成孔徑雷達衛星
  - strong for cloud-covered scenes, nighttime acquisitions, maritime and surface deformation use cases
  - key parameters: look angle, incidence angle, polarization or acquisition mode, swath, processing latency

- Communications relay or crosslink-capable satellite / 資料中繼或星間鏈路衛星
  - strong for reducing data latency and supporting distributed task execution
  - key parameters: crosslink availability, pointing, rate, relay window, destination asset

## 3. Ground-command boundary / 地面站指令邊界

The orchestration layer should not claim to emit flight-certified binary telecommands. It should emit a validated command plan that can be translated by the mission command stack.

### 3.1 Commands the system can reasonably plan

- ADCS / AOCS
  - set target pointing
  - hold target pointing
  - return to LVLH or nominal attitude
  - reserve settle time and attitude recovery windows

- Payload
  - power on/off payload
  - select imaging mode
  - trigger capture
  - switch to standby

- Data handling and comms
  - reserve onboard storage
  - queue downlink
  - select data product for delivery
  - request a crosslink or relay session where the spacecraft architecture supports it

- Propulsion planning hooks
  - reserve a maneuver slot
  - attach a delta-V or trim-maneuver request for additional review
  - never auto-release propulsion in the demo without an explicit human approval gate

### 3.2 Command timing styles worth representing

- Immediate command / 即時指令
- Time-tagged sequence / 時標序列
- Post-event or completion-triggered action / 事件完成後觸發
- Recurring sequence / 週期性任務序列

### 3.3 Parameters worth normalizing

- `dispatch_type`
- `subsystem`
- `command`
- `target_ref`
- `execution_time`
- `duration_s`
- `geometry_policy`
- `power_budget_pct`
- `storage_budget_mb`
- `downlink_window_ref`
- `crosslink_peer`
- `operator_gate`

## 4. How this changes the demo / 對 demo 的直接影響

The demo now distinguishes:

- mission intent parsing
- satellite suitability scoring
- subsystem-level command planning
- operator approval
- machine-readable command packet generation

This creates a cleaner path toward a production architecture where an LLM extracts structured intent and a deterministic planner performs validation and ranking.

## 5. Source trail / 研究來源脈絡

The model above is grounded in official operational or standards-oriented material from ESA, NASA, JPL/Aerie, and CCSDS, especially around:

- EO imagery parameters, revisit, sun angle, cloud cover, and GSD
- optical, thermal, and SAR imaging distinctions
- telemetry, telecommand, data downlink, and crosslink concepts
- time-tagged spacecraft sequences
- propulsive maneuver planning and human-reviewed command sequences
