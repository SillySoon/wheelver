// src/controllers/collectionController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../handlers/asyncHandler";
import * as CollectionService from "../services/collectionService";
import { notFound } from "../errors/HttpError";
import { requireUser } from "../middleware/authMiddleware";
import {
    addItemsBody,
    collectionBody,
    collectionListQuery,
    idParams,
    itemParams,
    pageQuery,
    parse,
} from "../validation/schemas";

export const createCollection = asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { name } = parse(collectionBody, req.body);
    // Owner always comes from the session, never from the request body
    res.status(201).json(await CollectionService.createCollection({ name, owner: user._id }));
});

export const getCollections = asyncHandler(async (req: Request, res: Response) => {
    const { owner, page, limit } = parse(collectionListQuery, req.query);
    res.json(await CollectionService.getCollections(owner, { page, limit }));
});

export const getCollection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const collection = await CollectionService.getCollection(id);
    if (!collection) throw notFound("Collection not found");
    res.json(collection);
});

export const updateCollection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    // Only the name may be changed here; items go through the /items sub-routes
    const { name } = parse(collectionBody, req.body);
    const collection = await CollectionService.updateCollection(id, { name });
    if (!collection) throw notFound("Collection not found");
    res.json(collection);
});

export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const collection = await CollectionService.deleteCollection(id);
    if (!collection) throw notFound("Collection not found");
    res.json({ message: "Collection deleted successfully" });
});

export const getItems = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const { page, limit } = parse(pageQuery, req.query);
    res.json(await CollectionService.getItems(id, { page, limit }));
});

export const addItems = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const { hotwheel, quantity, condition } = parse(addItemsBody, req.body);
    res.status(201).json(await CollectionService.addItems(id, hotwheel, quantity, condition));
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
    const { id, itemId } = parse(itemParams, req.params);
    const item = await CollectionService.removeItem(id, itemId);
    if (!item) throw notFound("Item not found in this collection");
    res.json({ message: "Item removed successfully" });
});
