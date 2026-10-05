// src/controllers/viewController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../handlers/asyncHandler";
import * as UserService from "../services/userService";
import * as CollectionService from "../services/collectionService";
import * as HotwheelService from "../services/hotwheelService";
import { notFound } from "../errors/HttpError";
import { requireUser } from "../middleware/authMiddleware";
import { handleParams, idParams, parse, searchQuery } from "../validation/schemas";

const HOME_SEARCH_LIMIT = 5;

const currentUrl = (req: Request) => `${req.protocol}://${req.get("host")}${req.originalUrl}`;

export const home = asyncHandler(async (req: Request, res: Response) => {
    const { search } = parse(searchQuery, req.query);
    const users =
        search && search.length >= 2
            ? (await UserService.getUsers(search, { page: 1, limit: HOME_SEARCH_LIMIT })).data
            : [];
    res.render("site/home", { users, search: search ?? "" });
});

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const collections = await CollectionService.getCollectionsWithItems(user._id);
    res.render("site/dashboard", { user: user.toObject(), collections, error: null });
});

export const account = (req: Request, res: Response) => {
    res.render("site/dashboard_user");
};

export const editCollection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const collection = await CollectionService.getCollection(id);
    if (!collection) throw notFound("Collection not found");
    res.render("site/dashboard_collection", { collection, error: null });
});

export const profile = asyncHandler(async (req: Request, res: Response) => {
    const { handle } = parse(handleParams, req.params);
    const { user, redirectTo } = await UserService.resolveProfile(handle);

    if (redirectTo) {
        return res.redirect(301, `/u/${encodeURIComponent(redirectTo)}`);
    }
    if (!user) throw notFound("User not found");

    const collections = await CollectionService.getCollectionsWithItems(user._id);
    res.render("site/user", { user, collections, error: null, currentUrl: currentUrl(req) });
});

export const collection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const collection = await CollectionService.getCollection(id);
    if (!collection) throw notFound("Collection not found");

    res.render("site/collection", {
        collection,
        error: null,
        currentUrl: currentUrl(req),
        currentUser: req.user ?? null,
    });
});

export const hotwheel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const hotwheel = await HotwheelService.getHotwheel(id);
    if (!hotwheel) throw notFound("Hotwheel not found");
    res.render("site/hotwheel", { hotwheel, error: null });
});
