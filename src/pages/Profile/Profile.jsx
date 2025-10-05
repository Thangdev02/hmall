"use client"

import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Nav, Image, Spinner, Table, Pagination, Modal, Badge } from "react-bootstrap";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { getUser, editProfile, changePassword } from "../../api/auth";
import { uploadMultipleFilesUser } from "../../api/upload";
import { getFavoriteProducts, favoriteProduct } from "../../api/product";
import { TrashFill, EyeFill, CreditCard, Heart, HeartFill } from "react-bootstrap-icons";

import LoadingSpinner from "../../components/LoadingSpinner";
import "./Profile.css";
import { getOrdersByUser, cancelOrder, createQRPayment } from "../../api/oder";

const BASE_API_URL = "https://hmstoresapi.eposh.io.vn/";

const Profile = () => {
    const token = localStorage.getItem("token");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("info");
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState("");
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // States for favorite products
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [favoriteCurrentPage, setFavoriteCurrentPage] = useState(1);
    const [favoriteTotalPages, setFavoriteTotalPages] = useState(1);
    const [favoriteActionLoading, setFavoriteActionLoading] = useState({});
    const [favoriteMessage, setFavoriteMessage] = useState("");

    // States for cancel order
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState("");
    const [cancelError, setCancelError] = useState("");

    // States for online payment
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [qrUrl, setQrUrl] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);

    const fileInputRef = useRef();

    // Order Status Configuration
    const ORDER_STATUS = {
        WaitForPayment: { label: 'Chờ thanh toán', variant: 'warning' },
        Paid: { label: 'Đã thanh toán', variant: 'info' },
        Cancelled: { label: 'Đã hủy', variant: 'danger' },
        Completed: { label: 'Hoàn thành', variant: 'success' }
    };

    // Format date for input
    const formatDateForInput = (dateString) => {
        if (!dateString || dateString === "2025-10-05") return "2025-10-05";
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return "2025-10-05";
        }
    };

    // Set tab from URL parameter
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['info', 'password', 'orders', 'favorites'].includes(tabParam)) {
            setTab(tabParam);
        }
    }, [searchParams]);

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            try {
                const res = await getUser(token);
                console.log("User data from API:", res.data);

                // Format dbo từ API về định dạng YYYY-MM-DD cho input date
                const userData = { ...res.data };
                if (userData.dbo) {
                    userData.dbo = formatDateForInput(userData.dbo);
                }

                setUser(userData);
                setForm(userData);
            } catch (err) {
                console.error("Error fetching user:", err);
                setUser(null);
            }
            setLoading(false);
        }
        fetchUser();
    }, [token]);

    useEffect(() => {
        async function fetchOrders() {
            if (tab === "orders") {
                setOrdersLoading(true);
                try {
                    const res = await getOrdersByUser({ pageNumber: currentPage, pageSize: 5 }, token);
                    if (res.statusCode === 200) {
                        setOrders(res.data.items || []);
                        setTotalPages(res.data.totalPages || 1);
                    } else {
                        setOrders([]);
                        setTotalPages(1);
                    }
                } catch {
                    setOrders([]);
                    setTotalPages(1);
                }
                setOrdersLoading(false);
            }
        }
        fetchOrders();
    }, [tab, token, currentPage]);

    // Fetch favorite products
    useEffect(() => {
        async function fetchFavoriteProducts() {
            if (tab === "favorites") {
                setFavoritesLoading(true);
                try {
                    const res = await getFavoriteProducts({ pageNumber: favoriteCurrentPage, pageSize: 6 }, token);
                    if (res.statusCode === 200) {
                        setFavoriteProducts(res.data.items || []);
                        setFavoriteTotalPages(res.data.totalPages || 1);
                    } else {
                        setFavoriteProducts([]);
                        setFavoriteTotalPages(1);
                    }
                } catch (err) {
                    console.error("Error fetching favorite products:", err);
                    setFavoriteProducts([]);
                    setFavoriteTotalPages(1);
                }
                setFavoritesLoading(false);
            }
        }
        fetchFavoriteProducts();
    }, [tab, token, favoriteCurrentPage]);

    // Clear messages
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(false);
                setError("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    useEffect(() => {
        if (pwSuccess || pwError) {
            const timer = setTimeout(() => {
                setPwSuccess(false);
                setPwError("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [pwSuccess, pwError]);

    useEffect(() => {
        if (cancelSuccess || cancelError) {
            const timer = setTimeout(() => {
                setCancelSuccess("");
                setCancelError("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [cancelSuccess, cancelError]);

    useEffect(() => {
        if (favoriteMessage) {
            const timer = setTimeout(() => {
                setFavoriteMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [favoriteMessage]);

    // Handle favorite toggle in favorites tab
    const handleRemoveFavorite = async (productId) => {
        setFavoriteActionLoading(prev => ({ ...prev, [productId]: true }));

        try {
            const response = await favoriteProduct(productId, token);

            if (response?.statusCode === 200) {
                // Remove from favorites list
                setFavoriteProducts(prev => prev.filter(product => product.productID !== productId));
                setFavoriteMessage("Đã bỏ khỏi danh sách yêu thích!");
            } else {
                setFavoriteMessage(response?.message || "Có lỗi xảy ra!");
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
            setFavoriteMessage("Có lỗi xảy ra khi cập nhật yêu thích!");
        } finally {
            setFavoriteActionLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Handle avatar change
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarUploading(true);
        try {
            const res = await uploadMultipleFilesUser({ files: [file] }, token);
            if (res?.files?.[0]) {
                const avatarUrl = `${BASE_API_URL}${res.files[0]}`;
                setForm(prev => ({ ...prev, avatar: avatarUrl }));

                // Auto save avatar với tất cả data hiện tại
                const profileData = {
                    userName: form.userName || "",
                    email: form.email || "",
                    fullName: form.fullName && form.fullName !== "string" ? form.fullName : "",
                    phoneNumber: form.phoneNumber || "",
                    gender: form.gender && form.gender !== "string" ? form.gender : "",
                    dbo: form.dbo || "2025-10-05",
                    address: form.address && form.address !== "string" ? form.address : "",
                    avatar: avatarUrl
                };

                const profileRes = await editProfile(profileData, token);
                if (profileRes.statusCode === 200) {
                    setSuccess(true);
                    // Refresh user data
                    const userRes = await getUser(token);
                    const userData = { ...userRes.data };
                    if (userData.dbo) {
                        userData.dbo = formatDateForInput(userData.dbo);
                    }
                    setUser(userData);
                    setForm(userData);
                }
            }
        } catch (err) {
            console.error("Avatar upload error:", err);
            setError("Tải ảnh thất bại!");
        }
        setAvatarUploading(false);
    };

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle save profile
    const handleSave = async () => {
        try {
            // Lấy tất cả data từ form hiện tại, bao gồm cả email và userName
            const profileData = {
                userName: form.userName || "",
                email: form.email || "",
                fullName: form.fullName && form.fullName !== "string" ? form.fullName : "",
                phoneNumber: form.phoneNumber || "",
                gender: form.gender && form.gender !== "string" ? form.gender : "",
                dbo: form.dbo || "2025-10-05",
                address: form.address && form.address !== "string" ? form.address : "",
                avatar: form.avatar && form.avatar !== "string" ? form.avatar : ""
            };

            console.log("Profile data being sent:", profileData);

            const res = await editProfile(profileData, token);
            if (res.statusCode === 200) {
                setSuccess(true);
                setEditMode(false);
                // Tự động refresh lại data từ API sau khi save thành công
                const userRes = await getUser(token);
                const userData = { ...userRes.data };
                if (userData.dbo) {
                    userData.dbo = formatDateForInput(userData.dbo);
                }
                setUser(userData);
                setForm(userData);
            } else {
                setError(res.message || "Cập nhật thất bại!");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            setError("Cập nhật thất bại!");
        }
    };

    // Handle password change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPwForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSave = async () => {
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError("Mật khẩu mới không khớp!");
            return;
        }

        try {
            const res = await changePassword({
                oldPassword: pwForm.oldPassword,
                newPassword: pwForm.newPassword
            }, token);

            if (res.statusCode === 200) {
                setPwSuccess(true);
                setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setPwError(res.message || "Đổi mật khẩu thất bại!");
            }
        } catch (err) {
            console.error("Password change error:", err);
            setPwError("Đổi mật khẩu thất bại!");
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFavoritePageChange = (page) => {
        setFavoriteCurrentPage(page);
    };

    // Handle cancel order
    const handleShowCancelModal = (order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            setCancelling(true);
            const response = await cancelOrder({ orderID: selectedOrder.orderID }, token);

            if (response.statusCode === 200) {
                setCancelSuccess('Hủy đơn hàng thành công!');
                setShowCancelModal(false);
                // Refresh orders list
                const res = await getOrdersByUser({ pageNumber: currentPage, pageSize: 5 }, token);
                if (res.statusCode === 200) {
                    setOrders(res.data.items || []);
                }
            } else {
                setCancelError(response.message || 'Không thể hủy đơn hàng');
            }
        } catch (err) {
            setCancelError('Đã có lỗi xảy ra khi hủy đơn hàng');
            console.error('Error cancelling order:', err);
        } finally {
            setCancelling(false);
        }
    };

    // Handle online payment
    const handleShowPaymentModal = async (order) => {
        setSelectedOrder(order);
        setPaymentLoading(true);
        setShowPaymentModal(true);

        try {
            const qrData = { orderID: order.orderID };
            const qrRes = await createQRPayment(qrData, token);

            if (qrRes && qrRes.statusCode === 200) {
                setQrUrl(qrRes.data.qrUrl);
            } else {
                setCancelError(`Lỗi tạo QR: ${qrRes.message || "Không thể tạo mã QR"}`);
                setShowPaymentModal(false);
            }
        } catch (error) {
            console.error("QR creation error:", error);
            setCancelError("Lỗi khi tạo mã QR thanh toán!");
            setShowPaymentModal(false);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePaymentComplete = async () => {
        setShowPaymentModal(false);
        setCancelSuccess("Thanh toán thành công!");

        // Refresh orders list
        const res = await getOrdersByUser({ pageNumber: currentPage, pageSize: 5 }, token);
        if (res.statusCode === 200) {
            setOrders(res.data.items || []);
        }
    };

    // Check if order can be cancelled
    const canCancelOrder = (status) => {
        return status === 'WaitForPayment' || status === 'Paid';
    };

    // Check if order needs online payment
    const needsOnlinePayment = (order) => {
        return order.paymentMethod === 'OnlineBanking' && order.status === 'WaitForPayment';
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = ORDER_STATUS[status] || ORDER_STATUS.WaitForPayment;
        return (
            <Badge bg={statusConfig.variant}>
                {statusConfig.label}
            </Badge>
        );
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Handle tab change with URL update
    const handleTabChange = (newTab) => {
        setTab(newTab);
        navigate(`/settings?tab=${newTab}`, { replace: true });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="profile-bg">
            <Container>
                <div className="profile-container">
                    <Row>
                        <Col md={4} className="mb-4">
                            <div className="profile-card text-center">
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <Image
                                        src={
                                            form.avatar && form.avatar !== "string" && form.avatar !== ""
                                                ? form.avatar
                                                : "https://ui-avatars.com/api/?name=" + encodeURIComponent(form.fullName && form.fullName !== "string" ? form.fullName : form.userName || "User")
                                        }
                                        roundedCircle
                                        className="profile-avatar"
                                        alt="avatar"
                                    />
                                    <Button
                                        variant="light"
                                        size="sm"
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            borderRadius: "50%",
                                            border: "1px solid #ccc",
                                        }}
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={avatarUploading}
                                    >
                                        {avatarUploading ? <Spinner size="sm" /> : "🖊"}
                                    </Button>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleAvatarChange}
                                        disabled={avatarUploading}
                                    />
                                </div>
                                <div className="profile-info mt-2">
                                    {form.fullName && form.fullName !== "string" ? form.fullName : form.userName}
                                </div>
                                <div className="text-muted mb-2">{form.email}</div>
                            </div>
                        </Col>
                        <Col md={8}>
                            <div className="profile-section">
                                <Nav variant="tabs" className="profile-tab mb-4">
                                    <Nav.Item>
                                        <Nav.Link
                                            active={tab === "info"}
                                            onClick={() => handleTabChange("info")}
                                            className="profile-tab-link"
                                        >
                                            Cài đặt tài khoản
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={tab === "password"}
                                            onClick={() => handleTabChange("password")}
                                            className="profile-tab-link"
                                        >
                                            Đổi mật khẩu
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={tab === "orders"}
                                            onClick={() => handleTabChange("orders")}
                                            className="profile-tab-link"
                                        >
                                            Lịch sử đơn hàng
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={tab === "favorites"}
                                            onClick={() => handleTabChange("favorites")}
                                            className="profile-tab-link"
                                        >
                                            Sản phẩm yêu thích
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                {/* Message Alert */}
                                {favoriteMessage && (
                                    <Alert
                                        variant={favoriteMessage.includes("lỗi") ? "danger" : "success"}
                                        className="mb-3"
                                        dismissible
                                        onClose={() => setFavoriteMessage("")}
                                    >
                                        {favoriteMessage}
                                    </Alert>
                                )}

                                {/* Info Tab */}
                                {tab === "info" && (
                                    <>
                                        {success && <Alert variant="success">Cập nhật thành công!</Alert>}
                                        {error && <Alert variant="danger">{error}</Alert>}

                                        <h3 className="profile-form-title">Thông tin cá nhân</h3>
                                        <Form>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Tên đăng nhập</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="userName"
                                                            value={form.userName || ""}
                                                            onChange={handleChange}
                                                            disabled={!editMode}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Email</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            name="email"
                                                            value={form.email || ""}
                                                            onChange={handleChange}
                                                            disabled={!editMode}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Họ và tên</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="fullName"
                                                            value={form.fullName && form.fullName !== "string" ? form.fullName : ""}
                                                            onChange={handleChange}
                                                            disabled={!editMode}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Số điện thoại</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="phoneNumber"
                                                            value={form.phoneNumber || ""}
                                                            onChange={handleChange}
                                                            disabled={!editMode}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Địa chỉ</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="address"
                                                            value={form.address && form.address !== "string" ? form.address : ""}
                                                            onChange={handleChange}
                                                            disabled={!editMode}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Giới tính</Form.Label>
                                                        <Form.Select
                                                            name="gender"
                                                            value={form.gender && form.gender !== "string" ? form.gender : ""}
                                                            onChange={handleChange}
                                                            disabled={!editMode}
                                                        >
                                                            <option value="">Chọn giới tính</option>
                                                            <option value="Nam">Nam</option>
                                                            <option value="Nữ">Nữ</option>
                                                            <option value="Khác">Khác</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Ngày sinh</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            name="dbo"
                                                            value={form.dbo || "2025-10-05"}
                                                            onChange={handleChange}
                                                            disabled={!editMode}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <div className="d-flex gap-2">
                                                {!editMode ? (
                                                    <Button variant="primary" onClick={() => setEditMode(true)}>
                                                        Chỉnh sửa
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button variant="success" onClick={handleSave}>
                                                            Lưu thay đổi
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => {
                                                                setEditMode(false);
                                                                // Reset form về data gốc khi hủy
                                                                setForm(user);
                                                            }}
                                                        >
                                                            Hủy
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </Form>
                                    </>
                                )}

                                {/* Password Tab */}
                                {tab === "password" && (
                                    <>
                                        {pwSuccess && <Alert variant="success">Đổi mật khẩu thành công!</Alert>}
                                        {pwError && <Alert variant="danger">{pwError}</Alert>}

                                        <h3 className="profile-form-title">Đổi mật khẩu</h3>
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mật khẩu hiện tại</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="oldPassword"
                                                    value={pwForm.oldPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mật khẩu mới</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="newPassword"
                                                    value={pwForm.newPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={pwForm.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </Form.Group>
                                            <Button variant="primary" onClick={handlePasswordSave}>
                                                Đổi mật khẩu
                                            </Button>
                                        </Form>
                                    </>
                                )}

                                {/* Orders Tab */}
                                {tab === "orders" && (
                                    <>
                                        {cancelSuccess && <Alert variant="success">{cancelSuccess}</Alert>}
                                        {cancelError && <Alert variant="danger">{cancelError}</Alert>}

                                        {ordersLoading ? (
                                            <LoadingSpinner />
                                        ) : orders.length === 0 ? (
                                            <p className="text-muted">Chưa có đơn hàng nào.</p>
                                        ) : (
                                            <>
                                                <h3 className="profile-form-title">Lịch sử đơn hàng</h3>
                                                <Table striped bordered hover responsive className="orders-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Mã đơn hàng</th>
                                                            <th>Tổng tiền</th>
                                                            <th>Trạng thái</th>
                                                            <th>Ngày tạo</th>
                                                            <th>Địa chỉ giao hàng</th>
                                                            <th>Người nhận</th>
                                                            <th>Số điện thoại</th>
                                                            <th>Phương thức thanh toán</th>
                                                            <th>Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orders.map(order => (
                                                            <tr key={order.orderID}>
                                                                <td>{order.orderCode}</td>
                                                                <td>{formatCurrency(order.totalAmounts)}</td>
                                                                <td>{getStatusBadge(order.status)}</td>
                                                                <td>{new Date(order.createdDate).toLocaleString("vi-VN")}</td>
                                                                <td>{order.deliveryAddress}</td>
                                                                <td>{order.receiverName}</td>
                                                                <td>{order.receiverPhone}</td>
                                                                <td>{order.paymentMethod === "Direct" ? "Trực tiếp" : "Thanh toán online"}</td>
                                                                <td>
                                                                    <div className="d-flex gap-1">
                                                                        {needsOnlinePayment(order) && (
                                                                            <Button
                                                                                variant="outline-success"
                                                                                size="sm"
                                                                                onClick={() => handleShowPaymentModal(order)}
                                                                                title="Thanh toán online"
                                                                            >
                                                                                <CreditCard size={12} />
                                                                            </Button>
                                                                        )}
                                                                        {canCancelOrder(order.status) && (
                                                                            <Button
                                                                                variant="outline-danger"
                                                                                size="sm"
                                                                                onClick={() => handleShowCancelModal(order)}
                                                                                title="Hủy đơn hàng"
                                                                            >
                                                                                <TrashFill size={12} />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                <Pagination className="justify-content-center mt-4">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                        <Pagination.Item
                                                            key={page}
                                                            active={page === currentPage}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </Pagination.Item>
                                                    ))}
                                                </Pagination>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Favorites Tab */}
                                {tab === "favorites" && (
                                    <>
                                        {favoritesLoading ? (
                                            <LoadingSpinner />
                                        ) : favoriteProducts.length === 0 ? (
                                            <div className="text-center py-5">
                                                <HeartFill size={48} color="#e0e0e0" className="mb-3" />
                                                <h5>Chưa có sản phẩm yêu thích nào</h5>
                                                <p className="text-muted">Hãy thêm sản phẩm vào danh sách yêu thích để xem tại đây</p>
                                                <Button
                                                    as={Link}
                                                    to="/products"
                                                    variant="primary"
                                                >
                                                    Khám phá sản phẩm
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="profile-form-title">Sản phẩm yêu thích</h3>
                                                <Row>
                                                    {favoriteProducts.map(product => (
                                                        <Col key={product.productID} md={6} lg={4} className="mb-4">
                                                            <Card className="h-100">
                                                                <div className="position-relative">
                                                                    <Card.Img
                                                                        variant="top"
                                                                        src={product.image}
                                                                        alt={product.productName}
                                                                        style={{ height: "200px", objectFit: "cover" }}
                                                                    />
                                                                    {/* Remove favorite button */}
                                                                    <Button
                                                                        variant="light"
                                                                        className="position-absolute top-0 end-0 m-2 rounded-circle"
                                                                        style={{
                                                                            width: "40px",
                                                                            height: "40px",
                                                                            border: "none",
                                                                            backgroundColor: "rgba(255, 255, 255, 0.9)"
                                                                        }}
                                                                        onClick={() => handleRemoveFavorite(product.productID)}
                                                                        disabled={favoriteActionLoading[product.productID]}
                                                                        title="Bỏ yêu thích"
                                                                    >
                                                                        {favoriteActionLoading[product.productID] ? (
                                                                            <Spinner size="sm" />
                                                                        ) : (
                                                                            <HeartFill color="#ff0000" size={16} />
                                                                        )}
                                                                    </Button>
                                                                </div>

                                                                <Card.Body className="d-flex flex-column">
                                                                    <Card.Title className="h6">{product.productName}</Card.Title>
                                                                    <Card.Text className="text-muted small flex-grow-1">
                                                                        {product.description?.replace(/<[^>]*>/g, '').slice(0, 100)}...
                                                                    </Card.Text>
                                                                    <div className="mt-auto">
                                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                                            <span className="fw-bold text-primary">
                                                                                {formatCurrency(product.price)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="mb-2 small text-muted">
                                                                            <strong>Shop:</strong> {product.shopName}
                                                                        </div>
                                                                        <div className="d-grid">
                                                                            <Button
                                                                                as={Link}
                                                                                to={`/products/${product.productID}`}
                                                                                variant="primary"
                                                                                size="sm"
                                                                            >
                                                                                Xem chi tiết
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                </Row>

                                                {/* Pagination for favorites */}
                                                {favoriteTotalPages > 1 && (
                                                    <Pagination className="justify-content-center mt-4">
                                                        {Array.from({ length: favoriteTotalPages }, (_, i) => i + 1).map(page => (
                                                            <Pagination.Item
                                                                key={page}
                                                                active={page === favoriteCurrentPage}
                                                                onClick={() => handleFavoritePageChange(page)}
                                                            >
                                                                {page}
                                                            </Pagination.Item>
                                                        ))}
                                                    </Pagination>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Cancel Order Modal */}
                    <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title className="text-danger">
                                <TrashFill className="me-2" />
                                Hủy đơn hàng
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedOrder && (
                                <>
                                    <Alert variant="warning">
                                        <strong>Cảnh báo!</strong> Bạn có chắc chắn muốn hủy đơn hàng này không?
                                    </Alert>
                                    <div className="mb-2">
                                        <strong>Mã đơn hàng:</strong> {selectedOrder.orderCode}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmounts)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Trạng thái hiện tại:</strong> {getStatusBadge(selectedOrder.status)}
                                    </div>
                                    <div className="text-danger">
                                        <small>* Hành động này không thể hoàn tác</small>
                                    </div>
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                                Không, giữ lại
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                            >
                                {cancelling ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Đang hủy...
                                    </>
                                ) : (
                                    <>
                                        <TrashFill className="me-2" />
                                        Có, hủy đơn hàng
                                    </>
                                )}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Online Payment Modal */}
                    <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title className="text-success">
                                <CreditCard className="me-2" />
                                Thanh toán online
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center">
                            {selectedOrder && (
                                <>
                                    <div className="mb-3">
                                        <h5>Đơn hàng: {selectedOrder.orderCode}</h5>
                                        <p>Số tiền: <strong>{formatCurrency(selectedOrder.totalAmounts)}</strong></p>
                                    </div>

                                    {paymentLoading ? (
                                        <div className="py-4">
                                            <Spinner animation="border" />
                                            <p className="mt-2">Đang tạo mã QR...</p>
                                        </div>
                                    ) : qrUrl ? (
                                        <>
                                            <div className="mb-3">
                                                <img
                                                    src={qrUrl}
                                                    alt="QR Payment Code"
                                                    style={{ maxWidth: "100%", height: "auto", border: "1px solid #ddd", borderRadius: "8px" }}
                                                />
                                            </div>
                                            <div className="text-muted">
                                                <small>Quét mã QR để thanh toán, sau đó nhấn "Hoàn thành"</small>
                                            </div>
                                        </>
                                    ) : (
                                        <Alert variant="danger">Không thể tạo mã QR thanh toán</Alert>
                                    )}
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                                Đóng
                            </Button>
                            {qrUrl && !paymentLoading && (
                                <Button variant="success" onClick={handlePaymentComplete}>
                                    Hoàn thành thanh toán
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal>
                </div>
            </Container>
        </div>
    );
};

export default Profile;