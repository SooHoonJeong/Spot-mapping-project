package com.getinspot.spot.domain.auth.service;

import com.getinspot.spot.domain.member.dto.auth.TokenResponse;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.entity.Role;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import com.getinspot.spot.domain.member.service.AuthService;
import com.getinspot.spot.global.common.service.RedisService;
import com.getinspot.spot.global.jwt.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

// 1. 스프링 컨텍스트(서버)를 띄우지 않고, Mockito(가짜 객체 생성 라이브러리)만 사용하겠다는 뜻입니다.
// 속도가 매우 빠르고 단위 테스트에 최적화되어 있습니다.
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // 2. @Mock: 진짜 객체 대신 '가짜 객체(껍데기)'를 만듭니다.
    // DB와 연결하거나 복잡한 로직을 수행하지 않고, 우리가 시키는 대로만 대답하는 꼭두각시입니다.
    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private RedisService redisService;

    @Mock
    private MemberRepository memberRepository;

    // 3. @InjectMocks: 테스트의 '진짜 주인공'입니다.
    // 위에서 만든 가짜 객체(@Mock)들을 이 authService 안에 알아서 주입(Inject)해 줍니다.
    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("토큰 재발급 성공 - 정상적인 리프레쉬 토큰이 주어지면 새 액세스 토큰을 반환한다")
    void reissue_success() {
        // ==========================================
        // [ GIVEN: 테스트를 위한 상황과 데이터 준비 ]
        // ==========================================
        String refreshToken = "valid_refresh_token_string";
        String email = "test@example.com";
        String newAccessToken = "new_access_token_string";

        // DB에서 조회될 가짜 회원 데이터
        Member mockMember = Member.builder()
                .email(email)
                .role(Role.GENERAL)
                .build();

        // TokenProvider가 발급해 줄 가짜 토큰 응답 데이터
        TokenResponse mockTokenResponse = TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken("new_refresh_token_but_we_wont_use_it")
                .build();

        // ★ 가장 중요한 부분: 가짜 객체들 훈련시키기 (Stubbing)
        // given(행동).willReturn(결과): "이런 행동을 하면 이런 결과를 뱉어내!" 라고 미리 대본을 짜줍니다.

        // 1) validateToken에 저 토큰이 들어가면 무조건 true를 반환해.
        given(tokenProvider.validateToken(refreshToken)).willReturn(true);

        // 2) getUserEmail에 저 토큰이 들어가면 무조건 저 이메일을 반환해.
        given(tokenProvider.getUserEmail(refreshToken)).willReturn(email);

        // 3) redisService에 키값을 주면 무조건 저 리프레쉬 토큰을 반환해.
        given(redisService.getData("RT:" + email)).willReturn(refreshToken);

        // 4) memberRepository에서 저 이메일로 찾으면 무조건 묶어둔 mockMember를 반환해.
        given(memberRepository.findByEmail(email)).willReturn(Optional.of(mockMember));

        // 5) generateToken에 아무 Authentication 객체나(any) 들어가면 mockTokenResponse를 반환해.
        given(tokenProvider.generateToken(any(Authentication.class))).willReturn(mockTokenResponse);


        // ==========================================
        // [ WHEN: 실제 테스트 대상 로직 실행 ]
        // ==========================================
        // 우리가 짠 대본대로 가짜 객체들이 움직이면서 authService의 로직이 실행됩니다.
        TokenResponse result = authService.reissue(refreshToken);


        // ==========================================
        // [ THEN: 결과가 예상과 맞는지 검증 ]
        // ==========================================
        // 결과값이 null이 아니어야 한다.
        assertNotNull(result);

        // 결과의 Access Token이 우리가 세팅한 newAccessToken과 같아야 한다.
        assertEquals(newAccessToken, result.getAccessToken());

        // 우리가 로직에서 쿠키 업데이트를 막기 위해 null을 넣었으므로, null이어야 한다.
        assertNull(result.getRefreshToken());

        // verify(): 해당 가짜 객체의 특정 메서드가 실제로 1번이라도 호출되었는지 확인합니다.
        // DB 조회가 로직 흐름상 정상적으로 일어났는지 체크하는 용도입니다.
        verify(memberRepository).findByEmail(email);
    }
}
