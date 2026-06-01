// src/dto/common/paginated-dto.ts
export interface PaginatedDto<T> {
    items: T[];
    totalCount: number;
    pageSize: number;
    pageIndex: number;
}
