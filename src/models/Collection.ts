// src/models/Collection.ts
import mongoose, { Schema } from "mongoose";
import { ICollection } from "../interfaces/ICollection";

const CollectionEntrySchema = new mongoose.Schema({
    hotwheel: { type: Schema.Types.ObjectId, ref: "Hotwheel", required: true },
    collectedAt: { type: Date, default: Date.now },
});

const CollectionSchema: Schema<ICollection> = new mongoose.Schema<ICollection>({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotwheels: [CollectionEntrySchema],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICollection>("Collection", CollectionSchema);
