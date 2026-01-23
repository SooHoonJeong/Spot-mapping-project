package com.getinspot.spot.global.common.response;

import lombok.Getter;

@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;

    private ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    // 성공 응답 (data가 있을 경우)
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse(true, "요청에 성공하였습니다.", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse(true, message, data);
    }

    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse(false, message, null);
    }
}
