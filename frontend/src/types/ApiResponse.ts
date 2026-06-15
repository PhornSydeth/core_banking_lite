export interface ApiFieldError {
    field: string;
    message: string;
    rejectedValue: any;
}

export interface ApiResponse<T = any> {
    success: boolean;
    code: number;
    message: string;
    data?: T;
    timestamp: string;
    traceId?: string;
    fieldErrors?: ApiFieldError[];
}
