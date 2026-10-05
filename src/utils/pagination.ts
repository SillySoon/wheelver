// src/utils/pagination.ts

export interface PageOptions {
    page: number;
    limit: number;
}

export interface Page<T> {
    data: T[];
    pagination: PageOptions & { total: number; totalPages: number };
}

export const skipFor = ({ page, limit }: PageOptions) => (page - 1) * limit;

export const toPage = <T>(data: T[], total: number, options: PageOptions): Page<T> => ({
    data,
    pagination: { ...options, total, totalPages: Math.ceil(total / options.limit) },
});
