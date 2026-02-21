package com.getinspot.spot.domain.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordResetRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String resetToken;

    @NotBlank
    @Pattern(regexp = "^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\])|(?=.*[a-z])(?=.*\\d)(?=.*[!\"#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\])|(?=.*[A-Z])(?=.*\\d)(?=.*[!\"#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\]))[A-Za-z\\d!\"#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\]{8,}$",
            message = "비밀번호는 8자 이상이며, 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.")
    private String newPassword;
}
