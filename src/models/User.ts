// src/models/User.ts
import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/IUser";

const UserSchema: Schema<IUser> = new mongoose.Schema<IUser>({
    discordId: { type: String, required: true, unique: true },
    username: { 
        type: String, 
        unique: true, 
        sparse: true,
        match: [/^[a-zA-Z0-9_]{3,20}$/, 'Please fill a valid username (3-20 characters, alphanumeric and underscore)']
    },
    isRegistered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
