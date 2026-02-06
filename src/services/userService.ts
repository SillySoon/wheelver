// src/services/userService.ts
import { createLogger } from "../utils/logger";
import { User } from "../models";

const { logRequest } = createLogger("USER_SERVICE", "dark_cyan");

export const getUser = async (id: string) => {
    logRequest(`Getting user with id ${id}`);

    try {
        return await User.findById(id);
    } catch (error: any) {
        throw new Error(`Failed to get user: ${error.message}`);
    }
}