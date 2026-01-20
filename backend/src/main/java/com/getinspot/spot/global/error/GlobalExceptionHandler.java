package com.getinspot.spot.global.error;

import com.getinspot.spot.global.common.response.ApiResponse;
import com.getinspot.spot.global.error.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 직접 던진 에러 처리
    // 예: 중복 이메일, 중복 전화번호
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("BusinessException: {}", e.getMessage());
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(ApiResponse.fail(e.getErrorCode().getMessage()));
    }

    // @Valid 검증 실패 처리
    // DTO에서 어노테이션(@Pattern, @NotNull)으로 검증 실패 시 발생
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String errorMessage = e.getBindingResult().getFieldError().getDefaultMessage();
        log.warn("ValidationFailed: {}", errorMessage);

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.fail(errorMessage));
    }

    // 예상치 못한 모든 에러 (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("UnhandledException: ", e);
        return ResponseEntity
                .internalServerError()
                .body(ApiResponse.fail(ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }
}
