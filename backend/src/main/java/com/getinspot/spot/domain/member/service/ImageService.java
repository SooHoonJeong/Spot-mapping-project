package com.getinspot.spot.domain.member.service;

import com.getinspot.spot.domain.member.entity.Image;
import com.getinspot.spot.domain.member.entity.ImageTargetType;
import com.getinspot.spot.domain.member.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImageService {

    private final ImageRepository imageRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public Image uploadImage(MultipartFile file, Long targetId, ImageTargetType targetType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 존재하지 않습니다.");
        }

        try {
            String saveDirectory = uploadDir.replace("file:///", "");
            File directory = new File(saveDirectory);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalFileName = file.getOriginalFilename();
            String extension = extractExtension(originalFileName);
            String storedFileName = UUID.randomUUID().toString() + extension;

            File dest = new File(saveDirectory + storedFileName);
            file.transferTo(dest);

            String accessUrl = "/images/" + storedFileName;

            Image image = Image.builder()
                    .originalFileName(originalFileName)
                    .storedFileName(storedFileName)
                    .filePath(accessUrl)
                    .targetId(targetId)
                    .targetType(targetType)
                    .build();

            return imageRepository.save(image);

        } catch (IOException e) {
            log.error("파일 업로드 실패 - 파일명: {}, 에러: {}", file.getOriginalFilename(), e.getMessage());
            throw new RuntimeException("이미지 파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    private String extractExtension(String originalFileName) {
        if (originalFileName == null || !originalFileName.contains(".")) {
            return "";
        }
        return originalFileName.substring(originalFileName.lastIndexOf("."));
    }
}
