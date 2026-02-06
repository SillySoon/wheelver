// src/models/Collection.ts
import mongoose, { Schema } from "mongoose";
import { ICollection } from "../interfaces/ICollection";

const CollectionSchema: Schema<ICollection> = new mongoose.Schema<ICollection>({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    hotwheels: [{ type: Schema.Types.ObjectId, ref: "Hotwheel" }],
});

export default mongoose.model<ICollection>("Collection", CollectionSchema);
