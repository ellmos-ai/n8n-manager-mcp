export interface SafetySettings {
    readOnly: boolean;
    backupBeforeMutations: boolean;
    auditLog: boolean;
}
export declare function isEnvironmentReadOnly(value?: string | undefined): boolean;
export declare function resolveSafety(persisted: Partial<SafetySettings> | undefined, environmentReadOnly?: boolean): SafetySettings;
//# sourceMappingURL=safety.d.ts.map