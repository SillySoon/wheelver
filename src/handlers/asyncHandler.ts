// src/handlers/asyncHandler.ts
import { Request, Response, NextFunction } from "express";

export const asyncHandler = <Req = Request, Res = Response, FnReturn = any>(
    fn: (req: Req, res: Res, next: NextFunction) => Promise<FnReturn>
) => {
    return (req: Req, res: Res, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};