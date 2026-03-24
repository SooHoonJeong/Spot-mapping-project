package com.getinspot.spot.domain.search.dto;

import com.getinspot.spot.domain.event.entity.Event;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class EventListResponse {
    private Long eventId;
    private String title;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;

    public static EventListResponse from(Event event) {
        return EventListResponse.builder()
                .eventId(event.getId())
                .title(event.getTitle())
                .location(event.getLocation())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .build();
    }
}
