import React, { useState } from "react";
import "./Forgot-password.css";
import { sendKeyForgotPassword, setNewPassword } from "../../api/auth";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP và mật khẩu mới
    const [form, setForm] = useState({
        email: "",
        code: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
        setSuccess("");
    };

    // Bước 1: Gửi OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!form.email) {
            setError("Vui lòng nhập địa chỉ email!");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError("Email không hợp lệ!");
            return;
        }

        setLoading(true);
        try {
            const res = await sendKeyForgotPassword(form.email);
            if (res && res.statusCode === 200) {
                setSuccess("Mã OTP đã được gửi đến email của bạn!");
                setStep(2);
            } else {
                setError(res?.message || "Gửi mã OTP thất bại!");
            }
        } catch (err) {
            console.error("Lỗi gửi OTP:", err);
            setError("Có lỗi xảy ra. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Đặt mật khẩu mới
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!form.code || !form.newPassword || !form.confirmPassword) {
            setError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (form.newPassword.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        setLoading(true);
        try {
            const res = await setNewPassword({
                email: form.email,
                code: form.code,
                newPassword: form.newPassword
            });
            if (res && res.statusCode === 200) {
                setSuccess("Đặt lại mật khẩu thành công!");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(res?.message || "Đặt lại mật khẩu thất bại!");
            }
        } catch (err) {
            console.error("Lỗi đặt lại mật khẩu:", err);
            setError("Có lỗi xảy ra. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setStep(1);
        setForm({ ...form, code: "", newPassword: "", confirmPassword: "" });
        setError("");
        setSuccess("");
    };

    return (
        <div className="forgot-bg">
            <div className="forgot-container position-relative">
                <div className="forgot-shape forgot-shape-1"></div>
                <div className="forgot-shape forgot-shape-2"></div>
                <div className="forgot-shape forgot-shape-3"></div>

                <h2 className="forgot-title">
                    {step === 1 ? "Quên Mật Khẩu" : "Đặt Mật Khẩu Mới"}
                </h2>

                {step === 1 ? (
                    // Bước 1: Nhập email
                    <form className="forgot-form" onSubmit={handleSendOTP} autoComplete="off">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Nhập địa chỉ email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        {error && <div className="forgot-error">{error}</div>}
                        {success && <div className="forgot-success">{success}</div>}

                        <button className="forgot-btn" type="submit" disabled={loading}>
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </button>
                    </form>
                ) : (
                    // Bước 2: Nhập OTP và mật khẩu mới
                    <form className="forgot-form" onSubmit={handleResetPassword} autoComplete="off">
                        <div className="forgot-email-info">
                            <small>Mã OTP đã được gửi đến: <strong>{form.email}</strong></small>
                        </div>

                        <label htmlFor="code">Mã OTP</label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            placeholder="Nhập mã OTP (có thể là 4-8 ký tự)"
                            value={form.code}
                            onChange={handleChange}
                        // Bỏ maxLength để cho phép nhập nhiều ký tự hơn
                        />

                        <label htmlFor="newPassword">Mật khẩu mới</label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            value={form.newPassword}
                            onChange={handleChange}
                        />

                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />

                        {error && <div className="forgot-error">{error}</div>}
                        {success && <div className="forgot-success">{success}</div>}

                        <button className="forgot-btn" type="submit" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </button>

                        <button
                            type="button"
                            className="forgot-back-btn"
                            onClick={handleBackToEmail}
                        >
                            Quay lại nhập email
                        </button>
                    </form>
                )}

                <div className="forgot-links">
                    <span>Nhớ mật khẩu? </span>
                    <a href="/login" className="forgot-link">
                        Đăng nhập ngay
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;