"use client"

import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Button, Badge, Card, Form, Modal } from "react-bootstrap"
import { motion } from "framer-motion"
import { Star, Heart } from "react-bootstrap-icons"
import { products, categories } from "../data/products"
import { useState } from "react"
import "./ProductDetail.css"

const ProductDetail = () => {
  const { id } = useParams()
  const product = products.find((p) => p.id === parseInt(id))

  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || product?.image)
  const [reviews, setReviews] = useState(product?.reviews || [])
  const [showModal, setShowModal] = useState(false)
  const [newReview, setNewReview] = useState({ user: "", rating: 5, comment: "" })

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

  const related = products.filter((p) => p.category === product.category && p.id !== product.id)

  const handleSubmitReview = () => {
    if (!newReview.user || !newReview.comment) return
    const today = new Date().toLocaleDateString("vi-VN")
    setReviews([...reviews, { ...newReview, date: today }])
    setNewReview({ user: "", rating: 5, comment: "" })
    setShowModal(false)
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
              <img src={selectedImage} alt={product.name} className="main-product-img"  style={{ width: "100%", height: "500px" }} />
            </motion.div>
            <div className="d-flex gap-3 mt-3 flex-wrap">
              {product.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  className={`thumb-img ${selectedImage === img ? "active" : ""}`}
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
                <span className="ms-2 fw-bold">{product.rating}</span>
                <Badge bg={product.inStock ? "success" : "danger"} className="ms-3" style={{ fontSize: "0.9rem" }}>
                  {product.inStock ? "Còn hàng" : "Hết hàng"}
                </Badge>
              </div>
              <h3 className="fw-bold mb-4 text-primary">{product.price.toLocaleString("vi-VN")}đ</h3>
              <p className="text-muted mb-4">{product.description}</p>
              <ul className="text-muted">
                {product.details?.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
              <div className="d-flex gap-3 mt-4">
                <Button size="lg" className="btn-primary-custom">
                  Mua Ngay
                </Button>
                <Button size="lg" variant="outline-secondary">
                  Thêm Vào Giỏ
                </Button>
                <Button variant="light" className="rounded-circle shadow-sm" style={{ width: "50px", height: "50px" }}>
                  <Heart size={20} />
                </Button>
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* Đánh giá sản phẩm */}
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

        {/* Sản phẩm liên quan */}
        {related.length > 0 && (
          <section className="mt-5">
            <h4 className="fw-bold mb-4">Sản phẩm liên quan</h4>
            <Row>
              {related.map((item, index) => (
                <Col lg={3} md={4} sm={6} key={item.id} className="mb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-100 shadow-sm product-related-card">
                      <Card.Img variant="top" src={item.image} className="related-img" />
                      <Card.Body>
                        <h6 className="fw-bold">{item.name}</h6>
                        <p className="text-muted small">{item.price.toLocaleString("vi-VN")}đ</p>
                        <Link to={`/products/${item.id}`}>
                          <Button size="sm" variant="outline-primary">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </section>
        )}
      </Container>
    </div>
  )
}

export default ProductDetail
