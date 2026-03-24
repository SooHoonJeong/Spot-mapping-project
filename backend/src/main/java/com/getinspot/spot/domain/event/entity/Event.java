package com.getinspot.spot.domain.event.entity;

import com.getinspot.spot.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;           // 팝업 행사명

    @Column(columnDefinition = "TEXT")
    private String description;    // 행사 상세 설명

    @Column(nullable = false)
    private String location;       // 오프라인 주소 또는 장소명

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    private LocalDate startDate;   // 시작일
    private LocalDate endDate;     // 종료일
}
