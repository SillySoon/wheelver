// src/interfaces/ICollection.ts
import { Document, Types } from "mongoose";
import { IHotwheel } from "./IHotwheel";

export interface ICollection extends Document {
    name: string;
    createdAt: Date;
    hotwheels?: Types.ObjectId[] | IHotwheel[];
}
