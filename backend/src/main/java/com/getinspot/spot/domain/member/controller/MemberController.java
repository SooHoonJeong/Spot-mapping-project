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

    // 내 프로필 조회 (네이버 스타일 UI용 데이터 응답)
    @GetMapping("/me")
    public ResponseEntity<MemberProfileResponse> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // 토큰에서 추출한 id를 사용해 서비스 호출
        MemberProfileResponse response = memberService.getMyProfile(userDetails.getId());
        return ResponseEntity.ok(response);
    }
}
