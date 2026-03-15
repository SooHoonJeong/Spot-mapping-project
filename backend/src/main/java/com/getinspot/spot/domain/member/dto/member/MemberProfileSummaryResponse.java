package com.getinspot.spot.domain.member.dto.member;

import com.getinspot.spot.domain.member.entity.Member;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class MemberProfileSummaryResponse {
    private Long id;
    private String email;
    private String nickname;
    private String profileImageUrl;

    public static MemberProfileSummaryResponse of(Member member, String profileImageUrl) {
        return MemberProfileSummaryResponse.builder()
                .id(member.getId())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .profileImageUrl(profileImageUrl)
                .build();
    }
}
