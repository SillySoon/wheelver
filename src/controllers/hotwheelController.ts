// src/controllers/hotwheelController.ts
import { Request, Response } from "express";
import { createLogger } from "../utils/logger";
import { asyncHandler } from "../handlers/asyncHandler";
import * as HotwheelService from "../services/hotwheelService";
import { isValidObjectId } from "../utils/validation";

const { logRequest, logWarning } = createLogger(
    "HOTWHEEL_CONTROLLER",
    "dark_green"
);

export const createHotwheel = asyncHandler(async (req: Request, res: Response) => {
    logRequest("POST /hotwheel");
    try {
        const hotwheel = await HotwheelService.createHotwheel(req.body);
        return res.status(201).json(hotwheel);
    } catch (error: any) {
        logWarning(`Error creating hotwheel: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getHotwheels = asyncHandler(async (req: Request, res: Response) => {
    logRequest("GET /hotwheel");
    const search = (req.query.query || req.query.search) as string;
    try {
        const hotwheels = await HotwheelService.getHotwheels(search);
        return res.status(200).json(hotwheels);
    } catch (error: any) {
        logWarning(`Error retrieving hotwheels: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getHotwheel = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`GET /hotwheel/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid hotwheel ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const hotwheel = await HotwheelService.getHotwheel(req.params.id as string);
        if (!hotwheel) {
            return res.status(404).json({ message: "Hotwheel not found" });
        }
        return res.status(200).json(hotwheel);
    } catch (error: any) {
        logWarning(`Error retrieving hotwheel: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const updateHotwheel = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`PUT /hotwheel/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid hotwheel ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const hotwheel = await HotwheelService.updateHotwheel(req.params.id as string, req.body);
        if (!hotwheel) {
            return res.status(404).json({ message: "Hotwheel not found" });
        }
        return res.status(200).json(hotwheel);
    } catch (error: any) {
        logWarning(`Error updating hotwheel: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const deleteHotwheel = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`DELETE /hotwheel/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid hotwheel ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const hotwheel = await HotwheelService.deleteHotwheel(req.params.id as string);
        if (!hotwheel) {
            return res.status(404).json({ message: "Hotwheel not found" });
        }
        return res.status(200).json({ message: "Hotwheel deleted successfully" });
    } catch (error: any) {
        logWarning(`Error deleting hotwheel: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});
