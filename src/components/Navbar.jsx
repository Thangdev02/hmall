import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { House, Grid3x3Gap, Telephone, InfoCircle, Journal, Cart, PersonCircle, Gear } from "react-bootstrap-icons"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const NavigationBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))
  const navigate = useNavigate();

  useEffect(() => {
    // Lắng nghe sự thay đổi của localStorage (nếu có nhiều tab)
    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <Navbar expand="lg" className="navbar-custom" fixed="top">
      <Container>
        <LinkContainer to="/" style={{ width: "80px", height: "80px" }}>
          <img src="public/images/HMallLogo.jpg" alt="Logo" />
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <LinkContainer to="/">
              <Nav.Link className="nav-link-custom">
                <House className="me-1" /> Trang Chủ
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/products">
              <Nav.Link className="nav-link-custom">
                <Grid3x3Gap className="me-1" /> Sản phẩm
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/about">
              <Nav.Link className="nav-link-custom">
                <InfoCircle className="me-1" /> Giới Thiệu
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/blog">
              <Nav.Link className="nav-link-custom">
                <Journal className="me-1" /> Bài Viết
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/contact">
              <Nav.Link className="nav-link-custom">
                <Telephone className="me-1" /> Liên Hệ
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/cart">
              <Nav.Link className="nav-link-custom">
                <Cart className="me-1" /> Giỏ Hàng
              </Nav.Link>
            </LinkContainer>
          </Nav>

          {/* Avatar và menu tài khoản */}
          <Nav style={{ marginLeft: "20px" }}>
            {isLoggedIn ? (
              <NavDropdown
                title={<PersonCircle size={24} />}
                id="user-dropdown"
                align="end"
                className="nav-link-custom"
              >
                <NavDropdown.Item onClick={handleSettings}>
                  <Gear className="me-2" /> Cài đặt
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Đăng Xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link className="nav-link-custom">
                  <PersonCircle size={24} />
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavigationBar