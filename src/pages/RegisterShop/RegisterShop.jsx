import React, { useState, useEffect, useRef } from "react";
import "./RegisterShop.css";
import { useNavigate } from "react-router-dom";
import { registerShop } from "../../api/shop";
import { uploadMultipleFilesUser } from "../../api/upload";
import { Spinner } from "react-bootstrap";

const RegisterShop = () => {
    const [shopForm, setShopForm] = useState({
        shopName: "",
        address: "",
        phoneNumber: "",
        email: "",
        city: "",
        province: "",
        logo: "",
        coverImage: "",
        qrBanking: "",
        userID: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [logoUploading, setLogoUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);

    const logoInputRef = useRef();
    const coverInputRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userId") || "";
        if (!userId) {
            navigate("/login");
        } else {
            setShopForm((prev) => ({
                ...prev,
                userID: userId,
            }));
        }
    }, [navigate]);

    const handleChange = (e) => {
        setShopForm({ ...shopForm, [e.target.name]: e.target.value });
        setError("");
    };

    // Upload logo lên server và lấy URL
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLogoUploading(true);
        try {
            const res = await uploadMultipleFilesUser({ files: [file] });
            if (res?.files?.[0]) {
                setShopForm((prev) => ({
                    ...prev,
                    logo: res.files[0].startsWith("http")
                        ? res.files[0]
                        : `https://hmstoresapi.eposh.io.vn/${res.files[0]}`
                }));
            }
        } catch {
            setError("Tải logo thất bại!");
        }
        setLogoUploading(false);
    };

    // Upload cover image lên server và lấy URL
    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCoverUploading(true);
        try {
            const res = await uploadMultipleFilesUser({ files: [file] });
            if (res?.files?.[0]) {
                setShopForm((prev) => ({
                    ...prev,
                    coverImage: res.files[0].startsWith("http")
                        ? res.files[0]
                        : `https://hmstoresapi.eposh.io.vn/${res.files[0]}`
                }));
            }
        } catch {
            setError("Tải ảnh bìa thất bại!");
        }
        setCoverUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Validate các trường bắt buộc
        if (!shopForm.shopName || !shopForm.phoneNumber || !shopForm.logo || !shopForm.coverImage) {
            setError("Vui lòng nhập đầy đủ các trường bắt buộc: Tên shop, Số điện thoại, Logo, Ảnh bìa.");
            setLoading(false);
            return;
        }

        // Đúng tên trường cho API
        const payload = {
            Name: shopForm.shopName,
            Address: shopForm.address,
            Phone: shopForm.phoneNumber,
            Email: shopForm.email,
            City: shopForm.city,
            Province: shopForm.province,
            LogoUrl: shopForm.logo,
            CoverImageUrl: shopForm.coverImage,
            QrBanking: shopForm.qrBanking,
            UserID: shopForm.userID,
        };

        try {
            const res = await registerShop(payload, null);
            if (res.statusCode === 200) {
                setSuccess("Đăng ký shop thành công! Vui lòng đăng nhập lại.");
                setTimeout(() => navigate("/login"), 1500);
            } else {
                setError(res.message || "Đăng ký shop thất bại!");
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registershop-bg">
            <div className="registershop-container position-relative">
                <h2 className="registershop-title">Đăng Ký Shop</h2>
                <form className="registershop-form" onSubmit={handleSubmit} autoComplete="off">
                    <div className="registershop-form-grid">
                        <div>
                            <label htmlFor="shopName">Tên shop *</label>
                            <input
                                id="shopName"
                                name="shopName"
                                type="text"
                                placeholder="Nhập tên shop"
                                value={shopForm.shopName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="address">Địa chỉ</label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                placeholder="Nhập địa chỉ"
                                value={shopForm.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber">Số điện thoại *</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="text"
                                placeholder="Nhập số điện thoại"
                                value={shopForm.phoneNumber}
                                onChange={e => {
                                    // Chỉ cho nhập số và tối đa 10 ký tự
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    setShopForm(prev => ({ ...prev, phoneNumber: value }));
                                }}
                                maxLength={10}
                                inputMode="numeric"
                                pattern="\d*"
                            />
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nguyenvana@gmail.com"
                                value={shopForm.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="city">Thành phố</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                placeholder="Thành phố"
                                value={shopForm.city}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="province">Tỉnh</label>
                            <input
                                id="province"
                                name="province"
                                type="text"
                                placeholder="Tỉnh"
                                value={shopForm.province}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="logo">Logo (URL hoặc tải ảnh) *</label>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    id="logo"
                                    name="logo"
                                    type="text"
                                    placeholder="URL logo"
                                    value={shopForm.logo.startsWith("http") ? shopForm.logo : ""}
                                    onChange={handleChange}
                                    style={{ flex: 1 }}
                                    required
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
                            {shopForm.logo && shopForm.logo.startsWith("http") && (
                                <img
                                    src={shopForm.logo}
                                    alt="Logo preview"
                                    className="registershop-preview-img"
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="coverImage">Ảnh bìa (URL hoặc tải ảnh) *</label>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    id="coverImage"
                                    name="coverImage"
                                    type="text"
                                    placeholder="URL ảnh bìa"
                                    value={shopForm.coverImage.startsWith("http") ? shopForm.coverImage : ""}
                                    onChange={handleChange}
                                    style={{ flex: 1 }}
                                    required
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
                            {shopForm.coverImage && shopForm.coverImage.startsWith("http") && (
                                <img
                                    src={shopForm.coverImage}
                                    alt="Cover preview"
                                    className="registershop-preview-img"
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="qrBanking">QR Banking (URL)</label>
                            <input
                                id="qrBanking"
                                name="qrBanking"
                                type="text"
                                placeholder="URL QR Banking"
                                value={shopForm.qrBanking}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <input type="hidden" name="userID" value={shopForm.userID} />
                    {error && (
                        <div style={{ color: "#e74c3c", marginBottom: 8, fontSize: 14 }}>{error}</div>
                    )}
                    {success && (
                        <div style={{ color: "#27ae60", marginBottom: 8, fontSize: 14 }}>{success}</div>
                    )}
                    <button className="registershop-btn" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Đăng Ký Shop"}
                    </button>
                </form>
                <a className="registershop-link" href="/login">
                    Đã có tài khoản? Đăng nhập
                </a>
            </div>
        </div>
    );
};

export default RegisterShop;