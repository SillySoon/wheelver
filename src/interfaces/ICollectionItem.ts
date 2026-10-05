// src/interfaces/ICollectionItem.ts
import { Document, Types } from "mongoose";
import { ICollection } from "./ICollection";
import { IHotwheel } from "./IHotwheel";
import { IUser } from "./IUser";

export enum ItemCondition {
    CARDED = "carded",
    LOOSE = "loose",
    DAMAGED = "damaged",
}

/** One physical copy of a Hot Wheel inside a collection. */
export interface ICollectionItem extends Document {
    collectionId: Types.ObjectId | ICollection;
    hotwheel: Types.ObjectId | IHotwheel;
    owner: Types.ObjectId | IUser;
    acquiredAt: Date;
    condition?: ItemCondition;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
