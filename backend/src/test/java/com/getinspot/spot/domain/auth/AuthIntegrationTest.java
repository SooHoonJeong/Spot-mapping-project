package com.getinspot.spot.domain.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.getinspot.spot.domain.member.entity.Gender;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.entity.Role;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private MemberRepository memberRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private StringRedisTemplate redisTemplate;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @DisplayName("회원가입 전체 시나리오 통합 테스트")
    void register_full_flow_integration() throws Exception {
        String email = "spot_user@test.com";
        String code = "123456";

        // 1. 인증번호 발송 요청 (MailService는 Mocking 처리됨)
        mockMvc.perform(post("/api/auth/email/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isOk());

        // 2. Redis에 코드가 들어갔는지 확인 (서비스 로직 통과를 위해 필요)
        // 실제 발송 로직이 Redis에 넣는 키값 형식을 확인하세요 (예: "AUTH:" + email)
        redisTemplate.opsForValue().set("AUTH:" + email, code, 5, TimeUnit.MINUTES);

        // 3. 인증번호 검증
        mockMvc.perform(post("/api/auth/email/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "code", code))))
                .andExpect(status().isOk());

        // 4. 일반 회원가입 완료
        Map<String, Object> registerRequest = new HashMap<>();
        registerRequest.put("email", email);
        registerRequest.put("password", "password1234!");
        registerRequest.put("nickname", "스팟유저");
        registerRequest.put("gender", "MALE");
        registerRequest.put("birthDate", "20020101");
        registerRequest.put("phoneNumber", "01011112222");

        mockMvc.perform(post("/api/auth/register/general")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        // 5. 최종 검증: DB에 유저가 있고, 권한이 GENERAL인가?
        Member savedMember = memberRepository.findByEmail(email).orElseThrow();
        assertThat(savedMember.getNickname()).isEqualTo("스팟유저");
        assertThat(savedMember.getRole()).isEqualTo(Role.GENERAL);
    }

    @Test
    @DisplayName("로그인 성공 테스트")
    void login_success_integration() throws Exception {
        String email = "test@example.com";
        String password = "password1234";

        memberRepository.save(Member.createMember(
                email, passwordEncoder.encode(password), Gender.MALE, "u1", "n1", "20000101", "010", true, true
        ));

        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", email);
        loginRequest.put("password", password);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").exists());

        assertThat(redisTemplate.opsForValue().get("RT:" + email)).isNotNull();
    }

    @Test
    @DisplayName("로그인 후 쿠키를 사용하여 토큰 재발급 테스트")
    void login_and_reissue_integration() throws Exception {
        // [ GIVEN ]
        String email = "reissue@test.com";
        String password = "password1234";
        memberRepository.save(Member.createMember(
                email, passwordEncoder.encode(password), Gender.MALE, "u2", "n2", "20000101", "010", true, true
        ));

        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", email);
        loginRequest.put("password", password);

        // 1. 로그인하여 쿠키 확보
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie refreshCookie = loginResult.getResponse().getCookie("refreshToken");
        assertThat(refreshCookie).isNotNull();

        // [ WHEN & THEN ]
        // 2. 재발급 요청 시 @CookieValue를 위해 .cookie()를 반드시 추가!
        mockMvc.perform(post("/api/auth/reissue")
                        .cookie(refreshCookie)) // [핵심] 컨트롤러의 @CookieValue와 매핑됨
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").exists());

        redisTemplate.delete("RT:" + email);
    }
}