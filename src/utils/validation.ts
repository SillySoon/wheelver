import mongoose from "mongoose";

export const isValidObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const isValidCollectionName = (name: string): boolean => {
    // lowercase, uppercase, maybe - and _ and &
    const regex = /^[a-zA-Z0-9\-_& ]{1,50}$/;
    return regex.test(name);
};

export const isValidUsername = (username: unknown): username is string => {
    return typeof username === "string" && /^[a-zA-Z0-9_]{3,20}$/.test(username);
};
