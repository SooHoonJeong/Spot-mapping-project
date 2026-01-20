package com.getinspot.spot.domain.member.repository;

import com.getinspot.spot.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}
