package com.getinspot.spot.domain.member.repository;

import com.getinspot.spot.domain.member.entity.Image;
import com.getinspot.spot.domain.member.entity.ImageTargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {

    Optional<Image> findByTargetIdAndTargetType(Long targetId, ImageTargetType targetType);
}
