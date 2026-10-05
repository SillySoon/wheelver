// src/models/User.ts
import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/IUser";

const UserSchema: Schema<IUser> = new mongoose.Schema<IUser>({
    discordId: { type: String, required: true, unique: true },
    // Discord username (unique handle), synced on every login and used in profile URLs
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Discord global name, falls back to the handle
    displayName: { type: String, required: true, trim: true },
    // Old handles so that /u/<old-handle> can redirect after a rename
    previousHandles: { type: [String], default: [], index: true },
    lastLoginAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>("User", UserSchema);
