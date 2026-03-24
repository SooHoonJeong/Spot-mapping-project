package com.getinspot.spot.domain.event.service;

import com.getinspot.spot.domain.event.dto.EventCreateRequest;
import com.getinspot.spot.domain.event.dto.EventDetailResponse;
import com.getinspot.spot.domain.event.entity.Event;
import com.getinspot.spot.domain.event.repository.EventRepository;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import com.getinspot.spot.domain.search.dto.EventListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public Long createEvent(EventCreateRequest request, Long memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .member(member) // ⭐ 핵심: 찾은 멤버를 엔티티에 세팅
                .build();

        return eventRepository.save(event).getId();
    }

    @Transactional(readOnly = true)
    public Page<EventListResponse> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable)
                .map(EventListResponse::from);
    }

    @Transactional(readOnly = true)
    public EventDetailResponse getEventDetail(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("해당 팝업 행사를 찾을 수 없습니다. id=" + eventId));

        return EventDetailResponse.from(event);
    }
}
