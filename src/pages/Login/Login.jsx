import React, { useState } from "react";
import "./Login.css";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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
                // Lưu token, role, và username vào localStorage
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role); // Lưu role từ API
                localStorage.setItem("username", res.data.username); // Lưu username
                // Điều hướng dựa trên vai trò
                if (res.data.role === "Admin") {
                    navigate("/admin");
                } else if (res.data.role === "Shop") {
                    navigate("/shop/profile");
                } else {
                    navigate("/");
                }
            } else {
                setError(res?.message || "Đăng nhập thất bại!");
            }
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError("Có lỗi xảy ra. Vui lòng thử lại!");
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
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={form.username}
                        onChange={handleChange}
                    />
                    <label htmlFor="password">Mật khẩu</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={form.password}
                        onChange={handleChange}
                    />
                    {error && <div style={{ color: "#e74c3c", marginBottom: 8, fontSize: 14 }}>{error}</div>}
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                    </button>
                </form>
                <a
                    className="login-link"
                    href="/forgot-password"
                    style={{ color: "#4f8edc", fontWeight: 500, textDecoration: "underline", cursor: "pointer" }}
                >
                    Quên mật khẩu?
                </a>
                <div className="mt-3 text-center">
                    <span>Bạn chưa có tài khoản? </span>
                    <a
                        href="/register"
                        style={{ color: "#4f8edc", fontWeight: 500, textDecoration: "underline", cursor: "pointer" }}
                    >
                        Đăng ký ngay
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;