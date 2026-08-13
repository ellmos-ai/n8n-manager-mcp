import { z } from "zod";

/**
 * Guardrails for values that otherwise flow directly into n8n query strings or
 * workflow connection arrays.  The list cap is intentionally bounded well
 * below an unbounded API request, while still allowing a useful single-page
 * result for the three list tools.  Connection indices use the same finite
 * upper bound to prevent accidental huge sparse arrays.
 */
export const MAX_LIST_LIMIT = 1000;
export const MAX_CONNECTION_INDEX = 1000;

const finiteInteger = (minimum: number, maximum: number) =>
  z.number().finite().int().min(minimum).max(maximum);

export const listLimitSchema = finiteInteger(1, MAX_LIST_LIMIT);
export const connectionIndexSchema = finiteInteger(0, MAX_CONNECTION_INDEX);

export const listWorkflowsLimitSchema = listLimitSchema.optional().default(100);
export const listExecutionsLimitSchema = listLimitSchema.optional().default(20);
export const listBackupsLimitSchema = listLimitSchema.optional().default(20);
export const connectionIndexInputSchema = connectionIndexSchema.optional().default(0);
