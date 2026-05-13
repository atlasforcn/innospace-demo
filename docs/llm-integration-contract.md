# LLM Integration Contract / LLM 接入契約

## Purpose / 目的

The LLM should convert free-form operator language into a strict, reviewable mission-intent object. It should not directly choose the final spacecraft or fabricate validated command feasibility.

LLM responsibility:
- extract intent
- identify missing information
- normalize mission requirements
- ask for clarification when the target or constraints are underspecified

Planner responsibility:
- geolocation validation
- orbit and access scoring
- payload fit checking
- battery, storage, thermal, and conflict checks
- candidate ranking
- command-packet construction

## Required LLM output shape / LLM 必須輸出的結構

The structured object should conform to `schemas/mission-intent.schema.json`.

Important fields:
- `mission_category`
- `priority`
- `target_resolution.status`
- `target_resolution.label`
- `target_resolution.coordinates` or `target_resolution.geometry`
- `observation_request.payload_family`
- `observation_request.gsd_target_m`
- `observation_request.cadence`
- `constraints.preserve_existing_missions`
- `constraints.comparable_lighting`
- `constraints.delivery_latency`
- `clarification_questions`

## Clarification rule / 澄清規則

If the target cannot be resolved into a location, polygon, or accepted AOI reference, the LLM output must set:

```json
{
  "target_resolution": {
    "status": "needs_clarification"
  }
}
```

and provide at least one precise follow-up question.

## Example A: Wildfire response / 森林大火

Operator input:

> A wildfire has been reported in the Rocky Mountains. Acquire optical imagery as soon as possible.

Expected LLM behavior:
- infer urgent disaster response
- resolve the region label into a geographic candidate
- request a recommended optical GSD target if the downstream planner requires a hard threshold
- preserve `operator_gate = true`

## Example B: Ambiguous construction site / 模糊工地需求

Operator input:

> Monitor the construction progress of this site every day with comparable lighting and viewing conditions.

Expected LLM behavior:
- identify recurring commercial monitoring
- reject target resolution because `this site` is ambiguous
- ask for an address, coordinates, or map AOI
- do not emit a planning-ready target geometry

## Planner handoff / 規劃器接手

Once the LLM emits a valid mission-intent object, the deterministic planner can:

1. resolve or confirm AOI geometry
2. score candidate assets
3. produce operator-readable decisions
4. generate subsystem-level command packets
5. keep risky actions operator-gated
