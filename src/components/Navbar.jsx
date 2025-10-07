import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap"
import { House, Grid3x3Gap, Telephone, InfoCircle, Journal, Cart, PersonCircle, Gear, Shop } from "react-bootstrap-icons"
import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const NavigationBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))
  const navigate = useNavigate();
  const location = useLocation();

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

  // Hàm xử lý navigation cải tiến
  const handleNavigation = (path) => {
    if (location.pathname === path) {
      // Nếu đang ở trang đó rồi, force reload với key mới
      navigate(path, { replace: true, state: { reload: Date.now() } });
      setTimeout(() => {
        window.location.reload();
      }, 10);
    } else {
      navigate(path);
    }
  };

  return (
    <Navbar expand="lg" className="navbar-custom" fixed="top" key={`navbar-${Date.now()}`}>
      <Container>
        <div
          style={{ width: "80px", height: "80px", cursor: "pointer" }}
          onClick={() => handleNavigation("/")}
        >
          <img
            src="/images/HMallLogo.jpg"
            alt="Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80x80?text=Logo"; }}
          />
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link
              className={`nav-link-custom ${location.pathname === "/" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/");
              }}
              style={{ cursor: "pointer" }}
            >
              <House className="me-1" /> Trang Chủ
            </Nav.Link>

            <Nav.Link
              className={`nav-link-custom ${location.pathname === "/products" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/products");
              }}
              style={{ cursor: "pointer" }}
            >
              <Grid3x3Gap className="me-1" /> Sản phẩm
            </Nav.Link>

            <Nav.Link
              className={`nav-link-custom ${location.pathname === "/shop" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/shop");
              }}
              style={{ cursor: "pointer" }}
            >
              <Shop className="me-1" />Cửa hàng
            </Nav.Link>

            <Nav.Link
              className={`nav-link-custom ${location.pathname === "/about" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/about");
              }}
              style={{ cursor: "pointer" }}
            >
              <InfoCircle className="me-1" /> Giới Thiệu
            </Nav.Link>

            <Nav.Link
              className={`nav-link-custom ${location.pathname === "/blog" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/blog");
              }}
              style={{ cursor: "pointer" }}
            >
              <Journal className="me-1" /> Bài Viết
            </Nav.Link>

            <Nav.Link
              className={`nav-link-custom ${location.pathname === "/contact" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/contact");
              }}
              style={{ cursor: "pointer" }}
            >
              <Telephone className="me-1" /> Liên Hệ
            </Nav.Link>

            <Nav.Link
              className={`nav-link-custom ${location.pathname === "/cart" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/cart");
              }}
              style={{ cursor: "pointer" }}
            >
              <Cart className="me-1" /> Giỏ Hàng
            </Nav.Link>
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
                <NavDropdown.Item
                  onClick={(e) => {
                    e.preventDefault();
                    handleSettings();
                  }}
                >
                  <Gear className="me-2" /> Cài đặt
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/my-blogs");
                  }}
                >
                  <Journal className="me-2" /> Quản lý blog
                </NavDropdown.Item>

                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Đăng Xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link
                className="nav-link-custom"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/login");
                }}
                style={{ cursor: "pointer" }}
              >
                <PersonCircle size={24} />
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavigationBar