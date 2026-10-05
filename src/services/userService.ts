// src/services/userService.ts
import { createLogger } from "../utils/logger";
import { User, Collection, CollectionItem } from "../models";
import { diacriticSensitiveRegex } from "../utils/stringUtils";
import { isValidObjectId } from "../utils/validation";

const { logRequest } = createLogger("USER_SERVICE", "cyan");

/** Fields that may be shown to other users. */
export const PUBLIC_USER_FIELDS = "handle displayName createdAt";

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
                    { handle: { $regex: fuzzySearch, $options: "i" } },
                    { displayName: { $regex: fuzzySearch, $options: "i" } }
                ]
            };
        }
        return await User.find(query).select(PUBLIC_USER_FIELDS).limit(20).lean();
    } catch (error: any) {
        throw new Error(`Failed to get users: ${error.message}`);
    }
};

export const getUser = async (id: string) => {
    logRequest(`Getting user with id ${id}`);
    try {
        return await User.findById(id).select(PUBLIC_USER_FIELDS).lean();
    } catch (error: any) {
        throw new Error(`Failed to get user: ${error.message}`);
    }
};

export const deleteUser = async (id: string) => {
    logRequest(`Deleting user with id ${id}`);
    try {
        // Remove the user's collections too, so no orphaned data stays behind
        await CollectionItem.deleteMany({ owner: id });
        await Collection.deleteMany({ owner: id });
        return await User.findByIdAndDelete(id);
    } catch (error: any) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

/**
 * Resolves a profile URL segment to a user.
 * Returns `{ user }` for the current handle or `{ redirectTo }` for an old handle or legacy ObjectId URL.
 */
export const resolveProfile = async (segment: string) => {
    const handle = segment.toLowerCase();

    const user = await User.findOne({ handle }).select(PUBLIC_USER_FIELDS).lean();
    if (user) return { user };

    const renamed = await User.findOne({ previousHandles: handle }).select("handle").lean();
    if (renamed) return { redirectTo: renamed.handle };

    if (isValidObjectId(segment)) {
        const legacy = await User.findById(segment).select("handle").lean();
        if (legacy) return { redirectTo: legacy.handle };
    }

    return {};
};
