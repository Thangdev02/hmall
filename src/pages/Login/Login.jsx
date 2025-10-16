import React, { useState } from "react";
import "./Login.css";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { PersonFill, LockFill, EyeFill, EyeSlashFill } from "react-bootstrap-icons";

const Login = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            setError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        setLoading(true);
        try {
            const res = await login({
                userNameOrEmail: form.username,
                password: form.password,
            });

            if (res && res.statusCode === 200 && res.data) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role);
                localStorage.setItem("username", res.data.username);

                if (res.data.role === "Admin") navigate("/admin");
                else if (res.data.role === "Shop") navigate("/shop/profile");
                else navigate("/");

            } else if (
                res &&
                res.statusCode === 400 &&
                res.message === "Bạn chưa đăng ký thông tin shop vui lòng đăng ký" &&
                res.data?.role === "Shop"
            ) {
                localStorage.setItem("userId", res.data.userId);
                localStorage.setItem("username", res.data.username);
                localStorage.setItem("role", res.data.role);
                navigate("/register-shop");
            }
            // ✅ Trường hợp sai tài khoản hoặc mật khẩu
            else if (res && (res.statusCode === 400 || res.statusCode === 401)) {
                setError("Tên đăng nhập hoặc mật khẩu không đúng!");
            }
            // ✅ Nếu API trả về lỗi khác
            else {
                setError(res?.message || "Đăng nhập thất bại. Vui lòng thử lại!");
            }

        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-bg">
            <div className="login-container position-relative">
                <div className="login-shape login-shape-1"></div>
                <div className="login-shape login-shape-2"></div>
                <div className="login-shape login-shape-3"></div>

                <h2 className="login-title">Đăng Nhập</h2>
                <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
                    {/* Username */}
                    <label htmlFor="username">Tên đăng nhập  <PersonFill className="input-icon" /></label>
                    <div className="input-wrapper">

                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <label htmlFor="password">Mật khẩu<LockFill className="input-icon" /></label>
                    <div className="input-wrapper">

                        <div style={{ fontSize: 13, color: "#1976d2", marginBottom: 8 }}>
                            Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt (@!@#$%^&*).
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu"
                            value={form.password}
                            onChange={handleChange}
                        />
                        {showPassword ? (
                            <EyeSlashFill
                                className="toggle-password-icon"
                                onClick={() => setShowPassword(false)}
                            />
                        ) : (
                            <EyeFill
                                className="toggle-password-icon"
                                onClick={() => setShowPassword(true)}
                            />
                        )}

                    </div>

                    {error && (
                        <div style={{ color: "#e74c3c", marginBottom: 8, fontSize: 14 }}>
                            {error}
                        </div>
                    )}
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                    </button>
                </form>

                <a
                    className="login-link"
                    href="/forgot-password"
                    style={{
                        color: "#4f8edc",
                        fontWeight: 500,
                        textDecoration: "underline",
                        cursor: "pointer",
                    }}
                >
                    Quên mật khẩu?
                </a>

                <div className="mt-3 text-center">
                    <span>Bạn chưa có tài khoản? </span>
                    <a
                        href="/register"
                        style={{
                            color: "#4f8edc",
                            fontWeight: 500,
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}
                    >
                        Đăng ký ngay
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;