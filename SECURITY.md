# Security Policy

## Reporting a Vulnerability

If you find a security vulnerability, please report it responsibly:

1. **Do NOT open a public issue**
2. **Use GitHub's [private vulnerability reporting](https://github.com/ellmos-ai/n8n-manager-mcp/security/advisories/new)**
3. Include: description, steps to reproduce, potential impact

### How to Report

1. Go to: https://github.com/ellmos-ai/n8n-manager-mcp/security/advisories/new
2. Fill out the form (title, description, severity, affected versions)
3. Submit privately (not visible to public until disclosed)

We will respond as soon as possible.

## Scope

- MCP server (localhost only by default)
- n8n API credentials

## Built-in Safety Controls

- Read-only mode blocks create, update, delete, activate/deactivate, import, and restore operations.
- Workflow JSON is backed up before update, delete, activate/deactivate, and overwrite-restore operations by default.
- Backups are stored locally under `~/.n8n-manager-mcp/backups/`.
- Mutation results are written to `~/.n8n-manager-mcp/audit.log` by default.
- Use `n8n_safety_status` and `n8n_set_safety_mode` to inspect or change these settings.

## Response

As a solo project, response times may vary. Critical issues will be
prioritized. Please allow reasonable time before public disclosure.
