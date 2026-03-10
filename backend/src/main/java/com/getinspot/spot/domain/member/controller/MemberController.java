package com.getinspot.spot.domain.member.controller;

import com.getinspot.spot.domain.member.dto.member.MemberProfileResponse;
import com.getinspot.spot.domain.member.service.MemberService;
import com.getinspot.spot.global.config.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public ResponseEntity<MemberProfileResponse> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        MemberProfileResponse response = memberService.getMyProfile(userDetails.getId());
        return ResponseEntity.ok(response);
    }
}
