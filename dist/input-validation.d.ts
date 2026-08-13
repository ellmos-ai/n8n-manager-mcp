import { z } from "zod";
/**
 * Guardrails for values that otherwise flow directly into n8n query strings or
 * workflow connection arrays.  The list cap is intentionally bounded well
 * below an unbounded API request, while still allowing a useful single-page
 * result for the three list tools.  Connection indices use the same finite
 * upper bound to prevent accidental huge sparse arrays.
 */
export declare const MAX_LIST_LIMIT = 1000;
export declare const MAX_CONNECTION_INDEX = 1000;
export declare const listLimitSchema: z.ZodNumber;
export declare const connectionIndexSchema: z.ZodNumber;
export declare const listWorkflowsLimitSchema: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
export declare const listExecutionsLimitSchema: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
export declare const listBackupsLimitSchema: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
export declare const connectionIndexInputSchema: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
//# sourceMappingURL=input-validation.d.ts.map