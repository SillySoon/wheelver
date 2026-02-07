import mongoose from "mongoose";

export const isValidObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const isValidCollectionName = (name: string): boolean => {
    // lowercase, uppercase, maybe - and _ and &
    const regex = /^[a-zA-Z0-9\-_& ]+$/;
    return regex.test(name);
};
