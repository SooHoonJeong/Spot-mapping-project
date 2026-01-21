package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.domain.member.dto.TokenResponse;
import com.getinspot.spot.domain.member.dto.LoginRequest;
import com.getinspot.spot.global.common.service.RedisService;
import com.getinspot.spot.global.error.ErrorCode; // [추가]
import com.getinspot.spot.global.error.exception.BusinessException; // [추가]
import com.getinspot.spot.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException; // [추가]
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final JwtTokenProvider tokenProvider;
    private final RedisService redisService;

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
}