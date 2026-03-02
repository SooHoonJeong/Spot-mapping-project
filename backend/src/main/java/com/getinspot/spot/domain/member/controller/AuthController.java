package com.getinspot.spot.domain.member.controller;

import com.getinspot.spot.domain.member.dto.*;
import com.getinspot.spot.domain.member.service.AuthService;
import com.getinspot.spot.domain.member.service.MemberService;
import com.getinspot.spot.global.common.response.ApiResponse;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final MemberService memberService;

    // 일반 사용자 회원가입
    @PostMapping("/register/general")
    public ResponseEntity<String> registerGeneral(@Valid @RequestBody GeneralRegisterRequest request) {
        memberService.registerGeneral(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

//    [사업자 회원가입 폐기 예정]
//    @PostMapping("/register/business")
//    public ResponseEntity<String> registerBusiness(@Valid @RequestBody BusinessRegisterRequest request) {
//        memberService.registerBusiness(request);
//        return ResponseEntity.status(HttpStatus.CREATED).build();
//    }

    // 회원가입 인증번호 이메일 발송
    @PostMapping("/email/send")
    public ResponseEntity<ApiResponse<EmailSendResponse>> sendEmail(@Valid @RequestBody EmailRequest request) {
        EmailSendResponse response = authService.sendSignupCode(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("인증번호가 이메일로 발송되었습니다.", response));
    }

    // 회원가입 인증번호 검증
    @PostMapping("/email/verify")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody CodeVerificationRequest request) {
        authService.verifySignup(request.getEmail(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("이메일 인증이 완료되었습니다.", null));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                .path("/")
                .httpOnly(true)
                .secure(false)          // HTTPS에서만 전송 (로컬 http 테스트 시 false로 변경)
                .sameSite("None")       // 크로스 사이트 요청 허용 (secure(true)와 세트)
                .maxAge(7 * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(ApiResponse.success("로그인에 성공했습니다." ,response));
    }

    // 토큰 재발급
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

    // 아이디 찾기
    @PostMapping("/find-id")
    public ResponseEntity<ApiResponse<FindEmailResponse>> findEmail(@Valid @RequestBody FindEmailRequest request) {
        FindEmailResponse response = memberService.findEmail(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 비밀번호 재설정 인증번호 이메일 발송
    @PostMapping("/password/send")
    public ResponseEntity<ApiResponse<Void>> sendPasswordResetCode(@Valid @RequestBody PasswordResetCodeRequest request) {
        authService.sendPasswordResetCode(request);
        return ResponseEntity.ok(ApiResponse.success("인증코드가 이메일로 발송되었습니다.",null));
    }

    // 비밀번호 재설정 인증번호 검증 및 자격부여
    @PostMapping("/password/verify-code")
    public ResponseEntity<ApiResponse<String>> verifyCode(@Valid @RequestBody CodeVerificationRequest request) {
        String resetToken = authService.verifyPasswordResetCode(request);
        return ResponseEntity.ok(ApiResponse.success(resetToken));
    }

    // 비밀번호 재설정
    @PostMapping("/password/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
