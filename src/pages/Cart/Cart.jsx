"use client"

import React, { useState, useEffect } from "react";
import { Container, Modal, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { getCartItems, deleteCartItem, editCartItemQuantity } from "../../api/cart";
import LoadingSpinner from "../../components/LoadingSpinner";
import { createOrder, createQRPayment } from "../../api/oder";

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalAmounts, setTotalAmounts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({
        receiverName: "",
        deliveryAddress: "",
        receiverPhone: "",
        paymentMethod: "Direct"
    });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    // ✅ Thêm state cho validation errors
    const [formErrors, setFormErrors] = useState({});
    const token = localStorage.getItem("token");

    // Lấy giỏ hàng từ API
    useEffect(() => {
        async function fetchCart() {
            setLoading(true);
            const res = await getCartItems({}, token);
            const apiCart = res?.data?.items?.[0];
            setCartItems(apiCart?.cartItems || []);
            setTotalAmounts(apiCart?.totalAmounts || 0);
            setLoading(false);
        }
        fetchCart();
    }, [token]);

    // Xử lý tăng/giảm số lượng
    const handleQuantityChange = async (cartItemID, newQuantity) => {
        if (newQuantity < 1) return;
        await editCartItemQuantity({ cartItemID, quantity: newQuantity }, token);
        // Reload cart
        const res = await getCartItems({}, token);
        const apiCart = res?.data?.items?.[0];
        setCartItems(apiCart?.cartItems || []);
        setTotalAmounts(apiCart?.totalAmounts || 0);
    };

    // Xóa sản phẩm khỏi giỏ
    const handleRemove = async (cartItemID) => {
        await deleteCartItem(cartItemID, token);
        // Reload cart
        const res = await getCartItems({}, token);
        const apiCart = res?.data?.items?.[0];
        setCartItems(apiCart?.cartItems || []);
        setTotalAmounts(apiCart?.totalAmounts || 0);
    };

    // ✅ Validation functions
    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    const validateForm = () => {
        const errors = {};
        const { receiverName, deliveryAddress, receiverPhone } = checkoutForm;

        if (!receiverName.trim()) {
            errors.receiverName = "Vui lòng nhập tên người nhận";
        }

        if (!deliveryAddress.trim()) {
            errors.deliveryAddress = "Vui lòng nhập địa chỉ giao hàng";
        }

        if (!receiverPhone.trim()) {
            errors.receiverPhone = "Vui lòng nhập số điện thoại";
        } else if (!validatePhone(receiverPhone)) {
            errors.receiverPhone = "Số điện thoại phải có đúng 10 chữ số";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Xử lý mở modal thanh toán
    const handleShowCheckoutModal = () => {
        if (!token) {
            setToastMessage("Vui lòng đăng nhập để thanh toán!");
            setShowToast(true);
            return;
        }
        setCheckoutForm({
            receiverName: "",
            deliveryAddress: "",
            receiverPhone: "",
            paymentMethod: "Direct"
        });
        setFormErrors({}); // Reset errors
        setShowCheckoutModal(true);
    };

    // Xử lý submit form thanh toán
    const handleCheckoutSubmit = async () => {
        // ✅ Validate form trước khi submit
        if (!validateForm()) {
            setToastMessage("Vui lòng điền đầy đủ và chính xác thông tin!");
            setShowToast(true);
            return;
        }

        const { receiverName, deliveryAddress, receiverPhone, paymentMethod } = checkoutForm;
        const cartItemIDs = cartItems.map(item => item.cartItemID);
        const orderData = {
            receiverName,
            deliveryAddress,
            receiverPhone,
            cartItemIDs,
            paymentMethod
        };

        try {
            console.log("Creating order with data:", orderData);
            const orderRes = await createOrder(orderData, token);
            console.log("Full order response:", orderRes);

            if (orderRes && orderRes.statusCode === 200) {
                const orderID = orderRes.data?.[0];
                console.log("Extracted orderID:", orderID);

                if (!orderID) {
                    console.error("OrderID not found in response:", orderRes);
                    setToastMessage("Không thể lấy ID đơn hàng!");
                    setShowToast(true);
                    return;
                }

                if (paymentMethod === "OnlineBanking") {
                    // Thanh toán online - tạo QR nhưng chuyển luôn đến Profile
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    try {
                        const qrData = { orderID: orderID };
                        console.log("QR Data being sent:", qrData);
                        const qrRes = await createQRPayment(qrData, token);
                        console.log("QR Response:", qrRes);

                        if (qrRes && qrRes.statusCode === 200) {
                            // Tạo QR thành công - chuyển luôn đến Profile
                            setToastMessage("Đặt hàng thành công!");
                            setShowToast(true);
                            setShowCheckoutModal(false);

                            setTimeout(() => {
                                navigate('/settings?tab=orders');
                            }, 1500);
                        } else {
                            setToastMessage(`Lỗi tạo QR: ${qrRes.message || "Không thể tạo mã QR"}`);
                            setShowToast(true);
                        }
                    } catch (error) {
                        console.error("QR creation error:", error);
                        setToastMessage("Lỗi khi tạo mã QR thanh toán!");
                        setShowToast(true);
                    }
                } else {
                    // Thanh toán trực tiếp - chuyển luôn đến Profile
                    setToastMessage("Đặt hàng thành công!");
                    setShowToast(true);
                    setShowCheckoutModal(false);

                    setTimeout(() => {
                        navigate('/settings?tab=orders');
                    }, 1500);
                }
            } else {
                setToastMessage(orderRes.message || "Đặt hàng thất bại!");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Order creation error:", error);
            setToastMessage("Đặt hàng thất bại!");
            setShowToast(true);
        }
    };

    // ✅ Xử lý thay đổi form thanh toán với validation
    const handleFormChange = (e) => {
        const { name, value } = e.target;

        // ✅ Xử lý riêng cho số điện thoại
        if (name === "receiverPhone") {
            // Chỉ cho phép nhập số và tối đa 10 ký tự
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setCheckoutForm(prev => ({ ...prev, [name]: numericValue }));

            // Clear error khi user đang nhập
            if (formErrors[name]) {
                setFormErrors(prev => ({ ...prev, [name]: "" }));
            }
        } else {
            setCheckoutForm(prev => ({ ...prev, [name]: value }));

            // Clear error khi user đang nhập
            if (formErrors[name]) {
                setFormErrors(prev => ({ ...prev, [name]: "" }));
            }
        }
    };

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <div className="cart-container-ui">
                <h2>Giỏ hàng của bạn</h2>
                {loading ? (
                    <LoadingSpinner />
                ) : cartItems.length === 0 ? (
                    <div>Giỏ hàng trống.</div>
                ) : (
                    cartItems.map(item => (
                        <div className="cart-item-ui" key={item.cartItemID}>
                            <img src={item.productImage} alt={item.productName} className="cart-item-img-ui" />
                            <div className="cart-item-info-ui">
                                <div className="cart-item-name-ui">{item.productName}</div>
                                <div className="cart-item-price-ui">{item.unitPrice.toLocaleString()}đ</div>
                                <div className="cart-qty-ui">
                                    <button onClick={() => handleQuantityChange(item.cartItemID, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item.cartItemID, item.quantity + 1)}>+</button>
                                </div>
                                <div className="cart-item-total-ui">
                                    Thành tiền: {item.totalAmounts.toLocaleString()}đ
                                </div>
                            </div>
                            <button className="cart-remove-btn-ui" onClick={() => handleRemove(item.cartItemID)} title="Xóa sản phẩm">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="#cc0fb9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 11v6M14 11v6" stroke="#cc0fb9" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}

                <div className="cart-summary-ui">
                    <div>
                        <span>Tạm tính:</span>
                        <span>{totalAmounts.toLocaleString()}đ</span>
                    </div>
                    <div className="cart-total-ui">
                        <span>Tổng cộng:</span>
                        <span>{totalAmounts.toLocaleString()}đ</span>
                    </div>
                </div>
                <button className="cart-checkout-btn-ui" disabled={cartItems.length === 0} onClick={handleShowCheckoutModal}>
                    THANH TOÁN
                </button>
            </div>

            {/* Modal thanh toán */}
            <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thông tin thanh toán</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên người nhận</Form.Label>
                            <Form.Control
                                type="text"
                                name="receiverName"
                                value={checkoutForm.receiverName}
                                onChange={handleFormChange}
                                placeholder="Nhập tên người nhận"
                                isInvalid={!!formErrors.receiverName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.receiverName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ giao hàng</Form.Label>
                            <Form.Control
                                type="text"
                                name="deliveryAddress"
                                value={checkoutForm.deliveryAddress}
                                onChange={handleFormChange}
                                placeholder="Nhập địa chỉ giao hàng"
                                isInvalid={!!formErrors.deliveryAddress}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.deliveryAddress}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="receiverPhone"
                                value={checkoutForm.receiverPhone}
                                onChange={handleFormChange}
                                placeholder="Nhập số điện thoại (10 chữ số)"
                                maxLength={10}
                                isInvalid={!!formErrors.receiverPhone}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.receiverPhone}
                            </Form.Control.Feedback>
                            {/* ✅ Hiển thị trạng thái nhập số điện thoại */}
                            <Form.Text className="text-muted">
                                {checkoutForm.receiverPhone.length}/10 chữ số
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Phương thức thanh toán</Form.Label>
                            <Form.Select
                                name="paymentMethod"
                                value={checkoutForm.paymentMethod}
                                onChange={handleFormChange}
                            >
                                <option value="Direct">Trực tiếp</option>
                                <option value="OnlineBanking">Thanh toán online</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleCheckoutSubmit}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast thông báo */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    bg={toastMessage.includes("thất bại") || toastMessage.includes("đăng nhập") || toastMessage.includes("điền đầy đủ") || toastMessage.includes("Lỗi") ? "danger" : "success"}
                >
                    <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default Cart;