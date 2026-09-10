# Third-Party Licenses and Open Source Notices

This project, **n8n-manager-mcp**, is licensed under the [MIT License](LICENSE).
Below is an inventory of third-party open-source software, runtime packages, and development dependencies used in or distributed with this project, along with their respective licenses and notices.

---

## 1. Direct Runtime Dependencies

| Package | Version Range | License | Project URL / Source | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) | `^1.29.0` | MIT | [GitHub](https://github.com/modelcontextprotocol/typescript-sdk) | Official Model Context Protocol SDK for TypeScript / Node.js (Stdio transport, server abstractions) |
| [`zod`](https://github.com/colinhacks/zod) | `^3.23.8` | MIT | [GitHub](https://github.com/colinhacks/zod) | TypeScript-first schema declaration and input validation with static type inference |
| [`update-notifier`](https://github.com/yeoman/update-notifier) | `^7.3.1` | BSD-2-Clause | [GitHub](https://github.com/yeoman/update-notifier) | CLI update notification for interactive terminal sessions (disabled during stdio MCP operations) |

---

## 2. Core Transitive & Overrides Dependencies

| Package | Purpose / Scope | License | Project URL |
| :--- | :--- | :--- | :--- |
| `hono` | Lightweight web standard framework used for HTTP router primitives | MIT | [GitHub](https://github.com/honojs/hono) |
| `@hono/node-server` | Node.js adapter for Hono HTTP interfaces | MIT | [GitHub](https://github.com/honojs/node-server) |
| `nanoid` | Secure, URL-friendly unique string ID generator | MIT | [GitHub](https://github.com/ai/nanoid) |
| `fast-uri` | High-performance RFC 3986 URI parsing and formatting | BSD-3-Clause | [GitHub](https://github.com/fastify/fast-uri) |
| `express-rate-limit` | Rate limiting middleware for network requests | MIT | [GitHub](https://github.com/express-rate-limit/express-rate-limit) |
| `ip-address` | IPv4 and IPv6 parsing and validation library | MIT | [GitHub](https://github.com/beaugunderson/ip-address) |
| `qs` | Query string parser with nesting support | BSD-3-Clause | [GitHub](https://github.com/ljharb/qs) |
| `postcss` | CSS processing pipeline utility | MIT | [GitHub](https://github.com/postcss/postcss) |

---

## 3. Development and Quality Assurance Tooling

The following tools are used solely for building, testing, linting, and verifying the codebase. They are not bundled into the published runtime artifact:

| Package | Version Range | License | Project URL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| [`typescript`](https://github.com/microsoft/TypeScript) | `^5.3.3` | Apache-2.0 | [GitHub](https://github.com/microsoft/TypeScript) | TypeScript compiler (`tsc`) for type checking and compilation to JavaScript |
| [`vitest`](https://github.com/vitest-dev/vitest) | `^3.2.6` | MIT | [GitHub](https://github.com/vitest-dev/vitest) | Next-generation testing framework for unit and contract test suites |
| [`@types/node`](https://github.com/DefinitelyTyped/DefinitelyTyped) | `^20.11.0` | MIT | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) | TypeScript definitions for Node.js runtime APIs |

---

## 4. Permissive Compatibility Statement

All runtime and development dependencies utilized by `n8n-manager-mcp` are distributed under permissive open-source licenses (**MIT**, **BSD-2-Clause**, **BSD-3-Clause**, and **Apache-2.0**).
These licenses:
1. Permit commercial and non-commercial redistribution, modification, and integration without viral copyleft constraints.
2. Comply with the top-level **MIT License** of the `n8n-manager-mcp` repository.
3. Require copyright notice and license text preservation, which are satisfied by this document and the accompanying `package-lock.json`.

---

## 5. Standard Open-Source Notices

### MIT License Text (Summary)
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### BSD-2-Clause & BSD-3-Clause Notices (Summary)
> Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
> 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
> 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
> (For BSD-3-Clause: 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.)

### Apache License 2.0 (Summary)
> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
