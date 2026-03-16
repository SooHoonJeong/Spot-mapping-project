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
@Table(name = "business_info")
public class BusinessInfo extends BaseTimeEntity {

    @Id
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false, unique = true)
    private String businessNumber;

    @Column(nullable = false)
    private String zipcode;

    @Convert(converter = EncryptConverter.class)
    @Column(nullable = false)
    private String address;

    @Convert(converter = EncryptConverter.class)
    @Column(nullable = false)
    private String detailAddress;

    @Builder
    private BusinessInfo(Member member, String companyName, String businessNumber,
                         String zipcode, String address, String detailAddress) {
        this.member = member;
        this.companyName = companyName;
        this.businessNumber = businessNumber;
        this.zipcode = zipcode;
        this.address = address;
        this.detailAddress = detailAddress;
    }

    public static BusinessInfo create(Member member, String companyName, String businessNumber,
                                      String zipcode, String address, String detailAddress) {
        return BusinessInfo.builder()
                .member(member)
                .companyName(companyName)
                .businessNumber(businessNumber)
                .zipcode(zipcode)
                .address(address)
                .detailAddress(detailAddress)
                .build();
    }
}
