export const ALLOWED_COMMANDS = {
  ADCS: ["ADCS_SET_MODE", "ADCS_SLEW_TO_AOI", "ADCS_TRACK_TARGET", "ADCS_RETURN_LVLH"],
  CAMERA: ["CAMERA_POWER_ON", "CAMERA_CONFIGURE", "CAMERA_CAPTURE", "CAMERA_POWER_OFF"],
  DATA_GROUND: [
    "PAYLOAD_STORE_IMAGE",
    "COMMS_SCHEDULE_DOWNLINK",
    "COMMS_DOWNLINK_TO_STATION",
    "COMMS_CONFIRM_RECEIPT",
    "STORE_ONBOARD_AND_WAIT_NEXT_PASS",
    "REQUEST_CROSSLINK_RELAY"
  ],
  MISSION_CONTROL: ["MARK_OPERATOR_REVIEW"],
  PROPULSION: ["REQUEST_MANEUVER_REVIEW"]
};

export const OPERATOR_GATED_COMMANDS = new Set([
  "REQUEST_CROSSLINK_RELAY",
  "MARK_OPERATOR_REVIEW",
  "REQUEST_MANEUVER_REVIEW"
]);

export function validateCommandEnvelope(envelope) {
  const errors = [];

  if (!envelope || typeof envelope !== "object") {
    return { valid: false, errors: ["Envelope must be an object."] };
  }

  if (envelope.schema_version !== "bounded-command-envelope.v0.1") {
    errors.push("Unexpected schema_version.");
  }

  if (envelope.operator_gate !== true) {
    errors.push("operator_gate must remain true.");
  }

  if (!Array.isArray(envelope.commands) || envelope.commands.length === 0) {
    errors.push("commands must contain at least one command.");
  } else {
    envelope.commands.forEach((entry, index) => {
      const allowed = ALLOWED_COMMANDS[entry.subsystem] || [];
      if (!allowed.includes(entry.command)) {
        errors.push(`commands[${index}] uses an unapproved subsystem or command.`);
      }

      if (OPERATOR_GATED_COMMANDS.has(entry.command) && entry.requires_human_confirmation !== true) {
        errors.push(`commands[${index}] must require human confirmation.`);
      }

      if (!OPERATOR_GATED_COMMANDS.has(entry.command) && typeof entry.requires_human_confirmation !== "boolean") {
        errors.push(`commands[${index}] must declare requires_human_confirmation.`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
