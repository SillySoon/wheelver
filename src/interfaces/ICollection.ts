// src/interfaces/ICollection.ts
import { Document, Types } from "mongoose";
import { IUser } from "./IUser";

export interface ICollection extends Document {
    name: string;
    owner: Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}
