// src/interfaces/IUser.ts
import { Document, Types } from "mongoose";
import { ICollection } from "./ICollection";

export interface IUser extends Document{
    discordId: string;
    username?: string;
    isRegistered: boolean;
    createdAt: Date;
}
