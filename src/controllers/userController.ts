// src/controllers/userController.ts
import  {Request, Response } from "express";
import { createLogger } from "../utils/logger";
import { asyncHandler } from "../handlers/asyncHandler";
import * as UserService from "../services/userService";

const { logRequest, logWarning } = createLogger(
    "USER_CONTROLLER",
    "dark_green"
);

export const getUser = asyncHandler(
    async ( req: Request, res: Response) => {
    logRequest("GET /users/:id");
    try {
        const id: string = req.params.id.toString();
        const user = await UserService.getUser(id);
        return res.status(200).json(user);
    } catch (error: any) {
        logWarning(`Error retrieving user: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
})