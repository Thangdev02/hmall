import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { uploadMultipleFilesUser } from "../../api/upload";
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
    const [userID, setUserID] = useState(""); // Lưu userID sau bước 1
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const logoInputRef = useRef();
    const coverInputRef = useRef();
    const navigate = useNavigate();

    const handleChange = (e) => {
        // Chỉ cho phép nhập số và tối đa 10 ký tự cho phoneNumber
        if (e.target.name === "phoneNumber") {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length > 10) return;
            setForm({ ...form, phoneNumber: value });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
        setError("");
    };

    const handleRoleChange = (e) => {
        setForm({ ...form, role: e.target.value });
    };

    // Kiểm tra mật khẩu hợp lệ
    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@!@#$%^&*])[A-Za-z\d@!@#$%^&*]{8,}$/;
        return regex.test(password);
    };

    // Kiểm tra số điện thoại hợp lệ
    const validatePhone = (phone) => {
        return /^\d{10}$/.test(phone);
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

        if (!validatePhone(form.phoneNumber)) {
            setError("Số điện thoại phải gồm đúng 10 chữ số.");
            return;
        }

        setLoading(true);
        try {
            const res = await register(form);
            // Lấy userID từ res.data hoặc res.data.id hoặc res.data (nếu là chuỗi UUID)
            let newUserID = "";
            if (res && res.statusCode === 201 && res.data) {
                if (typeof res.data === "object" && res.data.id) {
                    newUserID = res.data.id;
                } else if (typeof res.data === "string") {
                    newUserID = res.data;
                }
                if (form.role === "Shop") {
                    setUserID(newUserID); // Lưu userID
                    setShopForm({
                        ...shopForm,
                        email: form.email,
                        phone: form.phoneNumber,
                        userID: newUserID, // Đảm bảo userID được lưu
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
        // Chỉ cho phép nhập số và tối đa 10 ký tự cho phone
        if (e.target.name === "phone") {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length > 10) return;
            setShopForm({ ...shopForm, phone: value });
        } else {
            setShopForm({ ...shopForm, [e.target.name]: e.target.value });
        }
        setError("");
    };

    // Xử lý upload logo
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLogoUploading(true);
        try {
            const res = await uploadMultipleFilesUser({ files: [file] });
            if (res?.files?.[0]) {
                setShopForm((prev) => ({
                    ...prev,
                    logoUrl: res.files[0].startsWith("http")
                        ? res.files[0]
                        : `https://hmstoresapi.eposh.io.vn/${res.files[0]}`
                }));
            }
        } catch {
            alert("Tải logo thất bại!");
        }
        setLogoUploading(false);
    };

    // Xử lý upload ảnh bìa
    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCoverUploading(true);
        try {
            const res = await uploadMultipleFilesUser({ files: [file] });
            if (res?.files?.[0]) {
                setShopForm((prev) => ({
                    ...prev,
                    coverImageUrl: res.files[0].startsWith("http")
                        ? res.files[0]
                        : `https://hmstoresapi.eposh.io.vn/${res.files[0]}`
                }));
            }
        } catch {
            alert("Tải ảnh bìa thất bại!");
        }
        setCoverUploading(false);
    };

    const handleShopSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!shopForm.name || !shopForm.address || !shopForm.phone || !shopForm.email) {
            setError("Vui lòng nhập đầy đủ thông tin shop!");
            return;
        }
        if (!validatePhone(shopForm.phone)) {
            setError("Số điện thoại shop phải gồm đúng 10 chữ số.");
            return;
        }
        setLoading(true);
        try {
            const token = "";
            // Lấy userID từ state nếu chưa có trong shopForm
            const payload = { ...shopForm, userID: shopForm.userID || userID };
            const res = await registerShop(payload, token);
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
                                maxLength={10}
                                inputMode="numeric"
                                pattern="\d*"
                            />

                            <label htmlFor="role">Vai trò</label>
                            <select id="role" name="role" value={form.role} onChange={handleRoleChange}>
                                {roleOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {error && (
                                <div style={{ color: "#e74c3c", marginBottom: 8, fontSize: "14px" }}>{error}</div>
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
                                    <input id="phone" name="phone" type="text" placeholder="Nhập số điện thoại" value={shopForm.phone} onChange={handleShopChange} maxLength={10} inputMode="numeric" pattern="\d*" />
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
                                    <label htmlFor="logoUrl">Logo (URL hoặc tải ảnh)</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <input
                                            id="logoUrl"
                                            name="logoUrl"
                                            type="text"
                                            placeholder="URL logo"
                                            value={shopForm.logoUrl}
                                            onChange={handleShopChange}
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={logoInputRef}
                                            style={{ display: "none" }}
                                            onChange={handleLogoUpload}
                                            disabled={logoUploading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => logoInputRef.current.click()}
                                            disabled={logoUploading}
                                        >
                                            {logoUploading ? "Đang tải..." : "Chọn ảnh"}
                                        </button>
                                    </div>
                                    {shopForm.logoUrl && (
                                        <img
                                            src={shopForm.logoUrl}
                                            alt="Logo preview"
                                            style={{ maxHeight: 60, marginTop: 8, borderRadius: 8 }}
                                        />
                                    )}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label htmlFor="coverImageUrl">Ảnh bìa (URL hoặc tải ảnh)</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <input
                                            id="coverImageUrl"
                                            name="coverImageUrl"
                                            type="text"
                                            placeholder="URL ảnh bìa"
                                            value={shopForm.coverImageUrl}
                                            onChange={handleShopChange}
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={coverInputRef}
                                            style={{ display: "none" }}
                                            onChange={handleCoverUpload}
                                            disabled={coverUploading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => coverInputRef.current.click()}
                                            disabled={coverUploading}
                                        >
                                            {coverUploading ? "Đang tải..." : "Chọn ảnh"}
                                        </button>
                                    </div>
                                    {shopForm.coverImageUrl && (
                                        <img
                                            src={shopForm.coverImageUrl}
                                            alt="Cover preview"
                                            style={{ maxHeight: 60, marginTop: 8, borderRadius: 8 }}
                                        />
                                    )}
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