// src/models/Series.ts
import mongoose, { Schema } from "mongoose";
import { ISeries } from "../interfaces/ISeries";

const SeriesSchema: Schema<ISeries> = new mongoose.Schema<ISeries>({
    name: { type: String, required: true, unique: true },
});

export default mongoose.model<ISeries>("Series", SeriesSchema);
