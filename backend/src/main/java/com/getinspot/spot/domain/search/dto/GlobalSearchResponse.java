package com.getinspot.spot.domain.search.dto;

import com.getinspot.spot.domain.event.entity.Event;
import com.getinspot.spot.domain.member.entity.Member;
import com.getinspot.spot.domain.post.entity.Post;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GlobalSearchResponse {

    private PageResult<SearchEventDto> events;
    private PageResult<SearchMemberDto> members;
    private PageResult<SearchPostDto> posts;

    @Getter
    @Builder
    public static class PageResult<T> {
        private List<T> content;
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private boolean hasNext;
    }

    @Getter
    @Builder
    public static class SearchEventDto {
        private Long eventId;
        private String title;
        private String location;

        public static SearchEventDto from(Event event) {
            return SearchEventDto.builder()
                    .eventId(event.getId())
                    .title(event.getTitle())
                    .location(event.getLocation())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class SearchMemberDto {
        private Long memberId;
        private String nickname;

        public static SearchMemberDto from(Member member) {
            return SearchMemberDto.builder()
                    .memberId(member.getId())
                    .nickname(member.getNickname())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class SearchPostDto {
        private Long postId;
        private String title;
        private String contentPreview; // 내용 미리보기용
        private String authorNickname; // 작성자 닉네임

        public static SearchPostDto from(Post post) {
            // 내용이 너무 길면 프론트엔드에서 깨질 수 있으므로 앞에서부터 50자만 자르는 로직 (선택사항)
            String preview = post.getContent().length() > 50
                    ? post.getContent().substring(0, 50) + "..."
                    : post.getContent();

            return SearchPostDto.builder()
                    .postId(post.getId())
                    .title(post.getTitle())
                    .contentPreview(preview)
                    .authorNickname(post.getMember() != null ? post.getMember().getNickname() : "알 수 없음")
                    .build();
        }
    }
}
