package com.getinspot.spot.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 BAD_REQUEST: 잘못된 요청
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),

    // 409 CONFLICT: 중복 리소스
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    DUPLICATE_PHONE_NUMBER(HttpStatus.CONFLICT, "이미 사용 중인 핸드폰번호입니다."),

    // 500 INTERNAL_SERVER_ERROR: 서버 에러
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 에러가 발생했습니다.");

    private final HttpStatus status;
    private final String message;
}
