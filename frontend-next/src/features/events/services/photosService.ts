import API from "@/api/axios";

export interface UploadPhotoResult {
  // MinIO의 pending 경로 키. 이벤트 등록 요청(POST /api/events)의 photoKeys에 그대로 담아 보낸다.
  photoKey: string;
  // 미리보기용 presigned URL. 10분 뒤 만료되므로 긴 작성 세션에서는 깨질 수 있다.
  previewUrl: string;
}

export const photosService = {
  async uploadPhoto(file: File): Promise<UploadPhotoResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post("/api/events/photos", formData, {
      // 인스턴스 기본 Content-Type(application/json)을 걷어내야 axios/브라우저가
      // multipart boundary를 포함한 헤더를 직접 설정한다.
      headers: { "Content-Type": undefined },
    });
    return response.data.data as UploadPhotoResult;
  },
};
