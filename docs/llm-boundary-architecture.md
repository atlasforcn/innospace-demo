# LLM Boundary Architecture / LLM 指令邊界設計

## Recommendation / 最優方案

Use a layered boundary architecture:

1. **Structured intent schema**
   - The LLM converts free-form operator language into a strict mission-intent object.
   - This is already represented by `schemas/mission-intent.schema.json`.

2. **Deterministic planner**
   - A non-LLM layer resolves targets, scores assets, checks batteries, checks conflicts, and selects feasible plans.

3. **Allowlisted command DSL**
   - The model can only emit or request commands defined in `lib/allowed-command-catalog.json`.
   - The machine-readable envelope is constrained by `schemas/command-envelope.schema.json`.

4. **Validator gate**
   - `lib/command-boundary.js` rejects any command outside the approved catalog.
   - Crosslink, propulsion, and other riskier actions remain operator-gated.

## Why not Skill as the primary boundary? / 為什麼不把 Skill 當主要邊界

A skill is useful for workflow consistency, prompt scaffolding, and project conventions. It is not a runtime enforcement layer. If the model drifts, a skill alone does not guarantee that an invalid command cannot be produced.

## Why not RAG as the primary boundary? / 為什麼不把 RAG 當主要邊界

RAG helps the model retrieve mission knowledge and domain references. It does not reliably prevent the model from producing an unsupported command. Retrieval improves context; it does not create a hard allowlist.

## Why schema + DSL wins / 為什麼 Schema + DSL 最適合

- Structured Outputs can force the model into an exact JSON shape.
- Function calling can expose only application-approved actions.
- The planner and validator can reject semantically unsafe or unsupported combinations.
- The allowed-command catalog becomes auditable and versionable.

## Recommended production path / 建議產品化路徑

- Use **Structured Outputs** for mission-intent extraction.
- Use **function calling** only for approved planner-side actions.
- Set strict schema adherence for tool calls and structured objects.
- Keep RAG optional for explanatory support, not for authority.
- Create a skill only if we want a reusable internal agent workflow for editing, testing, or generating bounded command artifacts.

## Files added in this repo / 本次新增檔案

- `schemas/command-envelope.schema.json`
- `lib/allowed-command-catalog.json`
- `lib/command-boundary.js`
- `examples/bounded-command-envelope.wildfire.json`

## Practical contract / 實務契約

The LLM may:
- parse intent
- ask for clarification
- suggest a bounded command envelope that conforms to the DSL

The LLM may not:
- invent a new subsystem
- invent a new command
- bypass operator gates
- release propulsion commands directly
- issue vendor-specific binary telecommands
