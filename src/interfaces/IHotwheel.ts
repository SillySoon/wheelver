// src/interfaces/IHotwheel.ts
import { Document, Types } from "mongoose";
import { ISeries } from "./ISeries";

export enum HotwheelExtra {
    REGULAR = "Regular",
    TREASURE_HUNT = "Treasure Hunt",
    SUPER_TREASURE_HUNT = "Super Treasure Hunt",
    CHASE = "Chase",
}

export interface IHotwheel extends Document {
    toyNumber: string;
    colNumber?: string;
    name: string;
    series: ISeries;
    seriesNumber: string;
    year: number;
    extra?: Types.ObjectId | HotwheelExtra;
    photoUrl?: string;
}
