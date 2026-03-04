import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const INITIAL_FORM_DATA = {
  email: "",
  password: "",
  passwordConfirm: "",
  gender: "",
  username: "",
  nickname: "",
  birthDate: "",
  phoneNumber: "",
  agreedToTerms: false,
  agreedToMarketing: false,
};

export default function SignupForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // mail verification
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    if (type === "radio") {
      if (value === "true") finalValue = true;
      if (value === "false") finalValue = false;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  // mail verification
  const handleSendCode = async () => {
    if (!formData.email) return alert("이메일을 먼저 입력해주세요.");
    try {
      await authService.sendVerificationEmail(formData.email);
      setIsEmailSent(true);
      alert("인증번호가 발송되었습니다.");
    } catch (err) {
      alert("발송 실패 : " + (err.response?.data?.message || "오류 발생"));
    }
  };

  const handleVerifyCode = async () => {
    try {
      await authService.checkVerificationEmail(
        formData.email,
        verificationCode,
      );
      setIsEmailVerified(true);
      alert("인증이 완료되었습니다.");
    } catch (err) {
      alert("인증번호가 틀렸습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isEmailVerified) {
      setError("이메일 인증을 완료햐주세요.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    if (
      formData.agreedToTerms === false ||
      formData.agreedToTerms === "false"
    ) {
      setError("약관에 동의하셔야 가입이 가능합니다.");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.signup(formData);
      alert(`${result.username}님, 가입을 축하드립니다!`);

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "회원가입 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-bold text-center mb-4">회원가입</h2>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            placeholder="이메일"
            disabled={isEmailVerified}
            required
            onChange={handleChange}
            className="p-2 border rounded disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isEmailVerified || loading}
            className="px-3 py-1 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 disabled:bg-gray-300"
          >
            {isEmailSent ? "재발송" : "인증받기"}
          </button>
        </div>
        {isEmailSent && !isEmailVerified && (
          <div>
            <input
              type="text"
              placegolder="인증번호 6자리"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="flex-1 p-2 border-blue-400 rounded"
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-500"
            >
              확인
            </button>
          </div>
        )}
        {isEmailVerified && (
          <p className="text-green-600 text-xs font-bold">이메일 인증 완료</p>
        )}
      </div>
      <input
        name="password"
        type="password"
        placeholder="비밀번호"
        required
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        name="passwordConfirm"
        type="password"
        placeholder="비밀번호 확인"
        required
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        name="username"
        placeholder="이름"
        required
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        name="nickname"
        placeholder="닉네임"
        type="text"
        required
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        name="birthDate"
        placeholder="ex)1999년 12월 25일생 -> 19991225"
        type="text"
        required
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        name="phoneNumber"
        placeholder="핸드폰 번호"
        type="text"
        required
        onChange={handleChange}
        className="p-2 border rounded"
      />

      {/* 성별 선택 (다중일택) */}
      <div className="flex justify-around p-2 bg-gray-50 rounded">
        <label className="flex gap-2">
          <input
            type="radio"
            name="gender"
            value="MALE"
            checked={formData.gender === "MALE"}
            onChange={handleChange}
          />{" "}
          남성
        </label>
        <label className="flex gap-2">
          <input
            type="radio"
            name="gender"
            value="FEMALE"
            checked={formData.gender === "FEMALE"}
            onChange={handleChange}
          />{" "}
          여성
        </label>
      </div>

      <div className="flex justify-around p-2 bg-gray-50 rounded">
        <label className="flex gap-2">
          <input
            type="radio"
            name="agreedToTerms"
            value="true"
            checked={formData.agreedToTerms === true}
            onChange={handleChange}
          />{" "}
          동의
        </label>
        <label className="flex gap-2">
          <input
            type="radio"
            name="agreedToTerms"
            value="false"
            checked={formData.agreedToTerms === false}
            onChange={handleChange}
          />{" "}
          미동의
        </label>
      </div>

      <div className="flex justify-around p-2 bg-gray-50 rounded">
        <label className="flex gap-2">
          <input
            type="radio"
            name="agreedToMarketing"
            value="true"
            checked={formData.agreedToMarketing === true}
            onChange={handleChange}
          />{" "}
          동의
        </label>
        <label className="flex gap-2">
          <input
            type="radio"
            name="agreedToMarketing"
            value="false"
            checked={formData.agreedToMarketing === false}
            onChange={handleChange}
          />{" "}
          미동의
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className={`p-2 rounded font-bold text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}
