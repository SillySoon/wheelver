// src/types/express.d.ts
import { IUser } from "../interfaces/IUser";

declare global {
    namespace Express {
        // Passport stores the Mongoose user document on req.user
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface User extends IUser {}
    }
}

export {};
