package com.getinspot.spot.domain.member.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "image", indexes = {
        @Index(name = "idx_image_target", columnList = "target_id, target_type")
})
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String uuid;

    private String fileName;

    private String filePath; // 실제 파일이 저장된 경로 또는 URL

    @Column(name = "target_id")
    private Long targetId; // Member의 ID 또는 Event의 ID 등

    @Column(name = "target_type")
    private String targetType; // "MEMBER", "EVENT" 등 구분값
}
