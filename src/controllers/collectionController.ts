// src/controllers/collectionController.ts
import { Request, Response } from "express";
import { createLogger } from "../utils/logger";
import { asyncHandler } from "../handlers/asyncHandler";
import * as CollectionService from "../services/collectionService";
import { isValidObjectId } from "../utils/validation";

const { logRequest, logWarning } = createLogger(
    "COLLECTION_CONTROLLER",
    "dark_green"
);

export const createCollection = asyncHandler(async (req: Request, res: Response) => {
    logRequest("POST /collection");
    try {
        const collection = await CollectionService.createCollection(req.body);
        return res.status(201).json(collection);
    } catch (error: any) {
        logWarning(`Error creating collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getCollections = asyncHandler(async (req: Request, res: Response) => {
    logRequest("GET /collection");
    try {
        const collections = await CollectionService.getCollections();
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
        const collection = await CollectionService.updateCollection(req.params.id as string, req.body);
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

export const addHotwheel = asyncHandler(async (req: Request, res: Response) => {
    const { id, hotwheelId } = req.params;
    logRequest(`POST /collection/${id}/hotwheel/${hotwheelId}`);

    if (!isValidObjectId(id as string) || !isValidObjectId(hotwheelId as string)) {
        logWarning(`Invalid ID format: collection=${id}, hotwheel=${hotwheelId}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const collection = await CollectionService.addHotwheelToCollection(id as string, hotwheelId as string);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        return res.status(200).json(collection);
    } catch (error: any) {
        logWarning(`Error adding hotwheel to collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const removeHotwheel = asyncHandler(async (req: Request, res: Response) => {
    const { id, hotwheelId } = req.params;
    logRequest(`DELETE /collection/${id}/hotwheel/${hotwheelId}`);

    if (!isValidObjectId(id as string) || !isValidObjectId(hotwheelId as string)) {
        logWarning(`Invalid ID format: collection=${id}, hotwheel=${hotwheelId}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const collection = await CollectionService.removeHotwheelFromCollection(id as string, hotwheelId as string);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        return res.status(200).json(collection);
    } catch (error: any) {
        logWarning(`Error removing hotwheel from collection: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});
