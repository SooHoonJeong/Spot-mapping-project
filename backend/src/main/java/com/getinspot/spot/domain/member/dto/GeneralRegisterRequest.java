package com.getinspot.spot.domain.member.dto;

import com.getinspot.spot.domain.member.entity.Gender;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GeneralRegisterRequest {

    @NotBlank(message = "이메일은 필수입니다.")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Pattern(regexp = "^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\])|(?=.*[a-z])(?=.*\\d)(?=.*[!\"#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\])|(?=.*[A-Z])(?=.*\\d)(?=.*[!\"#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\]))[A-Za-z\\d!\"#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\]{8,}$",
            message = "비밀번호는 8자 이상이며, 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.")
    private String password;

    @NotNull(message = "성별은 필수입니다.")
    private Gender gender;

    @NotBlank(message = "이름은 필수입니다.")
    private String username;

    @NotBlank(message = "닉네임은 필수입니다.")
    private String nickname;

    @NotBlank(message = "생년월일은 필수입니다.")
    @Pattern(regexp = "^\\d{8}$", message = "생년월일은 하이픈(-) 없이 8자리 숫자로 입력해야 합니다. (예: 20001010)")
    private String birthDate;

    @NotBlank(message = "핸드폰 번호는 필수입니다.")
    @Pattern(regexp = "^010\\d{8}$", message = "핸드폰 번호는 하이픈(-) 없이 숫자로 입력해야 합니다. (01012345678)")
    private String phoneNumber;

    @AssertTrue(message = "약관 동의는 필수입니다.")
    private Boolean agreedToTerms;
    @NotNull(message = "마케팅 수신 동의 여부는 필수입니다.")
    private Boolean agreedToMarketing;
}
