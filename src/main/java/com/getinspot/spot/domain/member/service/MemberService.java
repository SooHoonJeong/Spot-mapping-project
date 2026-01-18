package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.domain.member.dto.GeneralRegisterRequest;
import com.getinspot.spot.domain.member.entity.Gender;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
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

    // 일반 사용자의 회원가입 로직
    @Transactional
    public void registerGeneral(GeneralRegisterRequest request) {
        log.info("일반 회원가입 요청 - email: {}", request.getEmail());

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
                request.getUsername(),
                request.getNickname(),
                request.getBirthDate(),
                request.getPhoneNumber(),
                request.getAgreedToTerms(),
                request.getAgreedToMarketing(),
                request.getGender()
        );

        memberRepository.save(member);
    }


}
