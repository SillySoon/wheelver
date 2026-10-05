// src/controllers/userController.ts
import { Request, Response } from "express";
import { createLogger } from "../utils/logger";
import { asyncHandler } from "../handlers/asyncHandler";
import * as UserService from "../services/userService";
import { isValidObjectId, isValidUsername } from "../utils/validation";

const { logRequest, logWarning } = createLogger(
    "USER_CONTROLLER",
    "dark_green"
);

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    logRequest("POST /user");
    try {
        const user = await UserService.createUser(req.body);
        return res.status(201).json(user);
    } catch (error: any) {
        logWarning(`Error creating user: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    logRequest("GET /user");
    const search = (req.query.query || req.query.search) as string;
    try {
        const users = await UserService.getUsers(search);
        return res.status(200).json(users);
    } catch (error: any) {
        logWarning(`Error retrieving users: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`GET /user/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid user ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const user = await UserService.getUser(req.params.id as string);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error: any) {
        logWarning(`Error retrieving user: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`PUT /user/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid user ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    const { username } = req.body;
    if (!isValidUsername(username)) {
        return res.status(400).json({ message: "Username must be 3-20 characters long and contain only letters, numbers, and underscores." });
    }

    try {
        if (await UserService.isUsernameTaken(username, req.params.id as string)) {
            return res.status(409).json({ message: "Username already taken" });
        }

        // Only whitelisted fields may be changed by the user
        const user = await UserService.updateUser(req.params.id as string, { username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error: any) {
        logWarning(`Error updating user: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    logRequest(`DELETE /user/${req.params.id}`);

    if (!isValidObjectId(req.params.id as string)) {
        logWarning(`Invalid user ID format: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const user = await UserService.deleteUser(req.params.id as string);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // End the session when users delete their own account
        if ((req.user as any)?._id.toString() === req.params.id) {
            return req.logout(() => {
                res.status(200).json({ message: "User deleted successfully" });
            });
        }
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
        logWarning(`Error deleting user: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});