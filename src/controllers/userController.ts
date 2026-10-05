// src/controllers/userController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../handlers/asyncHandler";
import * as UserService from "../services/userService";
import { notFound } from "../errors/HttpError";
import { requireUser } from "../middleware/authMiddleware";
import { idParams, parse, searchQuery } from "../validation/schemas";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    res.json(requireUser(req));
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = parse(searchQuery, req.query);
    res.json(await UserService.getUsers(search, { page, limit }));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const user = await UserService.getUser(id);
    if (!user) throw notFound("User not found");
    res.json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = parse(idParams, req.params);
    const user = await UserService.deleteUser(id);
    if (!user) throw notFound("User not found");

    // End the session when users delete their own account
    if (req.user?._id.toString() === id) {
        return req.logout(() => {
            res.json({ message: "User deleted successfully" });
        });
    }
    res.json({ message: "User deleted successfully" });
});
