package com.getinspot.spot.global.jwt;

import com.getinspot.spot.domain.member.dto.TokenResponse;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final String AUTHORITIES_KEY = "auth";

    private final Key key;
    private final long accessTokenExpireMs;
    private final long refreshTokenExpireMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expire-ms}") long accessTokenExpireMs,
            @Value("${jwt.refresh-token-expire-ms}") long refreshTokenExpireMs
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpireMs = accessTokenExpireMs;
        this.refreshTokenExpireMs = refreshTokenExpireMs;
    }

    /**
     * 토큰 생성 (Access + Refresh)
     */
    public TokenResponse generateToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = System.currentTimeMillis();

        Date accessTokenExpiresAt = new Date(now + accessTokenExpireMs);
        String accessToken = Jwts.builder()
                .setSubject(authentication.getName())
                .claim(AUTHORITIES_KEY, authorities)
                .setIssuedAt(new Date(now))
                .setExpiration(accessTokenExpiresAt)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

        // Refresh Token (권한 정보 제거)
        Date refreshTokenExpiresAt = new Date(now + refreshTokenExpireMs);
        String refreshToken = Jwts.builder()
                .setSubject(authentication.getName())
                .setIssuedAt(new Date(now))
                .setExpiration(refreshTokenExpiresAt)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * 토큰 → Authentication 변환
     */
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);

        String authClaim = claims.get(AUTHORITIES_KEY, String.class);
        if (authClaim == null) {
            throw new JwtException("권한 정보가 없는 토큰입니다.");
        }

        // 권한 문자열을 객체로 변환(예: ROLE_USER,ROLE_ADMIN)
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(authClaim.split(","))
                        .map(SimpleGrantedAuthority::new)
                        .toList();

        UserDetails principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰");
        } catch (SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 비어있음");
        }
        return false;
    }

    /**
     * Claims 파싱 (만료 토큰 허용)
     */
    private Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    //
    public String getUserEmail(String token) {
        return parseClaims(token).getSubject();
    }
}