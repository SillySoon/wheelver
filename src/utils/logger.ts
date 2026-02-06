// src/utils/logger.ts
import logger from "silly-logger";

export interface LoggerColors {
    request?: string;
    error?: string;
    warning?: string;
    success?: string;
}

export function createLogger(
    label: string,
    labelColor: string,
    colors: LoggerColors = {}
) {
    const requestColor = colors.request ?? "grey";
    const errorColor = colors.error ?? "red";
    const warningColor = colors.warning ?? "yellow";
    const successColor = colors.success ?? "grey";

    const log = (msgColor: string) => (msg: string) =>
        logger.custom(label, labelColor, msgColor, msg);

    return {
        logRequest: log(requestColor),
        logError: log(errorColor),
        logWarning: log(warningColor),
        logSuccess: log(successColor),
    };
}