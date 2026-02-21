package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import com.getinspot.spot.global.error.ErrorCode;
import com.getinspot.spot.global.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) {
        return memberRepository.findByEmail(email)
                .map(this::createUserDetails)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
    }

    private UserDetails createUserDetails(Member member) {
        return new User(
                member.getEmail(),
                member.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority(member.getRole().toString()))
        );
    }
}
