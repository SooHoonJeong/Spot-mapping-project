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
    private String profileImageUrl;

    public static MemberProfileResponse of(Member member, String profileImageUrl) {
        return MemberProfileResponse.builder()
                .id(member.getId())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .username(member.getUsername())
                .profileImageUrl(profileImageUrl)
                .build();
    }
}
