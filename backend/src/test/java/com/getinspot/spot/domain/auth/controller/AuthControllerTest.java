package com.getinspot.spot.domain.auth.controller;

import com.getinspot.spot.domain.member.controller.AuthController;
import com.getinspot.spot.domain.member.dto.auth.TokenResponse;
import com.getinspot.spot.domain.member.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// 1. @WebMvcTest: 스프링의 모든 걸 띄우지 않고, Controller, Filter 등 웹 계층만 딱 잘라서 가볍게 띄웁니다.
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    // 2. MockMvc: 가짜로 HTTP 요청(GET, POST 등)을 보내고 응답을 받을 수 있게 해주는 도우미 객체입니다.
    @Autowired
    private MockMvc mockMvc;

    // 3. @MockBean: @WebMvcTest는 Service 빈(Bean)을 로드하지 않기 때문에,
    // 스프링 컨텍스트 안에 가짜 Service 빈을 만들어서 넣어줍니다.
    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("토큰 재발급 API 호출 성공")
    // 4. @WithMockUser: Spring Security가 적용되어 있으면 로그인한 유저만 접근 가능하므로,
    // 테스트용 임시 가짜 유저를 세팅해 주어 401 권한 에러를 우회합니다.
    @WithMockUser
    void reissue_api_success() throws Exception {
        // [ GIVEN ]
        String refreshToken = "valid_refresh_token_string";

        // Service가 뱉어낼 가짜 응답 데이터
        TokenResponse tokenResponse = TokenResponse.builder()
                .accessToken("new_access_token_string")
                .refreshToken(null)
                .build();

        // 가짜 Service에게 대본을 줍니다. "저 토큰 들어오면 이거 반환해!"
        given(authService.reissue(refreshToken)).willReturn(tokenResponse);

        // [ WHEN & THEN ]
        // mockMvc.perform(): 실제 프론트엔드처럼 가짜 HTTP 요청을 쏩니다.
        mockMvc.perform(post("/api/auth/reissue") // POST 메서드로 해당 URL에 요청
                        .header("Refresh-Token", refreshToken) // 헤더에 토큰 첨부
                        .with(csrf())) // 시큐리티 설정 때문에 POST 요청 시 CSRF 토큰 우회가 필요할 때 사용
                // andExpect(): 돌아온 HTTP 응답을 검증합니다.
                .andExpect(status().isOk()) // HTTP 상태 코드가 200(OK) 인가?
                // jsonPath(): JSON 응답 데이터 안의 값을 검사합니다.
                // $.accessToken 은 응답 JSON의 accessToken 필드를 의미합니다.
                .andExpect(jsonPath("$.accessToken").value("new_access_token_string"));
    }
}
