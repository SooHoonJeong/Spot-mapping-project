package com.getinspot.spot.domain.member.dto.member;

import com.getinspot.spot.domain.member.entity.Member;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class MemberProfileResponse {
    private Long id;
    private String email;
    private String nickname;
    private String username;
    private String phoneNumber;
    private String profileImageUrl; // 서비스 로직에서 기본 이미지 처리가 완료된 주소
    private String role;

    public static MemberProfileResponse of(Member member, String profileImageUrl) {
        return MemberProfileResponse.builder()
                .id(member.getId())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .username(member.getUsername())
                .phoneNumber(member.getPhoneNumber())
                .profileImageUrl(profileImageUrl)
                .role(member.getRole().name())
                .build();
    }
}
