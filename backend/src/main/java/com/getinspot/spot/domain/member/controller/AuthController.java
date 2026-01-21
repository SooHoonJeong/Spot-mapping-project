package com.getinspot.spot.domain.member.controller;

import com.getinspot.spot.domain.member.dto.*;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.service.MailService;
import com.getinspot.spot.domain.member.service.MemberService;
import com.getinspot.spot.global.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberService memberService;
    private final MailService mailService;

    @PostMapping("/register/general")
    public ResponseEntity<String> register(@Valid @RequestBody GeneralRegisterRequest request) {
        memberService.registerGeneral(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/register/business")
    public ResponseEntity<String> register(@Valid @RequestBody BusinessRegisterRequest request) {
        memberService.registerBusiness(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/email/send")
    public ResponseEntity<ApiResponse<EmailSendResponse>> sendEmail(@Valid @RequestBody EmailRequest request) {
        EmailSendResponse response = mailService.sendEmail(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("인증번호가 이메일로 발송되었습니다.", response));
    }

    @PostMapping("/email/verify")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        mailService.verifyEmail(request.getEmail(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("이메일 인증이 완료되었습니다."));
    }
}
