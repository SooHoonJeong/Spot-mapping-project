package com.getinspot.spot.domain.search.controller;

import com.getinspot.spot.domain.event.service.EventService;
import com.getinspot.spot.domain.search.dto.GlobalSearchResponse;
import com.getinspot.spot.domain.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<GlobalSearchResponse> globalSearch(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @PageableDefault(size = 20, page = 0) Pageable pageable) {

        GlobalSearchResponse response = searchService.searchAll(keyword, pageable);
        return ResponseEntity.ok(response);
    }
}
