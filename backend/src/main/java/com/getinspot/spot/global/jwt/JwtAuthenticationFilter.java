package com.getinspot.spot.global.jwt;

import com.getinspot.spot.domain.member.service.CustomUserDetailsService;
import com.getinspot.spot.global.config.security.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenProvider tokenProvider;

    // 실제 필터링 로직은 여기서 수행됩니다.
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Request Header 에서 토큰을 꺼내기
        String token = resolveToken(request);

        // 토큰이 존재하고(hasText), 유효하다면(validateToken)
        if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {

            String email = tokenProvider.getUserEmail(token);
            log.info("토큰 검증 성공 - 이메일: {}", email); // 로그 추가

            try {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                log.info("사용자 조회 성공 - ID: {}", ((CustomUserDetails) userDetails).getId()); // 로그 추가

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("SecurityContext에 인증 정보 저장 완료"); // 로그 추가
            } catch (Exception e) {
                log.error("인증 객체 생성 중 에러 발생: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    // Request Header 에서 토큰 정보를 꺼내오는 메소드
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {

            return bearerToken.substring(7);
        }
        return null;
    }
}
