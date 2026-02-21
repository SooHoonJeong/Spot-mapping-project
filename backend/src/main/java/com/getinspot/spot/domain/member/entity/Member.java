package com.getinspot.spot.domain.member.entity;

import com.getinspot.spot.global.common.converter.EncryptConverter;
import com.getinspot.spot.global.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "member")
public class Member extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // 단방향 암호화
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Convert(converter = EncryptConverter.class)
    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String nickname;

    @Convert(converter = EncryptConverter.class)
    @Column(nullable = false)
    private String birthDate;

    @Column(nullable = true)
    private String zipcode;

    @Convert(converter = EncryptConverter.class)
    @Column(nullable = true)
    private String address;

    @Convert(converter = EncryptConverter.class)
    @Column(nullable = true)
    private String detailAddress;

    @Convert(converter = EncryptConverter.class)
    @Column(nullable = false, unique = true)
    private String phoneNumber;

    @Column(nullable = false)
    private Boolean agreedToTerms;

    @Column(nullable = false)
    private Boolean agreedToMarketing;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder
    private Member(String email, String password, String username, String nickname,
                   String birthDate, String phoneNumber, String zipcode,
                   String address, String detailAddress,
                   Boolean agreedToTerms, Boolean agreedToMarketing,
                   Gender gender, Role role) {
        this.email = email;
        this.password = password;
        this.username = username;
        this.nickname = nickname;
        this.birthDate = birthDate;
        this.phoneNumber = phoneNumber;
        this.zipcode = zipcode;
        this.address = address;
        this.detailAddress = detailAddress;
        this.agreedToTerms = agreedToTerms;
        this.agreedToMarketing = agreedToMarketing;
        this.gender = gender;
        this.role = role;
    }

    // 일반 사용자
    public static Member createGeneral(
            String email,
            String encodedPassword,
            Gender gender,
            String username,
            String nickname,
            String birthDate,
            String phoneNumber,
            Boolean agreedToTerms,
            Boolean agreedToMarketing
    ) {
        return Member.builder()
                .email(email)
                .password(encodedPassword)
                .username(username)
                .nickname(nickname)
                .birthDate(birthDate)
                .phoneNumber(phoneNumber)
                .agreedToTerms(agreedToTerms)
                .agreedToMarketing(agreedToMarketing)
                .gender(gender)
                .role(Role.GENERAL)
                .build();
    }

    // 사업자
    public static Member createBusiness(
            String email,
            String encodedPassword,
            Gender gender,
            String username,
            String nickname,
            String zipcode,
            String address,
            String detailAddress,
            String birthDate,
            String phoneNumber,
            Boolean agreedToTerms,
            Boolean agreedToMarketing
    ) {
        return Member.builder()
                .email(email)
                .password(encodedPassword)
                .username(username)
                .nickname(nickname)
                .zipcode(zipcode)
                .address(address)
                .detailAddress(detailAddress)
                .birthDate(birthDate)
                .phoneNumber(phoneNumber)
                .agreedToTerms(agreedToTerms)
                .agreedToMarketing(agreedToMarketing)
                .gender(gender)
                .role(Role.GENERAL)
                .build();
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
