"use client"

import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Nav, Image, Spinner, Table, Pagination, Modal, Badge } from "react-bootstrap";
import { getUser, editProfile } from "../../api/auth";
import { uploadMultipleFilesUser } from "../../api/upload";
import { TrashFill, EyeFill } from "react-bootstrap-icons";

import LoadingSpinner from "../../components/LoadingSpinner";
import "./Profile.css";
import { getOrdersByUser, cancelOrder } from "../../api/oder";

const BASE_API_URL = "https://hmstoresapi.eposh.io.vn/";

const Profile = () => {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
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

    // States for cancel order
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState("");
    const [cancelError, setCancelError] = useState("");

    const fileInputRef = useRef();

    // Order Status Configuration
    const ORDER_STATUS = {
        WaitForPayment: { label: 'Chờ thanh toán', variant: 'warning' },
        Paid: { label: 'Đã thanh toán', variant: 'info' },
        Cancelled: { label: 'Đã hủy', variant: 'danger' },
        Completed: { label: 'Hoàn thành', variant: 'success' }
    };

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            try {
                const res = await getUser(token);
                setUser(res.data);
                setForm(res.data);
            } catch {
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

    // Clear messages
    useEffect(() => {
        if (cancelSuccess || cancelError) {
            const timer = setTimeout(() => {
                setCancelSuccess("");
                setCancelError("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [cancelSuccess, cancelError]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const res = await uploadMultipleFilesUser(
                { files: [file], customeFolder: "avatars" },
                token
            );
            const relativePath = res?.files?.[0];
            if (relativePath) {
                const imgUrl = `${BASE_API_URL}${relativePath}`;
                const updateRes = await editProfile({ ...form, avatar: imgUrl }, token);
                if (updateRes.statusCode === 200) {
                    setForm((prev) => ({ ...prev, avatar: imgUrl }));
                    setUser((prev) => ({ ...prev, avatar: imgUrl }));
                }
            }
        } catch { /* empty */ }
        setAvatarUploading(false);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await editProfile(form, token);
            if (res.statusCode === 200) {
                setUser(form);
                setEditMode(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            }
        } catch { /* empty */ }
    };

    const handlePwChange = (e) => {
        setPwForm({ ...pwForm, [e.target.name]: e.target.value });
    };

    const handlePwSubmit = (e) => {
        e.preventDefault();
        setPwError("");
        if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
            setPwError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError("Mật khẩu mới không khớp.");
            return;
        }
        setPwSuccess(true);
        setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setPwSuccess(false), 2000);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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

    // Check if order can be cancelled
    const canCancelOrder = (status) => {
        return status === 'WaitForPayment' || status === 'Paid';
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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="profile-bg">
            <div className="profile-container">
                <Row>
                    <Col md={4} className="mb-4">
                        <div className="profile-card text-center">
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <Image
                                    src={
                                        form.avatar && form.avatar !== "Chưa cập nhật"
                                            ? form.avatar
                                            : "https://ui-avatars.com/api/?name=" + encodeURIComponent(form.fullName || form.userName || "User")
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
                            <div className="profile-info mt-2">{form.fullName || form.userName}</div>
                            <div className="text-muted mb-2">{form.email}</div>
                        </div>
                    </Col>
                    <Col md={8}>
                        <div className="profile-section">
                            <Nav variant="tabs" className="profile-tab mb-4">
                                <Nav.Item>
                                    <Nav.Link
                                        active={tab === "info"}
                                        onClick={() => setTab("info")}
                                        className="profile-tab-link"
                                    >
                                        Cài đặt tài khoản
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={tab === "password"}
                                        onClick={() => setTab("password")}
                                        className="profile-tab-link"
                                    >
                                        Đổi mật khẩu
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={tab === "orders"}
                                        onClick={() => setTab("orders")}
                                        className="profile-tab-link"
                                    >
                                        Lịch sử đơn hàng
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            {tab === "info" && (
                                <>
                                    {success && <Alert variant="success">Cập nhật thành công!</Alert>}
                                    <h3 className="profile-form-title">Thông tin cá nhân</h3>
                                    <Form className="profile-form" onSubmit={handleSave}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Họ tên</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={form.fullName || ""}
                                                        name="fullName"
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
                                                        value={form.phoneNumber || ""}
                                                        name="phoneNumber"
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
                                                        value={form.email || ""}
                                                        name="email"
                                                        onChange={handleChange}
                                                        disabled={!editMode}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Địa chỉ</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={form.address || ""}
                                                        name="address"
                                                        onChange={handleChange}
                                                        disabled={!editMode}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Giới tính</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={form.gender || ""}
                                                        name="gender"
                                                        onChange={handleChange}
                                                        disabled={!editMode}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Tên đăng nhập</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={form.userName || ""}
                                                        name="userName"
                                                        disabled
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        {editMode ? (
                                            <div className="d-flex gap-2">
                                                <Button type="submit" variant="outline-primary">
                                                    Lưu thay đổi
                                                </Button>
                                                <Button variant="outline-primary" onClick={() => { setEditMode(false); setForm(user); }}>
                                                    Hủy
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline-primary" onClick={() => setEditMode(true)}>
                                                Chỉnh sửa
                                            </Button>
                                        )}
                                    </Form>
                                </>
                            )}

                            {tab === "password" && (
                                <>
                                    {pwSuccess && <Alert variant="success">Đổi mật khẩu thành công!</Alert>}
                                    {pwError && <Alert variant="danger">{pwError}</Alert>}
                                    <h3 className="profile-form-title">Đổi mật khẩu</h3>
                                    <Form className="profile-form" onSubmit={handlePwSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mật khẩu cũ</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="oldPassword"
                                                value={pwForm.oldPassword}
                                                onChange={handlePwChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mật khẩu mới</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="newPassword"
                                                value={pwForm.newPassword}
                                                onChange={handlePwChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={pwForm.confirmPassword}
                                                onChange={handlePwChange}
                                            />
                                        </Form.Group>
                                        <Button type="submit" className="profile-btn">
                                            Đổi mật khẩu
                                        </Button>
                                    </Form>
                                </>
                            )}

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
            </div>
        </div>
    );
};

export default Profile;