import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";

export default function Navbar() {
  const { use, isLoggedIn, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("로그아웃 하겠습니까?")) {
      logout();
      navigate("/");
    }
  };
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 tracking-tight"
            >
              Spot
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link
              to="/map"
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              지도 보기
            </Link>
            <Link
              to="/community"
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              커뮤니티
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex item-end hidden sm:flex">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-semibold text-gray-800">
                    {user?.nickname || "사용자"}님
                  </span>
                  <Link
                    to="/profile"
                    className="text-xs text-gray-500 hover:underline"
                  >
                    마이페이지
                  </Link>
                </div>

                <Link to="/profile">
                  <div className="w-10 h-10 rounded-full bfg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden">
                    {user?.profileImg ? (
                      <img
                        src={user.profileImg}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-bold">
                        {user?.nickname?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  onclick={handleLogout}
                  className="ml-2 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
