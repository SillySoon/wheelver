// src/models/Hotwheel.ts
import mongoose, { Schema } from "mongoose";
import { IHotwheel, HotwheelExtra } from "../interfaces/IHotwheel";

const HotwheelSchema: Schema<IHotwheel> = new mongoose.Schema<IHotwheel>({
    toyNumber: { type: String, required: true },
    colNumber: { type: String },
    name: { type: String, required: true },
    series: { type: Schema.Types.ObjectId, ref: "Series", required: true },
    seriesNumber: { type: String, required: true },
    year: { type: Number, required: true },
    extra: {
        type: String,
        enum: Object.values(HotwheelExtra),
        default: HotwheelExtra.REGULAR,
    },
    photoUrl: { type: String },
});

export default mongoose.model<IHotwheel>("Hotwheel", HotwheelSchema);
