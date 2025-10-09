export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export interface ApiError {
    message: string;
    status: number;
    timestamp: string;
    details?: string;
}