// src/interfaces/ICollection.ts
import { Document, Types } from "mongoose";
import { IHotwheel } from "./IHotwheel";
import { IUser } from "./IUser";

export interface ICollection extends Document {
    name: string;
    owner: Types.ObjectId | IUser;
    createdAt: Date;
    hotwheels?: Types.ObjectId[] | IHotwheel[];
}
