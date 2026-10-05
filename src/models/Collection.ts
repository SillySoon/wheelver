// src/models/Collection.ts
import mongoose, { Schema } from "mongoose";
import { ICollection } from "../interfaces/ICollection";

const CollectionSchema: Schema<ICollection> = new mongoose.Schema<ICollection>({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
}, { timestamps: true });

export default mongoose.model<ICollection>("Collection", CollectionSchema);
