/** Convert an MCP-controlled name into one ordinary filesystem segment. */
export declare function sanitizePathPart(value: string): string;
/** True only for a strict descendant of root, never root or an outside path. */
export declare function isPathInside(rootPath: string, candidatePath: string): boolean;
/** Resolve backup-relative segments while enforcing the backup-root boundary. */
export declare function resolveBackupPath(backupRoot: string, ...parts: string[]): string;
//# sourceMappingURL=backup-paths.d.ts.map