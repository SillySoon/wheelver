// src/controllers/hotwheelController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../handlers/asyncHandler";
import * as HotwheelService from "../services/hotwheelService";
import { notFound } from "../errors/HttpError";
import { hotwheelBody, idParams, parse, searchQuery } from "../validation/schemas";

export const createHotwheel = asyncHandler(async (req: Request, res: Response) => {
    const data = parse(hotwheelBody, req.body);
    res.status(201).json(await HotwheelService.createHotwheel(data));
});

export const getHotwheels = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = parse(searchQuery, req.query);
    res.json(await HotwheelService.getHotwheels(search, { page, limit }));
});

export const getHotwheel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const hotwheel = await HotwheelService.getHotwheel(id);
    if (!hotwheel) throw notFound("Hotwheel not found");
    res.json(hotwheel);
});

export const updateHotwheel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const data = parse(hotwheelBody.partial(), req.body);
    const hotwheel = await HotwheelService.updateHotwheel(id, data);
    if (!hotwheel) throw notFound("Hotwheel not found");
    res.json(hotwheel);
});

export const deleteHotwheel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const hotwheel = await HotwheelService.deleteHotwheel(id);
    if (!hotwheel) throw notFound("Hotwheel not found");
    res.json({ message: "Hotwheel deleted successfully" });
});
