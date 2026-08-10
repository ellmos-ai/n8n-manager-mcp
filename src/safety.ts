export interface SafetySettings {
  readOnly: boolean;
  backupBeforeMutations: boolean;
  auditLog: boolean;
}

const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isEnvironmentReadOnly(value = process.env.N8N_MANAGER_READ_ONLY): boolean {
  return ENABLED_VALUES.has((value || "").toLowerCase());
}

export function resolveSafety(
  persisted: Partial<SafetySettings> | undefined,
  environmentReadOnly = isEnvironmentReadOnly(),
): SafetySettings {
  return {
    readOnly: environmentReadOnly || persisted?.readOnly === true,
    backupBeforeMutations: persisted?.backupBeforeMutations ?? true,
    auditLog: persisted?.auditLog ?? true,
  };
}
