package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.domain.member.dto.EmailSendResponse;
import com.getinspot.spot.global.common.service.RedisService;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
    private final RedisService redisService;

    private static final long EXPIRE_TIME = 300; // 5분

    public EmailSendResponse sendEmail(String email) {
        String code = createCode();
        try {
            MimeMessage message = createEmailForm(email, code);
            javaMailSender.send(message);
        } catch (MessagingException e) {
            log.error("이메일 전송 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        redisService.setDataExpire(email, code, EXPIRE_TIME);
        log.info("인증번호 발송 - email: {}, code: {}", email, code);

        LocalDateTime now = LocalDateTime.now();
        return EmailSendResponse.builder()
                .sentAt(now)
                .expireAt(now.plusSeconds(EXPIRE_TIME))
                .build();
    }

    private MimeMessage createEmailForm(String email, String code) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(email);
        helper.setSubject("[GetInSpot] 이메일 인증번호입니다.");

        String text = "<h1>이메일 인증</h1>" +
                "<br/>" +
                "<p>아래 인증번호를 입력해주세요.</p>" +
                "<h3> CODE : " + code + "</h3>" +
                "<br/>" +
                "<p>이 인증번호는 5분간 유효합니다.</p>";

        helper.setText(text, true);

        return message;
    }

    private String createCode() {
        Random random = new Random();
        StringBuilder key = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            int index = random.nextInt(3);
            switch (index) {
                case 0 -> key.append((char) ((int) random.nextInt(26) + 97));
                case 1 -> key.append((char) ((int) random.nextInt(26) + 65));
                case 2 -> key.append(random.nextInt(10));
            }
        }
        return key.toString();
    }

    public void verifyEmail(String email, String code) {
        log.info("이메일 인증 검증 요청 - email: [{}], code: [{}]", email, code);

        String redisAuthCode = redisService.getData(email);
        log.info("Redis 조회 결과 - email: [{}], savedCode: [{}]", email, redisAuthCode);

        if (redisAuthCode == null) {
            log.warn("인증코드 조회 실패 (Null) - email: [{}]", email);
            throw new BusinessException(ErrorCode.EXPIRED_AUTH_CODE);
        }

        if (!redisAuthCode.equals(code)) {
            log.warn("인증코드 불일치 - email: [{}], input: [{}], saved: [{}]", email, code, redisAuthCode);
            throw new BusinessException(ErrorCode.INVALID_AUTH_CODE);
        }

        redisService.setDataExpire(email, "VERIFIED", 1800); // 30분
        log.info("이메일 인증 성공 및 상태 변경(VERIFIED) - email: [{}]", email);
    }
}
