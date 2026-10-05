// src/interfaces/IHotwheel.ts
import { Document } from "mongoose";
import { ISeries } from "./ISeries";

export enum HotwheelExtra {
    REGULAR = "Regular",
    TREASURE_HUNT = "Treasure Hunt",
    SUPER_TREASURE_HUNT = "Super Treasure Hunt",
    CHASE = "Chase",
}

export interface IHotwheel extends Document {
    toyNumber: string;
    colNumber?: number;
    name: string;
    series: ISeries;
    seriesNumber: number;
    year: number;
    extra?: HotwheelExtra;
    photoUrl?: string;
}
