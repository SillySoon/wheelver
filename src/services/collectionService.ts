// src/services/collectionService.ts
import { createLogger } from "../utils/logger";
import { Collection, Hotwheel, User } from "../models";

const { logRequest } = createLogger("COLLECTION_SERVICE", "cyan");

export const createCollection = async (collectionData: any) => {
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

export const getCollection = async (id: string) => {
    logRequest(`Getting collection with id ${id}`);
    try {
        return await Collection.findById(id)
            .populate({
                path: 'hotwheels',
                populate: { path: 'series' }
            })
            .populate('owner', 'username discordId')
            .lean();
    } catch (error: any) {
        throw new Error(`Failed to get collection: ${error.message}`);
    }
};

export const updateCollection = async (id: string, collectionData: any) => {
    logRequest(`Updating collection with id ${id}`);
    try {
        return await Collection.findByIdAndUpdate(id, collectionData, { new: true }).populate({
            path: 'hotwheels',
            populate: { path: 'series' }
        });
    } catch (error: any) {
        throw new Error(`Failed to update collection: ${error.message}`);
    }
};

export const deleteCollection = async (id: string) => {
    logRequest(`Deleting collection with id ${id}`);
    try {
        return await Collection.findByIdAndDelete(id);
    } catch (error: any) {
        throw new Error(`Failed to delete collection: ${error.message}`);
    }
};

export const addHotwheelToCollection = async (collectionId: string, hotwheelId: string) => {
    logRequest(`Adding hotwheel ${hotwheelId} to collection ${collectionId}`);
    try {
        // Verify Hotwheel exists
        const hotwheel = await Hotwheel.findById(hotwheelId);
        if (!hotwheel) {
            throw new Error(`Hotwheel with id ${hotwheelId} not found`);
        }

        return await Collection.findByIdAndUpdate(
            collectionId,
            { $addToSet: { hotwheels: hotwheelId } },
            { new: true }
        ).populate({
            path: 'hotwheels',
            populate: { path: 'series' }
        });
    } catch (error: any) {
        throw new Error(`Failed to add hotwheel to collection: ${error.message}`);
    }
};

export const removeHotwheelFromCollection = async (collectionId: string, hotwheelId: string) => {
    logRequest(`Removing hotwheel ${hotwheelId} from collection ${collectionId}`);
    try {
        return await Collection.findByIdAndUpdate(
            collectionId,
            { $pull: { hotwheels: hotwheelId } },
            { new: true }
        ).populate({
            path: 'hotwheels',
            populate: { path: 'series' }
        });
    } catch (error: any) {
        throw new Error(`Failed to remove hotwheel from collection: ${error.message}`);
    }
};
