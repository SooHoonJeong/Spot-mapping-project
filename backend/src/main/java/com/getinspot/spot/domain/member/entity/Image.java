package com.getinspot.spot.domain.member.entity;

import com.getinspot.spot.global.common.entity.BaseCreatedTime;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "image", indexes = {
        @Index(name = "idx_image_target", columnList = "target_id, target_type")
})
public class Image extends BaseCreatedTime {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "image_id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false, unique = true)
    private String storedFileName;

    @Column(nullable = false)
    private String filePath;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private ImageTargetType targetType;

    @Builder
    public Image(String originalFileName, String storedFileName, String filePath, Long targetId, ImageTargetType targetType) {
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.filePath = filePath;
        this.targetId = targetId;
        this.targetType = targetType;
    }
}