// src/services/collectionService.ts
import { Types } from "mongoose";
import { Collection, CollectionItem, Hotwheel } from "../models";
import { ItemCondition } from "../interfaces/ICollectionItem";
import { notFound } from "../errors/HttpError";
import { PageOptions, skipFor, toPage } from "../utils/pagination";

type Id = string | Types.ObjectId;

const ITEM_POPULATE = { path: "hotwheel", populate: { path: "series" } };

/**
 * Loads the items of the given (lean) collections and attaches them as `items`
 * (newest first) plus `itemCount`. Items whose hotwheel no longer exists are skipped.
 */
const attachItems = async <T extends { _id: Types.ObjectId }>(collections: T[]) => {
    const items = collections.length
        ? await CollectionItem.find({ collectionId: { $in: collections.map((c) => c._id) } })
              .sort({ acquiredAt: -1 })
              .populate(ITEM_POPULATE)
              .lean()
        : [];

    const byCollection = new Map<string, typeof items>();
    for (const item of items) {
        if (!item.hotwheel) continue;
        const key = item.collectionId.toString();
        byCollection.set(key, [...(byCollection.get(key) ?? []), item]);
    }

    return collections.map((col) => {
        const colItems = byCollection.get(col._id.toString()) ?? [];
        return { ...col, items: colItems, itemCount: colItems.length };
    });
};

export const createCollection = async (data: { name: string; owner: Id }) => {
    return await Collection.create(data);
};

export const getCollections = async (owner: string | undefined, page: PageOptions) => {
    const filter = owner ? { owner } : {};
    const [data, total] = await Promise.all([
        Collection.find(filter).sort({ createdAt: -1 }).skip(skipFor(page)).limit(page.limit).lean(),
        Collection.countDocuments(filter),
    ]);
    return toPage(data, total, page);
};

/** All collections of a user including their items (used by profile and dashboard pages). */
export const getCollectionsWithItems = async (owner: Id) => {
    const collections = await Collection.find({ owner }).sort({ createdAt: -1 }).lean();
    return await attachItems(collections);
};

export const getCollection = async (id: string) => {
    const collection = await Collection.findById(id).populate("owner", "handle displayName").lean();
    if (!collection) return null;
    const [withItems] = await attachItems([collection]);
    return withItems;
};

export const updateCollection = async (id: string, data: { name: string }) => {
    return await Collection.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteCollection = async (id: string) => {
    await CollectionItem.deleteMany({ collectionId: id });
    return await Collection.findByIdAndDelete(id);
};

export const getItems = async (collectionId: string, page: PageOptions) => {
    const filter = { collectionId };
    const [data, total] = await Promise.all([
        CollectionItem.find(filter)
            .sort({ acquiredAt: -1 })
            .skip(skipFor(page))
            .limit(page.limit)
            .populate(ITEM_POPULATE)
            .lean(),
        CollectionItem.countDocuments(filter),
    ]);
    return toPage(data, total, page);
};

/** Adds `quantity` physical copies of a hotwheel to a collection. */
export const addItems = async (
    collectionId: string,
    hotwheelId: string,
    quantity: number,
    condition?: ItemCondition,
) => {
    const collection = await Collection.findById(collectionId).select("owner").lean();
    if (!collection) throw notFound("Collection not found");

    if (!(await Hotwheel.exists({ _id: hotwheelId }))) {
        throw notFound("Hotwheel not found");
    }

    const acquiredAt = new Date();
    const created = await CollectionItem.insertMany(
        Array.from({ length: quantity }, () => ({
            collectionId,
            hotwheel: hotwheelId,
            owner: collection.owner,
            acquiredAt,
            condition,
        })),
    );

    return await CollectionItem.find({ _id: { $in: created.map((i) => i._id) } })
        .populate(ITEM_POPULATE)
        .lean();
};

/** Removes a single copy. Returns null if the item is not part of the collection. */
export const removeItem = async (collectionId: string, itemId: string) => {
    return await CollectionItem.findOneAndDelete({ _id: itemId, collectionId });
};
