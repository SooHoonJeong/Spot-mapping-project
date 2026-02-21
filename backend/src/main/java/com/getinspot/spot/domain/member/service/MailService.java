package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.global.common.service.RedisService;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.time.Year;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
    private final RedisService redisService;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public String sendEmail(String toEmail, String subject, String title, String content) {
        String verificationCode = createCode();
        String htmlContent = createEmailHtml(title, content, verificationCode);

        try {
            MimeMessage message = createEmailForm(toEmail, subject, htmlContent);
            javaMailSender.send(message);
            log.info("메일 전송 성공 - email: {}, code: {}", toEmail, verificationCode);

            return verificationCode;
        } catch (Exception e) {
            log.error("이메일 전송 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    private MimeMessage createEmailForm(String email, String subject, String text)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(senderEmail, "GetinSpot");

        helper.setTo(email);
        helper.setSubject(subject); // 파라미터 사용
        helper.setText(text, true); // 파라미터 사용

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

    public void verifyEmail(String key, String code) {
        log.info("인증 검증 요청 - key: [{}], code: [{}]", key, code);

        String savedCode = redisService.getData(key);
        log.info("Redis 조회 결과 - savedCode: [{}]", savedCode);

        if (savedCode == null) {
            log.warn("인증코드 조회 실패 (Null/만료) - key: [{}]", key);
            throw new BusinessException(ErrorCode.EXPIRED_AUTH_CODE);
        }

        if (!savedCode.equals(code)) {
            log.warn("인증코드 불일치 - key: [{}]", key);
            throw new BusinessException(ErrorCode.INVALID_AUTH_CODE);
        }

        redisService.deleteData(key);
        log.info("인증 성공 및 코드 삭제 - key: [{}]", key);
    }

    private String createEmailHtml(String title, String message, String code) {
        int year = Year.now().getValue();

        return """
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>%s</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: 'Malgun Gothic', 'Dotum', sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="background-color: #f4f5f7; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px; width: 100%%;">
                            <tr>
                                <td align="center" style="padding: 40px 0 20px 0;">
                                    <h1 style="margin: 0; color: #333333; font-size: 24px; font-weight: bold;">GetinSpot</h1>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 0 40px;">
                                    <h2 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 22px; font-weight: bold;">%s</h2>
                                    <p style="margin: 0; color: #666666; font-size: 15px; line-height: 1.6;">
                                        %s
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 30px 40px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                        <tr>
                                            <td align="center" style="background-color: #f8f9fa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 20px 0;">
                                                <span style="display: block; color: #888888; font-size: 12px; margin-bottom: 5px;">인증 번호</span>
                                                <span style="display: block; color: #0056b3; font-size: 32px; font-weight: bold; letter-spacing: 4px;">%s</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 0 40px 40px 40px;">
                                    <p style="margin: 0; color: #888888; font-size: 13px; line-height: 1.5;">
                                        인증 번호는 <strong>5분 이내</strong>에 입력하셔야 합니다.<br>
                                        본인이 요청하지 않은 경우, 이 메일을 무시하셔도 됩니다.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="border-top: 1px solid #eeeeee;"></td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 30px 40px; background-color: #fafafa;">
                                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                        본 메일은 발신 전용이며 회신되지 않습니다.
                                    </p>
                                    <p style="margin: 0; color: #bbbbbb; font-size: 11px;">
                                        © %d GetinSpot. All Rights Reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """.formatted(title, title, message, code, year);
    }
}
