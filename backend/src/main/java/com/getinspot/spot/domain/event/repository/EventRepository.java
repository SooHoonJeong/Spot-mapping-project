package com.getinspot.spot.domain.event.repository;

import com.getinspot.spot.domain.event.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // 제목에 키워드가 포함된 행사 검색 (대소문자 무시)
    List<Event> findByTitleContainingIgnoreCase(String keyword);

    // 행사명 OR 장소에 키워드가 포함된 데이터 검색
    Page<Event> findByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(String title, String location, Pageable pageable);
}
