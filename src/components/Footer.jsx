import { Container, Row, Col } from "react-bootstrap"
import { Facebook, Instagram, Twitter, Envelope, Telephone, GeoAlt } from "react-bootstrap-icons"

const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#f8f9fa", marginTop: "80px", padding: "50px 0 20px" }}>
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 style={{ color: "#84B4C8", marginBottom: "20px" }}>HMall</h5>
            <p style={{ color: "#6c757d" }}>
              Chúng tôi tạo ra những sản phẩm handmade độc đáo và chất lượng cao, mang đến cho bạn những trải nghiệm
              tuyệt vời nhất.
            </p>
            <div className="d-flex gap-3 mt-3">
              <Facebook size={20} style={{ color: "#84B4C8", cursor: "pointer" }} />
              <Instagram size={20} style={{ color: "#84B4C8", cursor: "pointer" }} />
              <Twitter size={20} style={{ color: "#84B4C8", cursor: "pointer" }} />
            </div>
          </Col>

          <Col md={4} className="mb-4">
            <h6 style={{ color: "#2c3e50", marginBottom: "20px" }}>Liên kết nhanh</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li className="mb-2">
                <a href="/" style={{ color: "#6c757d", textDecoration: "none" }}>
                  Trang chủ
                </a>
              </li>
              <li className="mb-2">
                <a href="/products" style={{ color: "#6c757d", textDecoration: "none" }}>
                  Sản phẩm
                </a>
              </li>
              <li className="mb-2">
                <a href="/about" style={{ color: "#6c757d", textDecoration: "none" }}>
                  Về chúng tôi
                </a>
              </li>
              <li className="mb-2">
                <a href="/blog" style={{ color: "#6c757d", textDecoration: "none" }}>
                  Blog
                </a>
              </li>
            </ul>
          </Col>

          <Col md={4} className="mb-4">
            <h6 style={{ color: "#2c3e50", marginBottom: "20px" }}>Liên hệ</h6>
            <div className="d-flex align-items-center mb-2">
              <GeoAlt size={16} style={{ color: "#84B4C8", marginRight: "10px" }} />
              <span style={{ color: "#6c757d", fontSize: "14px" }}>246 Nguyễn Thị Minh Khai, Quy Nhơn Nam, Gia Lai</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <Telephone size={16} style={{ color: "#84B4C8", marginRight: "10px" }} />
              <span style={{ color: "#6c757d", fontSize: "14px" }}>+84 123 456 789</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <Envelope size={16} style={{ color: "#84B4C8", marginRight: "10px" }} />
              <span style={{ color: "#6c757d", fontSize: "14px" }}>info@hmall.com</span>
            </div>
          </Col>
        </Row>

        <hr style={{ margin: "30px 0 20px", borderColor: "#dee2e6" }} />
        <Row>
          <Col className="text-center">
            <p style={{ color: "#6c757d", fontSize: "14px", margin: 0 }}>
              © 2024 HandCrafted. Tất cả quyền được bảo lưu.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
