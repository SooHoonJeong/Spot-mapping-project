package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.domain.member.dto.business.BusinessUpgradeRequest;
import com.getinspot.spot.domain.member.dto.member.FindEmailRequest;
import com.getinspot.spot.domain.member.dto.member.FindEmailResponse;
import com.getinspot.spot.domain.member.dto.member.GeneralRegisterRequest;
import com.getinspot.spot.domain.member.dto.member.MemberProfileResponse;
import com.getinspot.spot.domain.member.entity.BusinessInfo;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.entity.Role;
import com.getinspot.spot.domain.member.repository.ImageRepository;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import com.getinspot.spot.global.common.service.RedisService;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
import com.getinspot.spot.global.util.MaskingUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final ImageRepository imageRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisService redisService;

    @Value("${app.default.profile-image}")
    private String defaultProfileImage;

    // 일반 사용자의 회원가입 로직
    @Transactional
    public void registerGeneral(GeneralRegisterRequest request) {
        log.info("일반 회원가입 요청 - email: {}", request.getEmail());

        String isVerified = redisService.getData("SignupCode:Verified:" + request.getEmail());

        if (isVerified == null || !"VERIFIED".equals(isVerified)) {
            throw new BusinessException(ErrorCode.UNVERIFIED_EMAIL); // "이메일 인증이 필요합니다"
        }

        // 이메일 중복 체크
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 핸드폰 번호 중복 체크
        if (memberRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BusinessException(ErrorCode.DUPLICATE_PHONE_NUMBER);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        Member member = Member.createMember(
                request.getEmail(),
                encodedPassword,
                request.getGender(),
                request.getUsername(),
                request.getNickname(),
                request.getBirthDate(),
                request.getPhoneNumber(),
                request.getAgreedToTerms(),
                request.getAgreedToMarketing()
        );

        memberRepository.save(member);
        redisService.deleteData("SignupCode:Verified:" + request.getEmail());
    }

//    [사업자 회원가입 폐기 예정]
//    @Transactional
//    public void registerBusiness(BusinessRegisterRequest request) {
//        log.info("사업자 회원가입 요청 - email: {}", request.getEmail());
//
//        String isVerified = redisService.getData("SignupCode:Verified:" + request.getEmail());
//
//        if (isVerified == null || !"VERIFIED".equals(isVerified)) {
//            throw new BusinessException(ErrorCode.UNVERIFIED_EMAIL); // "이메일 인증이 필요합니다"
//        }
//
//        // 이메일 중복 체크
//        if(memberRepository.existsByEmail(request.getEmail())) {
//            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
//        }
//
//        // 핸드폰 번호 중복 체크
//        if (memberRepository.existsByPhoneNumber(request.getPhoneNumber())) {
//            throw new BusinessException(ErrorCode.DUPLICATE_PHONE_NUMBER);
//        }
//
//        String encodedPassword = passwordEncoder.encode(request.getPassword());
//        Member member = Member.createBusiness(
//                request.getEmail(),
//                encodedPassword,
//                request.getGender(),
//                request.getUsername(),
//                request.getNickname(),
//                request.getZipcode(),
//                request.getAddress(),
//                request.getDetailAddress(),
//                request.getBirthDate(),
//                request.getPhoneNumber(),
//                request.getAgreedToTerms(),
//                request.getAgreedToMarketing()
//        );
//
//        memberRepository.save(member);
//        redisService.deleteData("SignupCode:Verified:" + request.getEmail());
//    }


    // 아이디 찾기
    @Transactional(readOnly = true)
    public FindEmailResponse findEmail(FindEmailRequest request) {
        String maskedName = MaskingUtil.maskName(request.getUsername());
        String maskedPhone = MaskingUtil.maskPhone(request.getPhoneNumber());

        log.info("아이디 찾기 요청 - 이름: [{}], 휴대폰번호: [{}]", maskedName, maskedPhone);

        Member member = memberRepository.findByUsernameAndPhoneNumber(request.getUsername(), request.getPhoneNumber())
                .orElseThrow(() -> {
                    log.warn("아이디 찾기 실패 (정보 불일치) - 이름: [{}], 휴대폰번호: [{}]", maskedName, maskedPhone);
                    return new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
                });

        String maskedEmail = MaskingUtil.maskEmail(member.getEmail());

        log.info("아이디 찾기 성공 - 조회된 이메일(마스킹): [{}]", maskedEmail);

        return new FindEmailResponse(maskedEmail);
    }

    // 사업자로 권한 업그레이드
    @Transactional
    public void upgradeToBusinessRole(Long memberId, BusinessUpgradeRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (member.getRole() == Role.BUSINESS) {
            throw new IllegalStateException("이미 사업자 권한을 가진 회원입니다.");
        }

        BusinessInfo businessInfo = BusinessInfo.create(
                member,
                request.getCompanyName(),
                request.getBusinessNumber(),
                request.getZipcode(),
                request.getAddress(),
                request.getDetailAddress()
        );

        member.upgradeToBusiness(businessInfo);
    }

    // 내프로필 조회
    @Transactional(readOnly = true)
    public MemberProfileResponse getMyProfile(Long memberId) {
        // 1. 회원 정보 조회 (오른쪽 정보 구역용)
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // 2. 이미지 조회 (왼쪽 이미지 구역용)
        // target_id와 target_type 인덱스를 활용해 빠르게 검색
        String profileImageUrl = imageRepository.findByTargetIdAndTargetType(memberId, "MEMBER")
                .map(image -> image.getFilePath()) // 직접 등록한 사진이 있으면 그 경로 사용
                .orElse(defaultProfileImage);    // 없으면 기본 이미지 경로 반환

        // 3. 네이버 프로필 UI에 필요한 모든 데이터를 DTO에 담아 반환
        return MemberProfileResponse.of(member, profileImageUrl);
    }
}
