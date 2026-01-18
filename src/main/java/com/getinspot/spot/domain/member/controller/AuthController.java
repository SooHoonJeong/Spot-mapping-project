package com.getinspot.spot.domain.member.controller;

import com.getinspot.spot.domain.member.dto.GeneralRegisterRequest;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.service.MemberService;
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

    @PostMapping("/register/general")
    public ResponseEntity<String> register(@Valid @RequestBody GeneralRegisterRequest request) {
        memberService.registerGeneral(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
