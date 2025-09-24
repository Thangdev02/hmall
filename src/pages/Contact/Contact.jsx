"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { motion } from "framer-motion"
import { GeoAlt, Telephone, Envelope, Clock, Send } from "react-bootstrap-icons"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [showAlert, setShowAlert] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
  }

  return (
    <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
      <Container>
        {/* Page Header */}
        <section className="banner-section contact-banner">
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
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="lead text-light">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </motion.div>
      </Col>
    </Row>
  </Container>
</section>


        <Row>
          {/* Contact Information */}
          <Col lg={4} className="mb-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="fw-bold mb-4" style={{ color: "#2c3e50" }}>
                Thông Tin Liên Hệ
              </h3>

              <Card className="mb-3" style={{ border: "none", backgroundColor: "#f8f9fa" }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#B2D9EA",
                      }}
                    >
                      <GeoAlt size={20} color="white" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Địa chỉ</h6>
                      <p className="text-muted mb-0">246 Nguyễn Thị Minh Khai, Quy Nhơn Nam, Gia Lai</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-3" style={{ border: "none", backgroundColor: "#f8f9fa" }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#84B4C8",
                      }}
                    >
                      <Telephone size={20} color="white" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Điện thoại</h6>
                      <p className="text-muted mb-0">+84 123 456 789</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-3" style={{ border: "none", backgroundColor: "#f8f9fa" }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#B2D9EA",
                      }}
                    >
                      <Envelope size={20} color="white" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Email</h6>
                      <p className="text-muted mb-0">info@hmall.com</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card style={{ border: "none", backgroundColor: "#f8f9fa" }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#84B4C8",
                      }}
                    >
                      <Clock size={20} color="white" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Giờ làm việc</h6>
                      <p className="text-muted mb-0">
                        Thứ 2 - Thứ 6: 8:00 - 18:00
                        <br />
                        Thứ 7: 9:00 - 17:00
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* Contact Form */}
          <Col lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card style={{ border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <Card.Body className="p-5">
                  <h3 className="fw-bold mb-4" style={{ color: "#2c3e50" }}>
                    Gửi Tin Nhắn
                  </h3>

                  {showAlert && (
                    <Alert variant="success" className="mb-4">
                      <strong>Cảm ơn bạn!</strong> Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm
                      nhất có thể.
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Họ và tên *</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            style={{ borderRadius: "10px", padding: "12px" }}
                            placeholder="Nhập họ và tên của bạn"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Email *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            style={{ borderRadius: "10px", padding: "12px" }}
                            placeholder="Nhập địa chỉ email"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Chủ đề</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        style={{ borderRadius: "10px", padding: "12px" }}
                        placeholder="Chủ đề tin nhắn"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Tin nhắn *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: "10px", padding: "12px" }}
                        placeholder="Nhập nội dung tin nhắn của bạn..."
                      />
                    </Form.Group>

                    <Button type="submit" className="btn-primary-custom" size="lg">
                      <Send className="me-2" />
                      Gửi Tin Nhắn
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Map Section */}
        <Row className="mt-5">
          <Col>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card style={{ border: "none", borderRadius: "15px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "400px",
                    background: "linear-gradient(135deg, #B2D9EA 0%, #84B4C8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.5822934100897!2d109.21658616159056!3d13.804035936537336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316f6bf778c80973%3A0x8a7d0b5aa0af29c7!2zxJDhuqFpIGjhu41jIEZQVCBRdXkgTmjGoW4!5e0!3m2!1svi!2s!4v1758140892285!5m2!1svi!2s" style={{width: "100%", height: "100%", border: "none"}} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                  </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Contact
