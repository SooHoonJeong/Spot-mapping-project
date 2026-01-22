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

        // 중요: 우리는 Refresh Token Rotation(RTR)을 안 하고 기존 걸 유지할 것이므로
        // DTO에 새 AccessToken만 담아서 리턴하면 됨.
        // (참고: tokenProvider가 매번 RefreshToken도 새로 찍어내긴 할 텐데,
        //  DB/Redis 업데이트 안 하고 그냥 버리면 기존 것 유지됨)

        return TokenResponse.builder()
                .accessToken(tokenDto.getAccessToken())
                .refreshToken(null) // 쿠키 업데이트 안 함
                .build();
    }
}