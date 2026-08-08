import * as path from "node:path";
/** Convert an MCP-controlled name into one ordinary filesystem segment. */
export function sanitizePathPart(value) {
    const sanitized = value.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 80);
    if (!sanitized)
        return "unknown";
    if (sanitized === ".")
        return "_dot_";
    if (sanitized === "..")
        return "_dotdot_";
    // Windows device names are not regular path segments even when they carry
    // an extension. Map them to ordinary names before they reach the filesystem.
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(sanitized)) {
        return `_reserved_${sanitized.slice(0, 70)}_`;
    }
    return sanitized;
}
/** True only for a strict descendant of root, never root or an outside path. */
export function isPathInside(rootPath, candidatePath) {
    const relative = path.relative(path.resolve(rootPath), path.resolve(candidatePath));
    return relative !== "" && relative !== ".." &&
        !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
/** Resolve backup-relative segments while enforcing the backup-root boundary. */
export function resolveBackupPath(backupRoot, ...parts) {
    const root = path.resolve(backupRoot);
    const resolved = path.resolve(root, ...parts);
    if (!isPathInside(root, resolved)) {
        throw new Error(`Backup path must be inside ${backupRoot}`);
    }
    return resolved;
}
//# sourceMappingURL=backup-paths.js.map