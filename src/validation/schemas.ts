// src/validation/schemas.ts
import { z } from "zod";
import { HotwheelExtra } from "../interfaces/IHotwheel";
import { ItemCondition } from "../interfaces/ICollectionItem";

/** Parses input against a schema; a ZodError is turned into a 400 by the error handler. */
export const parse = <T extends z.ZodType>(schema: T, input: unknown): z.infer<T> => schema.parse(input);

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");

export const idParams = z.object({ id: objectId });
export const itemParams = z.object({ id: objectId, itemId: objectId });

export const pageQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchQuery = pageQuery.extend({
    search: z.string().trim().max(50).optional(),
});

// --- Collections ---

export const collectionName = z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9\-_& ]{1,50}$/, "Only letters, numbers, spaces, -, _, and & are allowed (max. 50 characters).");

export const collectionBody = z.object({ name: collectionName });

export const collectionListQuery = pageQuery.extend({ owner: objectId.optional() });

export const MAX_ITEMS_PER_REQUEST = 50;

export const addItemsBody = z.object({
    hotwheel: objectId,
    quantity: z.number().int().min(1).max(MAX_ITEMS_PER_REQUEST).default(1),
    condition: z.enum(ItemCondition).optional(),
});

// --- Catalog (admin) ---

export const seriesBody = z.object({
    name: z.string().trim().min(1).max(100),
    shortName: z.string().trim().min(1).max(100),
});

export const hotwheelBody = z.object({
    toyNumber: z.string().trim().min(1).max(20),
    colNumber: z.number().int().min(0).optional(),
    name: z.string().trim().min(1).max(100),
    series: objectId,
    seriesNumber: z.number().int().min(0),
    year: z.number().int().min(1968).max(2100),
    extra: z.enum(HotwheelExtra).optional(),
    photoUrl: z.url().optional(),
});

// --- Views ---

export const handleParams = z.object({ handle: z.string().trim().min(1).max(40) });
