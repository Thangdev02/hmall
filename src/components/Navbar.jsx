import { Navbar, Nav, Container } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { House, Grid3x3Gap, Telephone, InfoCircle, Journal } from "react-bootstrap-icons"

const NavigationBar = () => {
  return (
    <Navbar expand="lg" className="navbar-custom" fixed="top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="navbar-brand-custom">HMall</Navbar.Brand>
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
                <InfoCircle className="me-1" />  Giới Thiệu
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavigationBar
