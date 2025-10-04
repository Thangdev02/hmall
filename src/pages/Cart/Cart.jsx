"use client"

import React, { useState, useEffect } from "react";
import { Container, Modal, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import "./Cart.css";
import { getCartItems, deleteCartItem, editCartItemQuantity } from "../../api/cart";
import LoadingSpinner from "../../components/LoadingSpinner";
import { createOrder, createQRPayment } from "../../api/oder";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmounts, setTotalAmounts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrUrl, setQrUrl] = useState("");
    const [checkoutForm, setCheckoutForm] = useState({
        receiverName: "",
        deliveryAddress: "",
        receiverPhone: "",
        paymentMethod: "Direct"
    });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
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
        setShowCheckoutModal(true);
    };

    // Xử lý submit form thanh toán
    const handleCheckoutSubmit = async () => {
        const { receiverName, deliveryAddress, receiverPhone, paymentMethod } = checkoutForm;
        if (!receiverName || !deliveryAddress || !receiverPhone) {
            setToastMessage("Vui lòng điền đầy đủ thông tin!");
            setShowToast(true);
            return;
        }

        const cartItemIDs = cartItems.map(item => item.cartItemID);
        const orderData = {
            receiverName,
            deliveryAddress,
            receiverPhone,
            cartItemIDs,
            paymentMethod
        };

        try {
            // Bước 1: Tạo order trước
            console.log("Creating order with data:", orderData);
            const orderRes = await createOrder(orderData, token);
            console.log("Full order response:", orderRes);

            if (orderRes && orderRes.statusCode === 200) {
                // Lấy orderID từ data array - theo response structure mới
                const orderID = orderRes.data?.[0];
                console.log("Extracted orderID:", orderID);

                if (!orderID) {
                    console.error("OrderID not found in response:", orderRes);
                    setToastMessage("Không thể lấy ID đơn hàng!");
                    setShowToast(true);
                    return;
                }

                if (paymentMethod === "OnlineBanking") {
                    // Delay để đảm bảo order đã được lưu vào database
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Bước 2: Tạo QR payment với orderID
                    try {
                        const qrData = {
                            orderID: orderID
                        };

                        console.log("QR Data being sent:", qrData);
                        const qrRes = await createQRPayment(qrData, token);
                        console.log("QR Response:", qrRes);

                        if (qrRes && qrRes.statusCode === 200) {
                            setQrUrl(qrRes.data.qrUrl);
                            setShowCheckoutModal(false);
                            setShowQRModal(true);
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
                    // Thanh toán trực tiếp
                    setToastMessage("Đặt hàng thành công!");
                    setShowToast(true);
                    setShowCheckoutModal(false);
                    setTimeout(async () => {
                        const cartRes = await getCartItems({}, token);
                        const apiCart = cartRes?.data?.items?.[0];
                        setCartItems(apiCart?.cartItems || []);
                        setTotalAmounts(apiCart?.totalAmounts || 0);
                    }, 500);
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

    // Xử lý khi hoàn thành thanh toán QR
    const handleQRPaymentComplete = async () => {
        setShowQRModal(false);
        setToastMessage("Đặt hàng và thanh toán thành công!");
        setShowToast(true);

        // Reload cart sau khi thanh toán thành công
        setTimeout(async () => {
            const cartRes = await getCartItems({}, token);
            const apiCart = cartRes?.data?.items?.[0];
            setCartItems(apiCart?.cartItems || []);
            setTotalAmounts(apiCart?.totalAmounts || 0);
        }, 500);
    };

    // Xử lý thay đổi form thanh toán
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setCheckoutForm(prev => ({ ...prev, [name]: value }));
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
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ giao hàng</Form.Label>
                            <Form.Control
                                type="text"
                                name="deliveryAddress"
                                value={checkoutForm.deliveryAddress}
                                onChange={handleFormChange}
                                placeholder="Nhập địa chỉ giao hàng"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="receiverPhone"
                                value={checkoutForm.receiverPhone}
                                onChange={handleFormChange}
                                placeholder="Nhập số điện thoại"
                            />
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

            {/* Modal QR Payment */}
            <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thanh toán QR Code</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <div className="mb-3">
                        <h5>Quét mã QR để thanh toán</h5>
                        <p>Số tiền: <strong>{totalAmounts.toLocaleString()}đ</strong></p>
                    </div>
                    {qrUrl && (
                        <div className="mb-3">
                            <img
                                src={qrUrl}
                                alt="QR Payment Code"
                                style={{ maxWidth: "100%", height: "auto", border: "1px solid #ddd", borderRadius: "8px" }}
                            />
                        </div>
                    )}
                    <div className="text-muted">
                        <small>Sau khi thanh toán thành công, vui lòng nhấn "Hoàn thành"</small>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowQRModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="success" onClick={handleQRPaymentComplete}>
                        Hoàn thành
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