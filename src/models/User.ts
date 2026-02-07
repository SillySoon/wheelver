// src/models/User.ts
import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/IUser";

const UserSchema: Schema<IUser> = new mongoose.Schema<IUser>({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    isRegistered: { type: Boolean, default: false },
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
