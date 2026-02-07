// src/services/hotwheelService.ts
import { createLogger } from "../utils/logger";
import { Hotwheel } from "../models";

const { logRequest } = createLogger("HOTWHEEL_SERVICE", "cyan");

export const createHotwheel = async (hotwheelData: any) => {
    logRequest("Creating new hotwheel");
    try {
        const hotwheel = new Hotwheel(hotwheelData);
        return await hotwheel.save();
    } catch (error: any) {
        throw new Error(`Failed to create hotwheel: ${error.message}`);
    }
};

export const getHotwheels = async () => {
    logRequest("Getting all hotwheels");
    try {
        return await Hotwheel.find().populate('series');
    } catch (error: any) {
        throw new Error(`Failed to get hotwheels: ${error.message}`);
    }
};

export const getHotwheel = async (id: string) => {
    logRequest(`Getting hotwheel with id ${id}`);
    try {
        return await Hotwheel.findById(id).populate('series');
    } catch (error: any) {
        throw new Error(`Failed to get hotwheel: ${error.message}`);
    }
};

export const updateHotwheel = async (id: string, hotwheelData: any) => {
    logRequest(`Updating hotwheel with id ${id}`);
    try {
        return await Hotwheel.findByIdAndUpdate(id, hotwheelData, { new: true });
    } catch (error: any) {
        throw new Error(`Failed to update hotwheel: ${error.message}`);
    }
};

export const deleteHotwheel = async (id: string) => {
    logRequest(`Deleting hotwheel with id ${id}`);
    try {
        return await Hotwheel.findByIdAndDelete(id);
    } catch (error: any) {
        throw new Error(`Failed to delete hotwheel: ${error.message}`);
    }
};
