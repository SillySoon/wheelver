// src/services/hotwheelService.ts
import { z } from "zod";
import { CollectionItem, Hotwheel } from "../models";
import { conflict } from "../errors/HttpError";
import { diacriticSensitiveRegex } from "../utils/stringUtils";
import { PageOptions, skipFor, toPage } from "../utils/pagination";
import { hotwheelBody } from "../validation/schemas";

type HotwheelInput = z.infer<typeof hotwheelBody>;

export const createHotwheel = async (data: HotwheelInput) => {
    return await Hotwheel.create(data);
};

export const getHotwheels = async (search: string | undefined, page: PageOptions) => {
    const filter = search
        ? {
              $or: [
                  { name: { $regex: diacriticSensitiveRegex(search), $options: "i" } },
                  { toyNumber: { $regex: diacriticSensitiveRegex(search), $options: "i" } },
              ],
          }
        : {};

    const [data, total] = await Promise.all([
        Hotwheel.find(filter)
            .sort({ year: -1, colNumber: 1 })
            .skip(skipFor(page))
            .limit(page.limit)
            .populate("series")
            .lean(),
        Hotwheel.countDocuments(filter),
    ]);
    return toPage(data, total, page);
};

export const getHotwheel = async (id: string) => {
    return await Hotwheel.findById(id).populate("series").lean();
};

export const updateHotwheel = async (id: string, data: Partial<HotwheelInput>) => {
    return await Hotwheel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteHotwheel = async (id: string) => {
    if (await CollectionItem.exists({ hotwheel: id })) {
        throw conflict("Hotwheel is still part of collections");
    }
    return await Hotwheel.findByIdAndDelete(id);
};
