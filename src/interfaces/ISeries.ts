// src/interfaces/ISeries.ts
import { Document } from "mongoose";

export interface ISeries extends Document {
    name: string;
    shortName: string;
}
