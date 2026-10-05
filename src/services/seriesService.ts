// src/services/seriesService.ts
import { z } from "zod";
import { Hotwheel, Series } from "../models";
import { conflict } from "../errors/HttpError";
import { seriesBody } from "../validation/schemas";

type SeriesInput = z.infer<typeof seriesBody>;

export const createSeries = async (data: SeriesInput) => {
    return await Series.create(data);
};

export const getAllSeries = async () => {
    return await Series.find().sort({ name: 1 }).lean();
};

export const getSeries = async (id: string) => {
    return await Series.findById(id).lean();
};

export const updateSeries = async (id: string, data: Partial<SeriesInput>) => {
    return await Series.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteSeries = async (id: string) => {
    if (await Hotwheel.exists({ series: id })) {
        throw conflict("Series still has hotwheels");
    }
    return await Series.findByIdAndDelete(id);
};
