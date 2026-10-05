// src/models/CollectionItem.ts
import mongoose, { Schema } from "mongoose";
import { ICollectionItem, ItemCondition } from "../interfaces/ICollectionItem";

const CollectionItemSchema: Schema<ICollectionItem> = new mongoose.Schema<ICollectionItem>(
    {
        // Named collectionId because `collection` is reserved on Mongoose documents
        collectionId: { type: Schema.Types.ObjectId, ref: "Collection", required: true },
        hotwheel: { type: Schema.Types.ObjectId, ref: "Hotwheel", required: true },
        // Denormalized from the collection for per-user queries and stats
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        acquiredAt: { type: Date, default: Date.now },
        condition: { type: String, enum: Object.values(ItemCondition) },
        notes: { type: String, maxlength: 500 },
    },
    { timestamps: true },
);

CollectionItemSchema.index({ collectionId: 1, hotwheel: 1 });
CollectionItemSchema.index({ collectionId: 1, acquiredAt: -1 });
CollectionItemSchema.index({ owner: 1, hotwheel: 1 });

export default mongoose.model<ICollectionItem>("CollectionItem", CollectionItemSchema);
