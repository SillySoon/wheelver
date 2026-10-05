// src/interfaces/IUser.ts
import { Document } from "mongoose";

export interface IUser extends Document {
    discordId: string;
    handle: string;
    displayName: string;
    previousHandles: string[];
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
