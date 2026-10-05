// src/controllers/collectionController.ts
import { Request, Response } from "express";
import { createLogger } from "../utils/logger";
import { asyncHandler } from "../handlers/asyncHandler";
import * as CollectionService from "../services/collectionService";
import { isValidObjectId, isValidCollectionName } from "../utils/validation";
import { ItemCondition } from "../interfaces/ICollectionItem";

const MAX_ITEMS_PER_REQUEST = 50;

const { logRequest, logWarning } = createLogger(
    "COLLECTION_CONTROLLER",
    "dark_green"
);

export const createCollection = asyncHandler(async (req: Request, res: Response) => {
    logRequest("POST /collection");
    try {
        const { name } = req.body;
        if (typeof name !== "string" || !isValidCollectionName(name)) {
            return res.status(400).json({ message: "Invalid collection name. Only letters, numbers, spaces, -, _, and & are allowed." });
        }
        // Owner always comes from the session, never from the request body
        const collection = await CollectionService.createCollection({ name, owner: (req.user as any)._id });
        return res.status(201).json(collection);
    } catch (error: any) {
        logWarning(`Error creating collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getCollections = asyncHandler(async (req: Request, res: Response) => {
    logRequest("GET /collection");
    try {
        const filter: any = {};
        if (req.query.owner) {
            filter.owner = req.query.owner;
        }
        const collections = await CollectionService.getCollections(filter);
        return res.status(200).json(collections);
    } catch (error: any) {
        logWarning(`Error retrieving collections: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getCollection = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`GET /collection/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid collection ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const collection = await CollectionService.getCollection(req.params.id as string);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        return res.status(200).json(collection);
    } catch (error: any) {
        logWarning(`Error retrieving collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const updateCollection = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`PUT /collection/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid collection ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const { name } = req.body;
        if (typeof name !== "string" || !isValidCollectionName(name)) {
            return res.status(400).json({ message: "Invalid collection name. Only letters, numbers, spaces, -, _, and & are allowed." });
        }
        // Only the name may be changed here; items go through the /items sub-routes
        const collection = await CollectionService.updateCollection(req.params.id as string, { name });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        return res.status(200).json(collection);
    } catch (error: any) {
        logWarning(`Error updating collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`DELETE /collection/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid collection ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const collection = await CollectionService.deleteCollection(req.params.id as string);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        return res.status(200).json({ message: "Collection deleted successfully" });
    } catch (error: any) {
        logWarning(`Error deleting collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const addItems = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    logRequest(`POST /collection/${id}/items`);

    const { hotwheel, quantity = 1, condition } = req.body;
    if (!isValidObjectId(id) || typeof hotwheel !== "string" || !isValidObjectId(hotwheel)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEMS_PER_REQUEST) {
        return res.status(400).json({ message: `Quantity must be between 1 and ${MAX_ITEMS_PER_REQUEST}` });
    }
    if (condition !== undefined && !Object.values(ItemCondition).includes(condition)) {
        return res.status(400).json({ message: "Invalid condition" });
    }

    try {
        const items = await CollectionService.addItems(id, hotwheel, quantity, condition);
        if (!items) {
            return res.status(404).json({ message: "Collection not found" });
        }
        return res.status(201).json(items);
    } catch (error: any) {
        logWarning(`Error adding items to collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
    const { id, itemId } = req.params as { id: string; itemId: string };
    logRequest(`DELETE /collection/${id}/items/${itemId}`);

    if (!isValidObjectId(id) || !isValidObjectId(itemId)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const item = await CollectionService.removeItem(id, itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found in this collection" });
        }
        return res.status(200).json({ message: "Item removed successfully" });
    } catch (error: any) {
        logWarning(`Error removing item from collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});
