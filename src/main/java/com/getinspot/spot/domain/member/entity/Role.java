package com.getinspot.spot.domain.member.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {

    GENERAL("ROLE_GENERAL", "일반 사용자"),
    BUSINESS("ROLE_BUSINESS", "사업자"),
    ADMIN("ROLE_ADMIN", "관리자");

    private final String key;
    private final String title;
}
