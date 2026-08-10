const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);
export function isEnvironmentReadOnly(value = process.env.N8N_MANAGER_READ_ONLY) {
    return ENABLED_VALUES.has((value || "").toLowerCase());
}
export function resolveSafety(persisted, environmentReadOnly = isEnvironmentReadOnly()) {
    return {
        readOnly: environmentReadOnly || persisted?.readOnly === true,
        backupBeforeMutations: persisted?.backupBeforeMutations ?? true,
        auditLog: persisted?.auditLog ?? true,
    };
}
//# sourceMappingURL=safety.js.map