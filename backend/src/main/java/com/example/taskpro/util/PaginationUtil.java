package com.example.taskpro.util;

import org.springframework.data.domain.Page;

public class PaginationUtil {
    public static <T> PageResponse<T> buildPageResponse(Page<T> page) {
        return new PageResponse<T>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
