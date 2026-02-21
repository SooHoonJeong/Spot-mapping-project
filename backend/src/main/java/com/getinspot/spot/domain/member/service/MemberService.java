package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.domain.member.dto.BusinessRegisterRequest;
import com.getinspot.spot.domain.member.dto.FindEmailRequest;
import com.getinspot.spot.domain.member.dto.FindEmailResponse;
import com.getinspot.spot.domain.member.dto.GeneralRegisterRequest;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import com.getinspot.spot.global.common.service.RedisService;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
import com.getinspot.spot.global.util.MaskingUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisService redisService;

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

        Member member = Member.createGeneral(
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

    @Transactional
    public void registerBusiness(BusinessRegisterRequest request) {
        log.info("사업자 회원가입 요청 - email: {}", request.getEmail());

        String isVerified = redisService.getData("SignupCode:Verified:" + request.getEmail());

        if (isVerified == null || !"VERIFIED".equals(isVerified)) {
            throw new BusinessException(ErrorCode.UNVERIFIED_EMAIL); // "이메일 인증이 필요합니다"
        }

        // 이메일 중복 체크
        if(memberRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 핸드폰 번호 중복 체크
        if (memberRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BusinessException(ErrorCode.DUPLICATE_PHONE_NUMBER);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Member member = Member.createBusiness(
                request.getEmail(),
                encodedPassword,
                request.getGender(),
                request.getUsername(),
                request.getNickname(),
                request.getZipcode(),
                request.getAddress(),
                request.getDetailAddress(),
                request.getBirthDate(),
                request.getPhoneNumber(),
                request.getAgreedToTerms(),
                request.getAgreedToMarketing()
        );

        memberRepository.save(member);
        redisService.deleteData("SignupCode:Verified:" + request.getEmail());
    }



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


}
