package com.getinspot.spot.domain.member.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    @JsonIgnore // JSON Body 응답에서는 제외
    private String refreshToken;
}
