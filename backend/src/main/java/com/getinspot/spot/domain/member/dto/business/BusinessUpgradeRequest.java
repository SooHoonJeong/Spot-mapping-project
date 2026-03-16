package com.getinspot.spot.domain.member.dto.business;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자 접근 제어자를 PROTECTED로 두어 안전성 확보
public class BusinessUpgradeRequest {

    @NotBlank(message = "상호명(법인명)은 필수입니다.")
    private String companyName;

    @NotBlank(message = "사업자등록번호는 필수입니다.")
    // 사업자등록번호는 보통 10자리 숫자이므로, 하이픈 없이 10자리 숫자만 받도록 정규식 설정
    @Pattern(regexp = "^\\d{10}$", message = "사업자등록번호는 하이픈(-) 없이 10자리 숫자로 입력해야 합니다.")
    private String businessNumber;

    @NotBlank(message = "우편번호는 필수입니다.")
    private String zipcode;

    @NotBlank(message = "사업장 주소는 필수입니다.")
    private String address;

    @NotBlank(message = "상세주소는 필수입니다.")
    private String detailAddress;
}
