import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

import "./Register.css";
import { register } from "../../api/auth";
import { registerShop } from "../../api/shop";

const roleOptions = [
    { label: "Shop", value: "Shop" },
    { label: "User", value: "User" },
];

const Register = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: "",
        phoneNumber: "",
        role: "User",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [shopForm, setShopForm] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        city: "",
        province: "",
        logoUrl: "",
        coverImageUrl: "",
        qrBanking: "",
        userID: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleRoleChange = (e) => {
        setForm({ ...form, role: e.target.value });
    };

    // ✅ Kiểm tra mật khẩu hợp lệ
    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@!@#$%^&*])[A-Za-z\d@!@#$%^&*]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.userName || !form.email || !form.password || !form.phoneNumber) {
            setError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (!validatePassword(form.password)) {
            setError("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt (@!@#$%^&*).");
            return;
        }

        setLoading(true);
        try {
            const res = await register(form);
            if (res && res.statusCode === 201 && res.data) {
                if (form.role === "Shop") {
                    setShopForm({
                        ...shopForm,
                        email: form.email,
                        phone: form.phoneNumber,
                        userID: res.data.id,
                    });
                    setStep(2);
                } else {
                    navigate("/login");
                }
            } else {
                setError(res?.message || "Đăng ký thất bại!");
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại!");
        }
        setLoading(false);
    };

    const handleShopChange = (e) => {
        setShopForm({ ...shopForm, [e.target.name]: e.target.value });
        setError("");
    };

    const handleShopSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!shopForm.name || !shopForm.address || !shopForm.phone || !shopForm.email) {
            setError("Vui lòng nhập đầy đủ thông tin shop!");
            return;
        }
        setLoading(true);
        try {
            const token = "";
            const res = await registerShop(shopForm, token);
            if (res && res.statusCode === 200) {
                navigate("/login");
            } else {
                setError(res?.message || "Đăng ký shop thất bại!");
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại!");
        }
        setLoading(false);
    };

    return (
        <div className="login-bg">
            <div className="login-container position-relative">
                <div className="login-shape login-shape-1"></div>
                <div className="login-shape login-shape-2"></div>
                <div className="login-shape login-shape-3"></div>

                {step === 1 ? (
                    <>
                        <h2 className="login-title">Đăng Ký Tài Khoản</h2>
                        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
                            <label htmlFor="userName">Tên đăng nhập</label>
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={form.userName}
                                onChange={handleChange}
                            />
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Nhập email"
                                value={form.email}
                                onChange={handleChange}
                            />

                            <label htmlFor="password">Mật khẩu</label>
                            <div className="password-field">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                <span
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                </span>
                            </div>

                            <label htmlFor="phoneNumber">Số điện thoại</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="text"
                                placeholder="Nhập số điện thoại"
                                value={form.phoneNumber}
                                onChange={handleChange}
                            />

                            <label htmlFor="role">Vai trò</label>
                            <select id="role" name="role" value={form.role} onChange={handleRoleChange}>
                                {roleOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {error && (
                                <div style={{ color: "#e74c3c", marginBottom: 8, fontSize: 14 }}>{error}</div>
                            )}

                            <button className="login-btn" type="submit" disabled={loading}>
                                {loading ? "Đang đăng ký..." : "Đăng Ký"}
                            </button>
                        </form>

                        <a className="login-link" href="/login">
                            Đã có tài khoản? Đăng nhập
                        </a>
                    </>
                ) : (
                    <>
                        <h2 className="login-title">Đăng Ký Shop</h2>
                        <form className="register-form" onSubmit={handleShopSubmit} autoComplete="off">
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="name">Tên shop</label>
                                    <input id="name" name="name" type="text" placeholder="Nhập tên shop" value={shopForm.name} onChange={handleShopChange} />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="address">Địa chỉ</label>
                                    <input id="address" name="address" type="text" placeholder="Nhập địa chỉ" value={shopForm.address} onChange={handleShopChange} />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="phone">Số điện thoại</label>
                                    <input id="phone" name="phone" type="text" placeholder="Nhập số điện thoại" value={shopForm.phone} onChange={handleShopChange} />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="email">Email</label>
                                    <input id="email" name="email" type="email" placeholder="Nhập email" value={shopForm.email} onChange={handleShopChange} />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="city">Thành phố</label>
                                    <input id="city" name="city" type="text" placeholder="Thành phố" value={shopForm.city} onChange={handleShopChange} />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="province">Tỉnh</label>
                                    <input id="province" name="province" type="text" placeholder="Tỉnh" value={shopForm.province} onChange={handleShopChange} />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="logoUrl">Logo (URL)</label>
                                    <input id="logoUrl" name="logoUrl" type="text" placeholder="URL logo" value={shopForm.logoUrl} onChange={handleShopChange} />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="coverImageUrl">Ảnh bìa (URL)</label>
                                    <input id="coverImageUrl" name="coverImageUrl" type="text" placeholder="URL ảnh bìa" value={shopForm.coverImageUrl} onChange={handleShopChange} />
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label htmlFor="qrBanking">QR Banking (URL)</label>
                                    <input id="qrBanking" name="qrBanking" type="text" placeholder="URL QR Banking" value={shopForm.qrBanking} onChange={handleShopChange} />
                                </div>
                            </div>
                            {error && <div style={{ color: "#e74c3c", marginBottom: 8, fontSize: 14 }}>{error}</div>}
                            <button className="register-btn" type="submit" disabled={loading}>
                                {loading ? "Đang đăng ký shop..." : "Đăng Ký Shop"}
                            </button>
                        </form>
                        <a className="login-link" href="/login">Đã có tài khoản? Đăng nhập</a>
                    </>
                )}
            </div>
        </div>
    );
};

export default Register;
