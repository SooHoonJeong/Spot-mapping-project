package com.getinspot.spot.domain.member.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ImageTargetType {

    MEMBER("회원 프로필 이미지"),
    POPUP_EVENT("오프라인 팝업 행사 포스터 및 상세 이미지"),
    REVIEW("행사 리뷰 첨부 이미지");

    private final String description;
}