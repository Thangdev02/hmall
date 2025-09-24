"use client"

import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Button, Badge, Card, Form, Modal, Toast, ToastContainer } from "react-bootstrap"
import { motion } from "framer-motion"
import { Star, Heart } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import { getProductDetail } from "../../api/product"
import { addItemToCart } from "../../api/cart"
import LoadingSpinner from "../../components/LoadingSpinner"
import "./ProductDetail.css"

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState("")
  const [reviews, setReviews] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newReview, setNewReview] = useState({ user: "", rating: 5, comment: "" })
  const [isLiked, setIsLiked] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [cartQuantity, setCartQuantity] = useState(1)
  const token = localStorage.getItem("token")

  useEffect(() => {
    setLoading(true)
    getProductDetail(id)
      .then(res => {
        const p = res?.data
        setProduct(p)
        const allImages = [
          p?.commonImage && (p.commonImage.startsWith("http") ? p.commonImage : `${import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn"}/${p.commonImage}`),
          ...(p?.moreImages?.map(img => img.url.startsWith("http") ? img.url : `${import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn"}/${img.url}`) || [])
        ].filter(Boolean)
        setSelectedImage(allImages[0] || "")
        setProduct(prev => ({ ...prev, allImages }))
        setReviews([])
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!product) {
    return (
      <Container style={{ paddingTop: "120px", minHeight: "100vh" }}>
        <h2 className="text-center text-muted">Sản phẩm không tồn tại</h2>
        <div className="text-center mt-3">
          <Link to="/products">
            <Button variant="primary">Quay lại cửa hàng</Button>
          </Link>
        </div>
      </Container>
    )
  }

  const handleSubmitReview = () => {
    if (!newReview.user || !newReview.comment) return
    const today = new Date().toLocaleDateString("vi-VN")
    setReviews([...reviews, { ...newReview, date: today }])
    setNewReview({ user: "", rating: 5, comment: "" })
    setShowModal(false)
  }

  const handleLikeToggle = () => {
    setIsLiked(!isLiked)
  }

  const handleAddToCart = async () => {
    // Check if product is out of stock
    if (product.stock === 0) {
      setToastMessage("Sản phẩm đã hết hàng!")
      setShowToast(true)
      return
    }

    // Check if quantity exceeds stock
    if (cartQuantity > product.stock) {
      setToastMessage(`Chỉ còn ${product.stock} sản phẩm trong kho!`)
      setShowToast(true)
      return
    }

    // Check if user is logged in
    if (!token) {
      setToastMessage("Vui lòng đăng nhập để thêm vào giỏ hàng!")
      setShowToast(true)
      return
    }

    try {
      const res = await addItemToCart({ productId: product.id, quantity: cartQuantity }, token)
      if (res && res.statusCode === 200) {
        setToastMessage(`Đã thêm ${cartQuantity} sản phẩm vào giỏ hàng!`)
        setShowToast(true)
        setCartQuantity(1) // Reset quantity to 1 after adding
      } else {
        setToastMessage(res.message || "Thêm vào giỏ hàng thất bại!")
        setShowToast(true)
      }
    } catch {
      setToastMessage("Thêm vào giỏ hàng thất bại!")
      setShowToast(true)
    }
  }

  return (
    <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
      {/* Banner */}
      <section className="banner-section product-banner">
        <div className="banner-overlay"></div>
        <Container className="h-100">
          <Row className="h-100 align-items-center justify-content-center text-center">
            <Col>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="display-4 fw-bold mb-3 text-white">
                  {product?.name || "Chi Tiết Sản Phẩm"}
                </h1>
                <p className="lead text-light">
                  Khám phá chi tiết sản phẩm handmade
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container>
        {/* Chi tiết sản phẩm */}
        <Row className="mb-5">
          {/* Hình ảnh */}
          <Col lg={6} className="mb-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <img src={selectedImage} alt={product.name} className="main-product-img" style={{ width: "100%", height: "500px", objectFit: "cover" }} />
            </motion.div>
            <div className="d-flex gap-3 mt-3 flex-wrap">
              {(product.allImages || []).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  className={`thumb-img ${selectedImage === img ? "active" : ""}`}
                  style={{ width: 80, height: 80, objectFit: "cover", cursor: "pointer", border: selectedImage === img ? "2px solid #84B4C8" : "1px solid #eee" }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </Col>

          {/* Thông tin */}
          <Col lg={6}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="fw-bold mb-3">{product.name}</h2>
              <div className="d-flex align-items-center mb-3">
                <Star fill="#ffc107" color="#ffc107" size={20} />
                <span className="ms-2 fw-bold">{product.rating || 5}</span>
                <Badge
                  bg={product.status === "Available" || product.status === "InStock" ? "success" : "danger"}
                  className="ms-3"
                  style={{ fontSize: "0.9rem" }}
                >
                  {product.status === "Available" || product.status === "InStock" ? "Còn hàng" : "Hết hàng"}
                </Badge>
              </div>
              <h3 className="fw-bold mb-4 text-primary">{product.price?.toLocaleString("vi-VN")}đ</h3>
              <p className="text-muted mb-2">{product.description}</p>
              <ul className="text-muted">
                <li>Chất liệu: {product.material}</li>
                <li>Danh mục: {product.category}</li>
              </ul>
              {/* Quantity Control */}
              <div className="quantity-control mb-4">
                <span className="me-3 fw-bold">Số lượng:</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setCartQuantity(prev => Math.max(1, prev - 1))}
                  disabled={cartQuantity <= 1}
                  className="quantity-btn"
                >
                  −
                </Button>
                <Form.Control
                  type="number"
                  min={1}
                  max={product.stock || 100}
                  value={cartQuantity}
                  onChange={e => setCartQuantity(Math.max(1, Math.min(Number(e.target.value), product.stock || 100)))}
                  className="quantity-input"
                  aria-label="Số lượng sản phẩm"
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setCartQuantity(prev => Math.min(prev + 1, product.stock || 100))}
                  disabled={cartQuantity >= (product.stock || 100)}
                  className="quantity-btn"
                >
                  +
                </Button>
              </div>
              {/* Action Buttons */}
              <div className="d-flex gap-3 mt-4 align-items-center">
                <Button size="lg" className="btn-primary-custom">
                  Mua Ngay
                </Button>
                <Button size="lg" variant="outline-secondary" onClick={handleAddToCart}>
                  Thêm Vào Giỏ
                </Button>
                <Button
                  variant="light"
                  className="rounded-circle shadow-sm"
                  style={{ width: "50px", height: "50px" }}
                  onClick={handleLikeToggle}
                >
                  <Heart
                    size={20}
                    fill={isLiked ? "#ff0000" : "gray"}
                    color={isLiked ? "#ff0000" : "gray"}
                  />
                </Button>
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* Đánh giá sản phẩm */}
        <section className="mt-5">
          <h4 className="fw-bold mb-4">Đánh giá sản phẩm</h4>
          {reviews.length > 0 ? (
            <Row>
              {reviews.map((review, idx) => (
                <Col lg={3} md={6} sm={12} key={idx} className="mb-4">
                  <Card className="h-100 shadow-sm review-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0">{review.user}</h6>
                        <small className="text-muted">{review.date}</small>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < review.rating ? "#ffc107" : "lightgray"}
                            color={i < review.rating ? "#ffc107" : "lightgray"}
                          />
                        ))}
                        <span className="ms-2 fw-bold">{review.rating}/5</span>
                      </div>
                      <p className="text-muted mb-0">{review.comment}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}

          <div className="text-center mt-3">
            <Button variant="outline-primary" onClick={() => setShowModal(true)}>
              Viết đánh giá
            </Button>
          </div>
        </section>

        {/* Modal đánh giá */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Viết đánh giá</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tên của bạn</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên"
                  value={newReview.user}
                  onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Đánh giá</Form.Label>
                <Form.Select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                >
                  <option value="5">⭐️⭐️⭐️⭐️⭐️ - Rất tốt</option>
                  <option value="4">⭐️⭐️⭐️⭐️ - Tốt</option>
                  <option value="3">⭐️⭐️⭐️ - Bình thường</option>
                  <option value="2">⭐️⭐️ - Tệ</option>
                  <option value="1">⭐️ - Rất tệ</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nhận xét</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmitReview}>
              Gửi đánh giá
            </Button>
          </Modal.Footer>
        </Modal>

        <ToastContainer position="top-end" className="p-3">
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={2000}
            autohide
            bg={toastMessage.includes("thất bại") || toastMessage.includes("đăng nhập") || toastMessage.includes("hết hàng") ? "danger" : "success"}
          >
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </div>
  )
}

export default ProductDetail