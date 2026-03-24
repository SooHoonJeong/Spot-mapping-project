package com.getinspot.spot.domain.event.dto;

import com.getinspot.spot.domain.event.entity.Event;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EventCreateRequest {

    @NotBlank(message = "팝업 행사명은 필수입니다.")
    private String title;

    private String description;

    @NotBlank(message = "행사 장소는 필수입니다.")
    private String location;

    @NotNull(message = "시작일은 필수입니다.")
    private LocalDate startDate;

    @NotNull(message = "종료일은 필수입니다.")
    private LocalDate endDate;

    // DTO를 Entity로 변환하는 편의 메서드
    public Event toEntity() {
        return Event.builder()
                .title(this.title)
                .description(this.description)
                .location(this.location)
                .startDate(this.startDate)
                .endDate(this.endDate)
                .build();
    }
}
