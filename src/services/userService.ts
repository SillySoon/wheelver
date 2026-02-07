// src/services/userService.ts
import { createLogger } from "../utils/logger";
import { User, Collection } from "../models";

const { logRequest } = createLogger("USER_SERVICE", "cyan");

export const createUser = async (userData: any) => {
    logRequest("Creating new user");
    try {
        const user = new User(userData);
        return await user.save();
    } catch (error: any) {
        throw new Error(`Failed to create user: ${error.message}`);
    }
};

export const getUsers = async () => {
    logRequest("Getting all users");
    try {
        return await User.find().populate({
            path: "collections",
            populate: {
                path: "hotwheels",
                populate: { path: "series" }
            }
        });
    } catch (error: any) {
        throw new Error(`Failed to get users: ${error.message}`);
    }
};

export const getUser = async (id: string) => {
    logRequest(`Getting user with id ${id}`);
    try {
        return await User.findById(id).populate({
            path: "collections",
            populate: {
                path: "hotwheels",
                populate: { path: "series" }
            }
        });
    } catch (error: any) {
        throw new Error(`Failed to get user: ${error.message}`);
    }
};

export const updateUser = async (id: string, userData: any) => {
    logRequest(`Updating user with id ${id}`);
    try {
        return await User.findByIdAndUpdate(id, userData, { new: true }).populate({
            path: "collections",
            populate: {
                path: "hotwheels",
                populate: { path: "series" }
            }
        });
    } catch (error: any) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
};

export const deleteUser = async (id: string) => {
    logRequest(`Deleting user with id ${id}`);
    try {
        return await User.findByIdAndDelete(id);
    } catch (error: any) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

export const addCollectionToUser = async (userId: string, collectionId: string) => {
    logRequest(`Adding collection ${collectionId} to user ${userId}`);
    try {
        // Verify collection exists
        const collection = await Collection.findById(collectionId);
        if (!collection) {
            throw new Error(`Collection with id ${collectionId} not found`);
        }

        return await User.findByIdAndUpdate(
            userId,
            { $addToSet: { collections: collectionId } },
            { new: true }
        ).populate({
            path: "collections",
            populate: {
                path: "hotwheels",
                populate: { path: "series" }
            }
        });
    } catch (error: any) {
        throw new Error(`Failed to add collection to user: ${error.message}`);
    }
};

export const removeCollectionFromUser = async (userId: string, collectionId: string) => {
    logRequest(`Removing collection ${collectionId} from user ${userId}`);
    try {
        return await User.findByIdAndUpdate(
            userId,
            { $pull: { collections: collectionId } },
            { new: true }
        ).populate({
            path: "collections",
            populate: {
                path: "hotwheels",
                populate: { path: "series" }
            }
        });
    } catch (error: any) {
        throw new Error(`Failed to remove collection from user: ${error.message}`);
    }
};