// src/controllers/seriesController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../handlers/asyncHandler";
import * as SeriesService from "../services/seriesService";
import { notFound } from "../errors/HttpError";
import { idParams, parse, seriesBody } from "../validation/schemas";

export const createSeries = asyncHandler(async (req: Request, res: Response) => {
    const data = parse(seriesBody, req.body);
    res.status(201).json(await SeriesService.createSeries(data));
});

export const getAllSeries = asyncHandler(async (req: Request, res: Response) => {
    res.json(await SeriesService.getAllSeries());
});

export const getSeries = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const series = await SeriesService.getSeries(id);
    if (!series) throw notFound("Series not found");
    res.json(series);
});

export const updateSeries = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const data = parse(seriesBody.partial(), req.body);
    const series = await SeriesService.updateSeries(id, data);
    if (!series) throw notFound("Series not found");
    res.json(series);
});

export const deleteSeries = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const series = await SeriesService.deleteSeries(id);
    if (!series) throw notFound("Series not found");
    res.json({ message: "Series deleted successfully" });
});
