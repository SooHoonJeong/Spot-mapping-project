package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.domain.member.dto.*;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import com.getinspot.spot.global.common.service.RedisService;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
import com.getinspot.spot.global.jwt.JwtTokenProvider;
import com.getinspot.spot.global.util.MaskingUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final JwtTokenProvider tokenProvider;
    private final RedisService redisService;
    private final MailService mailService;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    private static final long EMAIL_EXPIRATION = 60 * 3L; // 5분

    // 회원가입 인증코드 이메일 발송
    @Transactional
    public EmailSendResponse sendSignupCode(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        String authCode = mailService.sendEmail(
                email,
                "[GetinSpot] 회원가입 인증번호 안내",
                "이메일 인증 안내",
                "본인 확인을 위해 아래의 인증 번호를 입력해 주세요."
        );

        redisService.setDataExpire("SignupCode:" + email, authCode, EMAIL_EXPIRATION);

        LocalDateTime now = LocalDateTime.now();

        return EmailSendResponse.builder()
                .sentAt(now)
                .expireAt(now.plusSeconds(EMAIL_EXPIRATION))
                .build();
    }

    // 회원가입 인증코드 검증 및 자격부여
    @Transactional
    public void verifySignup(String email, String code) {
        mailService.verifyEmail("SignupCode:" + email, code);

        redisService.setDataExpire("SignupCode:Verified:" + email, "VERIFIED", 1800L);
    }

    // 로그인
    @Transactional
    public TokenResponse login(LoginRequest request) {
        log.info("로그인 시도 - email: [{}]", request.getEmail());

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());

        try {
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            log.info("로그인 정보 검증 성공 - email: [{}]", request.getEmail());

            TokenResponse tokenDto = tokenProvider.generateToken(authentication);

            redisService.setDataExpire("RT:" + authentication.getName(),
                    tokenDto.getRefreshToken(),
                    7 * 24 * 60 * 60L);

            log.info("JWT 토큰 발급 및 Redis 저장 완료 - email: [{}]", request.getEmail());
            return tokenDto;

        } catch (BadCredentialsException e) {
            log.warn("로그인 실패 (비밀번호 불일치) - email: [{}]", request.getEmail());
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
    }

    // 토큰 재발급(accessToken)
    @Transactional
    public TokenResponse reissue(String refreshToken) {
        // Refresh Token 검증 (만료 여부, 위조 여부)
        if (!tokenProvider.validateToken(refreshToken)) {
            log.warn("토큰 재발급 실패: 유효하지 않은 Refresh Token입니다.");
            throw new BusinessException(ErrorCode.EXPIRED_AUTH_CODE); // "다시 로그인하세요" 의미
        }

        // 토큰에서 유저 정보(Email) 추출
        Authentication authentication = tokenProvider.getAuthentication(refreshToken);
        String email = authentication.getName();

        log.info("토큰 재발급 요청 진입 - Email: [{}]", email);

        // Redis에서 해당 유저의 Refresh Token 가져오기
        String redisRefreshToken = redisService.getData("RT:" + email);

        // Redis에 없거나(로그아웃됨), 쿠키의 토큰과 일치하지 않으면 실패
        if (redisRefreshToken == null) {
            log.warn("토큰 재발급 실패: Redis에 저장된 토큰이 없습니다. (만료/로그아웃) - Email: [{}]", email);
            throw new BusinessException(ErrorCode.INVALID_AUTH_CODE);
        }

        if (!redisRefreshToken.equals(refreshToken)) {
            log.warn("토큰 재발급 실패: 토큰 정보가 일치하지 않습니다. (토큰 탈취 의심) - Email: [{}]", email);
            throw new BusinessException(ErrorCode.INVALID_AUTH_CODE);
        }


        TokenResponse tokenDto = tokenProvider.generateToken(authentication);

        log.info("Access Token 재발급 성공 - Email: [{}]", email);

        return TokenResponse.builder()
                .accessToken(tokenDto.getAccessToken())
                .refreshToken(null) // 쿠키 업데이트 안 함
                .build();
    }

    // 비밀번호 재설정 인증코드 발송
    @Transactional
    public void sendPasswordResetCode(PasswordResetCodeRequest request) {
        String maskedEmail = MaskingUtil.maskEmail(request.getEmail());
        String maskedName = MaskingUtil.maskName(request.getUsername());

        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (!member.getUsername().equals(request.getUsername())) {
            log.warn("비밀번호 재설정 요청 실패 (이름 불일치) - Email: [{}], 요청이름: [{}]", maskedEmail, maskedName);
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        String code = mailService.sendEmail(
                request.getEmail(),
                "[GetinSpot] 비밀번호 재설정 인증번호 안내",
                "비밀번호 재설정",
                "아래 인증번호를 입력하여 비밀번호를 재설정해주세요."
                );

        redisService.setDataExpire("ResetCode:" + request.getEmail(), code, EMAIL_EXPIRATION);

        log.info("비밀번호 재설정 코드 발송 완료 - Email: [{}]", maskedEmail);
    }

    // 비밀번호 재설정 인증코드 검증 및 자격부여
    @Transactional
    public String verifyPasswordResetCode(CodeVerificationRequest request) {
        String codeKey = "ResetCode:" + request.getEmail();
        String savedCode = redisService.getData(codeKey);

        if (savedCode == null || !savedCode.equals(request.getCode())) {
            throw new BusinessException(ErrorCode.INVALID_AUTH_CODE);
        }

        String resetToken = UUID.randomUUID().toString();

        redisService.setDataExpire("ResetToken:" + request.getEmail(), resetToken, 60 * 10L);

        redisService.deleteData(codeKey);

        return resetToken;
    }

    // 비밀번호 재설정
    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        String tokenKey = "ResetToken:" + request.getEmail();
        String savedToken = redisService.getData(tokenKey);

        if (savedToken == null || !savedToken.equals(request.getResetToken())) {
            throw new BusinessException(ErrorCode.INVALID_AUTH_CODE);
        }

        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        member.updatePassword(passwordEncoder.encode(request.getNewPassword()));

        // 사용한 토큰 삭제
        redisService.deleteData(tokenKey);

        // 기존 로그인 세션 모두 만료 처리
        redisService.deleteData("RT:" + request.getEmail());
    }
}