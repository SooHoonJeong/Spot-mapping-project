package com.getinspot.spot.global.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;

    /**
     * 데이터 저장 (만료시간 설정)
     * @param key      저장할 키 (예: 이메일)
     * @param value    저장할 값 (예: 인증번호)
     * @param duration 만료 시간 (초 단위)
     */
    public void setDataExpire(String key, String value, long duration) {
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(duration));
    }

    /**
     * 데이터 조회
     * @param key 조회할 키
     * @return 저장된 값 (없으면 null 반환)
     */
    public String getData(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * 키 존재 여부 확인
     */
    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * 데이터 삭제
     * @param key 삭제할 키
     * (인증이 완료된 후 데이터를 지울 때 사용)
     */
    public void deleteData(String key) {
        redisTemplate.delete(key);
    }
}
