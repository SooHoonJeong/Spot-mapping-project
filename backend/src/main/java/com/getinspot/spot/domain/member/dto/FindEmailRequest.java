package com.getinspot.spot.domain.member.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FindEmailRequest {

    @NotBlank(message = "이름을 입력해주세요.")
    private String username;

    @NotBlank(message = "휴대폰 번호를 입력해주세요.")
    private String phoneNumber;
}

