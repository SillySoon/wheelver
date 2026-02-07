// src/controllers/seriesController.ts
import { Request, Response } from "express";
import { createLogger } from "../utils/logger";
import { asyncHandler } from "../handlers/asyncHandler";
import * as SeriesService from "../services/seriesService";
import { isValidObjectId } from "../utils/validation";

const { logRequest, logWarning } = createLogger(
    "SERIES_CONTROLLER",
    "dark_green"
);

export const createSeries = asyncHandler(async (req: Request, res: Response) => {
    logRequest("POST /series");
    try {
        const series = await SeriesService.createSeries(req.body);
        return res.status(201).json(series);
    } catch (error: any) {
        logWarning(`Error creating series: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getAllSeries = asyncHandler(async (req: Request, res: Response) => {
    logRequest("GET /series");
    try {
        const series = await SeriesService.getAllSeries();
        return res.status(200).json(series);
    } catch (error: any) {
        logWarning(`Error retrieving series: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getSeries = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`GET /series/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid series ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const series = await SeriesService.getSeries(req.params.id as string);
        if (!series) {
            return res.status(404).json({ message: "Series not found" });
        }
        return res.status(200).json(series);
    } catch (error: any) {
        logWarning(`Error retrieving series: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const updateSeries = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`PUT /series/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid series ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const series = await SeriesService.updateSeries(req.params.id as string, req.body);
        if (!series) {
            return res.status(404).json({ message: "Series not found" });
        }
        return res.status(200).json(series);
    } catch (error: any) {
        logWarning(`Error updating series: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const deleteSeries = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`DELETE /series/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid series ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const series = await SeriesService.deleteSeries(req.params.id as string);
        if (!series) {
            return res.status(404).json({ message: "Series not found" });
        }
        return res.status(200).json({ message: "Series deleted successfully" });
    } catch (error: any) {
        logWarning(`Error deleting series: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});
