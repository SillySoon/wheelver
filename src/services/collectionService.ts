// src/services/collectionService.ts
import { Types } from "mongoose";
import { createLogger } from "../utils/logger";
import { Collection, CollectionItem, Hotwheel } from "../models";
import { ItemCondition } from "../interfaces/ICollectionItem";

const { logRequest } = createLogger("COLLECTION_SERVICE", "cyan");

const ITEM_POPULATE = { path: "hotwheel", populate: { path: "series" } };

/**
 * Loads the items of the given (lean) collections and attaches them as `items`
 * (newest first) plus `itemCount`. Items whose hotwheel no longer exists are skipped.
 */
const attachItems = async (collections: any[]) => {
    if (collections.length === 0) return collections;

    const items = await CollectionItem.find({ collectionId: { $in: collections.map((c) => c._id) } })
        .sort({ acquiredAt: -1 })
        .populate(ITEM_POPULATE)
        .lean();

    const byCollection = new Map<string, any[]>();
    for (const item of items) {
        if (!item.hotwheel) continue;
        const key = item.collectionId.toString();
        if (!byCollection.has(key)) byCollection.set(key, []);
        byCollection.get(key)!.push(item);
    }

    return collections.map((col) => {
        const colItems = byCollection.get(col._id.toString()) || [];
        return { ...col, items: colItems, itemCount: colItems.length };
    });
};

export const createCollection = async (collectionData: { name: string; owner: Types.ObjectId | string }) => {
    logRequest("Creating new collection");
    try {
        const collection = new Collection(collectionData);
        return await collection.save();
    } catch (error: any) {
        throw new Error(`Failed to create collection: ${error.message}`);
    }
}

export const getCollections = async (filter: any = {}) => {
    logRequest(`Getting collections with filter ${JSON.stringify(filter)}`);
    try {
        return await Collection.find(filter);
    } catch (error: any) {
        throw new Error(`Failed to get collections: ${error.message}`);
    }
};

export const getCollectionsWithItems = async (filter: any = {}) => {
    logRequest(`Getting collections with items for filter ${JSON.stringify(filter)}`);
    try {
        const collections = await Collection.find(filter).sort({ createdAt: -1 }).lean();
        return await attachItems(collections);
    } catch (error: any) {
        throw new Error(`Failed to get collections: ${error.message}`);
    }
};

export const getCollection = async (id: string) => {
    logRequest(`Getting collection with id ${id}`);
    try {
        const collection = await Collection.findById(id)
            .populate("owner", "handle displayName")
            .lean();
        if (!collection) return null;
        const [withItems] = await attachItems([collection]);
        return withItems;
    } catch (error: any) {
        throw new Error(`Failed to get collection: ${error.message}`);
    }
};

export const updateCollection = async (id: string, collectionData: { name: string }) => {
    logRequest(`Updating collection with id ${id}`);
    try {
        return await Collection.findByIdAndUpdate(id, collectionData, { new: true, runValidators: true });
    } catch (error: any) {
        throw new Error(`Failed to update collection: ${error.message}`);
    }
};

export const deleteCollection = async (id: string) => {
    logRequest(`Deleting collection with id ${id}`);
    try {
        await CollectionItem.deleteMany({ collectionId: id });
        return await Collection.findByIdAndDelete(id);
    } catch (error: any) {
        throw new Error(`Failed to delete collection: ${error.message}`);
    }
};

/**
 * Adds `quantity` physical copies of a hotwheel to a collection.
 * Returns null if the collection does not exist, throws if the hotwheel does not exist.
 */
export const addItems = async (
    collectionId: string,
    hotwheelId: string,
    quantity: number,
    condition?: ItemCondition
) => {
    logRequest(`Adding ${quantity}x hotwheel ${hotwheelId} to collection ${collectionId}`);

    const collection = await Collection.findById(collectionId).lean();
    if (!collection) return null;

    const hotwheelExists = await Hotwheel.exists({ _id: hotwheelId });
    if (!hotwheelExists) {
        throw new Error(`Hotwheel with id ${hotwheelId} not found`);
    }

    const now = new Date();
    const created = await CollectionItem.insertMany(
        Array.from({ length: quantity }, () => ({
            collectionId,
            hotwheel: hotwheelId,
            owner: collection.owner,
            acquiredAt: now,
            condition,
        }))
    );

    return await CollectionItem.find({ _id: { $in: created.map((i) => i._id) } })
        .populate(ITEM_POPULATE)
        .lean();
};

/** Removes a single copy. Returns null if the item is not part of the collection. */
export const removeItem = async (collectionId: string, itemId: string) => {
    logRequest(`Removing item ${itemId} from collection ${collectionId}`);
    try {
        return await CollectionItem.findOneAndDelete({ _id: itemId, collectionId });
    } catch (error: any) {
        throw new Error(`Failed to remove item from collection: ${error.message}`);
    }
};
