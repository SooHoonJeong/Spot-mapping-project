package com.getinspot.spot.domain.search.service;

import com.getinspot.spot.domain.event.entity.Event;
import com.getinspot.spot.domain.event.repository.EventRepository;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.member.repository.MemberRepository;
import com.getinspot.spot.domain.post.entity.Post;
import com.getinspot.spot.domain.post.repository.PostRepository;
import com.getinspot.spot.domain.search.dto.EventListResponse;
import com.getinspot.spot.domain.search.dto.GlobalSearchResponse;
import com.getinspot.spot.domain.search.dto.GlobalSearchResponse.PageResult;
import com.getinspot.spot.domain.search.dto.GlobalSearchResponse.SearchEventDto;
import com.getinspot.spot.domain.search.dto.GlobalSearchResponse.SearchMemberDto;
import com.getinspot.spot.domain.search.dto.GlobalSearchResponse.SearchPostDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final EventRepository eventRepository;
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;

    public GlobalSearchResponse searchAll(String keyword, Pageable pageable) {
        if (!StringUtils.hasText(keyword)) {
            throw new IllegalArgumentException("검색어는 필수입니다.");
        }

        // 1. 데이터 조회
        Page<Event> eventPage = eventRepository
                .findByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(keyword, keyword, pageable);

        // Member 엔티티 조회
        Page<Member> memberPage = memberRepository
                .findByNicknameContainingIgnoreCase(keyword, pageable);

        Page<Post> postPage = postRepository
                .findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword, pageable);

        // 2. Event DTO 변환
        PageResult<SearchEventDto> eventResult = PageResult.<SearchEventDto>builder()
                .content(eventPage.getContent().stream().map(SearchEventDto::from).collect(Collectors.toList()))
                .currentPage(eventPage.getNumber())
                .totalPages(eventPage.getTotalPages())
                .totalElements(eventPage.getTotalElements())
                .hasNext(eventPage.hasNext())
                .build();

        // 3. Member DTO 변환
        PageResult<SearchMemberDto> memberResult = PageResult.<SearchMemberDto>builder()
                .content(memberPage.getContent().stream().map(SearchMemberDto::from).collect(Collectors.toList()))
                .currentPage(memberPage.getNumber())
                .totalPages(memberPage.getTotalPages())
                .totalElements(memberPage.getTotalElements())
                .hasNext(memberPage.hasNext())
                .build();

        PageResult<SearchPostDto> postResult = PageResult.<SearchPostDto>builder()
                .content(postPage.getContent().stream().map(SearchPostDto::from).collect(Collectors.toList()))
                .currentPage(postPage.getNumber())
                .totalPages(postPage.getTotalPages())
                .totalElements(postPage.getTotalElements())
                .hasNext(postPage.hasNext())
                .build();

        // 4. 최종 응답 객체 조립
        return GlobalSearchResponse.builder()
                .events(eventResult)
                .members(memberResult)
                .posts(postResult)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<EventListResponse> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable)
                .map(EventListResponse::from);
    }
}
