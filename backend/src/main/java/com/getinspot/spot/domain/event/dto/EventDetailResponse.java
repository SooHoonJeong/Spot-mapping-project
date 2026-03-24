package com.getinspot.spot.domain.event.dto;

import com.getinspot.spot.domain.event.entity.Event;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class EventDetailResponse {
    private Long eventId;
    private String title;
    private String description;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;

    public static EventDetailResponse from(Event event) {
        return EventDetailResponse.builder()
                .eventId(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .build();
    }
}
