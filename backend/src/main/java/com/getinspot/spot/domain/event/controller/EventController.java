package com.getinspot.spot.domain.event.controller;

import com.getinspot.spot.domain.event.dto.EventCreateRequest;
import com.getinspot.spot.domain.event.dto.EventDetailResponse;
import com.getinspot.spot.domain.event.service.EventService;
import com.getinspot.spot.domain.search.dto.EventListResponse;
import com.getinspot.spot.global.config.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // 행사 등록 API
    @PostMapping
    public ResponseEntity<Long> createEvent(
            @Valid @RequestBody EventCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        Long memberId = customUserDetails.getId();
        Long eventId = eventService.createEvent(request, memberId);

        return ResponseEntity.status(HttpStatus.CREATED).body(eventId);
    }

    // 행사 목록 전체 조회 API
    @GetMapping
    public ResponseEntity<Page<EventListResponse>> getAllEvents(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<EventListResponse> response = eventService.getAllEvents(pageable);
        return ResponseEntity.ok(response);
    }

    // 행사 상세 조회 API
    @GetMapping("/{eventId}")
    public ResponseEntity<EventDetailResponse> getEventDetail(@PathVariable("eventId") Long eventId) {
        // URL에서 전달받은 eventId를 서비스로 넘겨서 상세 정보 조회
        EventDetailResponse response = eventService.getEventDetail(eventId);
        return ResponseEntity.ok(response);
    }
}
