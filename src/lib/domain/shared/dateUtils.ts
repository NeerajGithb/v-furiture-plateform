export type Period = "30m" | "1h" | "6h" | "12h" | "24h" | "1day" | "7d" | "30d" | "90d" | "1y" | "all";

export function getStartDateFromPeriod(period: Period | string, referenceDate: Date = new Date()): Date {
    const now = referenceDate.getTime();

    switch (period) {
        case "30m":
            return new Date(now - 30 * 60 * 1000);
        case "1h":
            return new Date(now - 60 * 60 * 1000);
        case "6h":
            return new Date(now - 6 * 60 * 60 * 1000);
        case "12h":
            return new Date(now - 12 * 60 * 60 * 1000);
        case "24h":
        case "1day":
            return new Date(now - 24 * 60 * 60 * 1000);
        case "7d":
            return new Date(now - 7 * 24 * 60 * 60 * 1000);
        case "30d":
            return new Date(now - 30 * 24 * 60 * 60 * 1000);
        case "90d":
            return new Date(now - 90 * 24 * 60 * 60 * 1000);
        case "1y":
            return new Date(now - 365 * 24 * 60 * 60 * 1000);
        case "all":
            // Return a very old date (10 years ago) to get all records
            return new Date(now - 10 * 365 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
}

export function getDateRange(period: Period | string, referenceDate: Date = new Date()): { startDate: Date; endDate: Date } {
    return {
        startDate: getStartDateFromPeriod(period, referenceDate),
        endDate: referenceDate,
    };
}

export function getPeriodInDays(period: Period | string): number {
    switch (period) {
        case "30m":
            return 0.021;
        case "1h":
            return 0.042;
        case "6h":
            return 0.25;
        case "12h":
            return 0.5;
        case "24h":
        case "1day":
            return 1;
        case "7d":
            return 7;
        case "30d":
            return 30;
        case "90d":
            return 90;
        case "1y":
            return 365;
        case "all":
            return 3650; // 10 years
        default:
            return 30;
    }
}
