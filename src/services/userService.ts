// src/services/userService.ts
import { User, Collection, CollectionItem } from "../models";
import { diacriticSensitiveRegex } from "../utils/stringUtils";
import { isValidObjectId } from "../utils/validation";
import { PageOptions, skipFor, toPage } from "../utils/pagination";

/** Fields that may be shown to other users. */
export const PUBLIC_USER_FIELDS = "handle displayName createdAt";

export const getUsers = async (search: string | undefined, page: PageOptions) => {
    const filter = search
        ? {
              $or: [
                  { handle: { $regex: diacriticSensitiveRegex(search), $options: "i" } },
                  { displayName: { $regex: diacriticSensitiveRegex(search), $options: "i" } },
              ],
          }
        : {};

    const [data, total] = await Promise.all([
        User.find(filter).select(PUBLIC_USER_FIELDS).sort({ handle: 1 }).skip(skipFor(page)).limit(page.limit).lean(),
        User.countDocuments(filter),
    ]);
    return toPage(data, total, page);
};

export const getUser = async (id: string) => {
    return await User.findById(id).select(PUBLIC_USER_FIELDS).lean();
};

/** Deletes the user together with all of their collections and items. */
export const deleteUser = async (id: string) => {
    await CollectionItem.deleteMany({ owner: id });
    await Collection.deleteMany({ owner: id });
    return await User.findByIdAndDelete(id);
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
