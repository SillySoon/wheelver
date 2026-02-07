// src/services/seriesService.ts
import { createLogger } from "../utils/logger";
import { Series } from "../models";

const { logRequest } = createLogger("SERIES_SERVICE", "cyan");

export const createSeries = async (seriesData: any) => {
    logRequest("Creating new series");
    try {
        const series = new Series(seriesData);
        return await series.save();
    } catch (error: any) {
        throw new Error(`Failed to create series: ${error.message}`);
    }
};

export const getAllSeries = async () => {
    logRequest("Getting all series");
    try {
        return await Series.find();
    } catch (error: any) {
        throw new Error(`Failed to get series: ${error.message}`);
    }
};

export const getSeries = async (id: string) => {
    logRequest(`Getting series with id ${id}`);
    try {
        return await Series.findById(id);
    } catch (error: any) {
        throw new Error(`Failed to get series: ${error.message}`);
    }
};

export const updateSeries = async (id: string, seriesData: any) => {
    logRequest(`Updating series with id ${id}`);
    try {
        return await Series.findByIdAndUpdate(id, seriesData, { new: true });
    } catch (error: any) {
        throw new Error(`Failed to update series: ${error.message}`);
    }
};

export const deleteSeries = async (id: string) => {
    logRequest(`Deleting series with id ${id}`);
    try {
        return await Series.findByIdAndDelete(id);
    } catch (error: any) {
        throw new Error(`Failed to delete series: ${error.message}`);
    }
};
