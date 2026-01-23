package com.getinspot.spot.domain.member.controller;

import com.getinspot.spot.domain.member.dto.*;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
import org.springframework.web.bind.annotation.CookieValue;
import com.getinspot.spot.domain.member.service.AuthService;
import com.getinspot.spot.domain.member.service.MailService;
import com.getinspot.spot.domain.member.service.MemberService;
import com.getinspot.spot.global.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final MemberService memberService;
    private final MailService mailService;

    @PostMapping("/register/general")
    public ResponseEntity<String> registerGeneral(@Valid @RequestBody GeneralRegisterRequest request) {
        memberService.registerGeneral(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/register/business")
    public ResponseEntity<String> registerBusiness(@Valid @RequestBody BusinessRegisterRequest request) {
        memberService.registerBusiness(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/email/send")
    public ResponseEntity<ApiResponse<EmailSendResponse>> sendEmail(@Valid @RequestBody EmailRequest request) {
        EmailSendResponse response = mailService.sendEmail(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("인증번호가 이메일로 발송되었습니다.", response));
    }

    @PostMapping("/email/verify")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody CodeVerificationRequest request) {
        mailService.verifyEmail(request.getEmail(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("이메일 인증이 완료되었습니다.", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                .path("/")
                .httpOnly(true)
                .secure(false)          // HTTPS에서만 전송 (로컬 http 테스트 시 false로 변경)
                .sameSite("None")      // 크로스 사이트 요청 허용 (secure(true)와 세트)
                .maxAge(7 * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(ApiResponse.success("로그인에 성공했습니다." ,response));
    }

    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<TokenResponse>> reissue(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        // 쿠키에 토큰이 없을 경우 예외 처리
        if (refreshToken == null) {
            // 혹은 커스텀 예외 (ex: REFRESH_TOKEN_NOT_FOUND)
            throw new BusinessException(ErrorCode.INVALID_AUTH_CODE);
        }

        TokenResponse response = authService.reissue(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/find-id")
    public ResponseEntity<ApiResponse<FindEmailResponse>> findEmail(@Valid @RequestBody FindEmailRequest request) {
        FindEmailResponse response = memberService.findEmail(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/password/send")
    public ResponseEntity<ApiResponse<Void>> sendPasswordResetCode(@Valid @RequestBody PasswordResetCodeRequest request) {
        authService.sendPasswordResetCode(request);
        return ResponseEntity.ok(ApiResponse.success("인증코드가 이메일로 발송되었습니다.",null));
    }

    @PostMapping("/password/verify-code")
    public ResponseEntity<ApiResponse<String>> verifyCode(@Valid @RequestBody CodeVerificationRequest request) {
        String resetToken = authService.verifyCode(request);
        return ResponseEntity.ok(ApiResponse.success(resetToken));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
