// src/services/userService.ts
import { createLogger } from "../utils/logger";
import { User, Collection } from "../models";
import { diacriticSensitiveRegex } from "../utils/stringUtils";

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

export const getUsers = async (search?: string) => {
    logRequest("Getting all users" + (search ? ` with search: ${search}` : ""));
    try {
        let query = {};
        if (search) {
            const fuzzySearch = diacriticSensitiveRegex(search);
            query = {
                $or: [
                    { username: { $regex: fuzzySearch, $options: "i" } },
                    { discordId: { $regex: fuzzySearch, $options: "i" } }
                ]
            };
        }
        return await User.find(query);
    } catch (error: any) {
        throw new Error(`Failed to get users: ${error.message}`);
    }
};

export const getUser = async (id: string) => {
    logRequest(`Getting user with id ${id}`);
    try {
        return await User.findById(id);
    } catch (error: any) {
        throw new Error(`Failed to get user: ${error.message}`);
    }
};

export const updateUser = async (id: string, userData: any) => {
    logRequest(`Updating user with id ${id}`);
    try {
        return await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
    } catch (error: any) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
};

export const deleteUser = async (id: string) => {
    logRequest(`Deleting user with id ${id}`);
    try {
        // Remove the user's collections too, so no orphaned data stays behind
        await Collection.deleteMany({ owner: id });
        return await User.findByIdAndDelete(id);
    } catch (error: any) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

export const isUsernameTaken = async (username: string, excludeUserId?: string) => {
    const filter: any = { username };
    if (excludeUserId) {
        filter._id = { $ne: excludeUserId };
    }
    // Case-insensitive match so "Silly" and "silly" cannot both exist
    const existing = await User.findOne(filter).collation({ locale: "en", strength: 2 });
    return !!existing;
};
