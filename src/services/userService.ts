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

export const getUsers = async (search?: string) => {
    logRequest("Getting all users" + (search ? ` with search: ${search}` : ""));
    try {
        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: { $regex: search, $options: "i" } },
                    { discordId: { $regex: search, $options: "i" } }
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
        return await User.findByIdAndUpdate(id, userData, { new: true });
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