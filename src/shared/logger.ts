/** @fileoverview Centralized logging utility with level-based output control. */

/** Available log severity levels, ordered from most to least severe. */
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

const currentLevel: LogLevel = import.meta.env.PROD ? LogLevel.WARN : LogLevel.DEBUG

/** Formats a log message with timestamp and context prefix. */
function formatMessage(level: string, context: string, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] [${context}] ${message}`
}

/**
 * Centralized logger providing structured, level-gated output.
 * In production, only ERROR and WARN levels are emitted.
 * In development, all levels including DEBUG are active.
 */
export const logger = {
    /** Logs an error with full error object serialization. */
    error(context: string, error: unknown): void {
        if (currentLevel < LogLevel.ERROR) return
        const message = error instanceof Error ? error.message : String(error)
        console.error(formatMessage('ERROR', context, message))
        if (error instanceof Error && error.stack) {
            console.error(error.stack)
        }
    },

    /** Logs a warning for degradable failures. */
    warn(context: string, message: string): void {
        if (currentLevel < LogLevel.WARN) return
        console.warn(formatMessage('WARN', context, message))
    },

    /** Logs informational messages for significant operations. */
    info(context: string, message: string): void {
        if (currentLevel < LogLevel.INFO) return
        console.info(formatMessage('INFO', context, message))
    },

    /** Logs debug data, suppressed in production. */
    debug(context: string, data?: unknown): void {
        if (currentLevel < LogLevel.DEBUG) return
        const message = data !== undefined ? JSON.stringify(data) : ''
        console.debug(formatMessage('DEBUG', context, message))
    },
}
