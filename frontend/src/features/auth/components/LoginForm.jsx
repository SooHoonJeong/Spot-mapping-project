import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login(formData.email, formData.password);
      alert("로그인 성공!");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "아이디 또는 비밀번호가 틀렸습니다.",
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
      <input
        name="email"
        type="email"
        placeholder="이메일"
        required
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        name="password"
        type="password"
        placeholder="비밀번호"
        required
        onChange={handleChange}
        className="p-2 border rounded"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`p-2 rounded font-bold text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
