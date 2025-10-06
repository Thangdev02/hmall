import { Container, Row, Col, Button, Card } from "react-bootstrap"
import { motion, useScroll, useTransform } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react" // Sửa import này
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import { ArrowRight, Star, Heart, Award } from "react-bootstrap-icons"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react" // Thêm hooks

import "./Home.css"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { getProducts } from "../../api/product" // Import API

const Home = () => {
    // State cho sản phẩm nổi bật
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(true)

    // Scroll parallax cho shapes
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 600], [0, 120])
    const y2 = useTransform(scrollY, [0, 600], [0, -90])
    const y3 = useTransform(scrollY, [0, 600], [0, 70])

    // Fetch sản phẩm nổi bật
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoadingProducts(true)
                const response = await getProducts({
                    pageSize: 20, // Lấy nhiều để có thể sort và chọn top 6
                    pageNumber: 1,
                    isActive: true // Chỉ lấy sản phẩm còn hàng
                })

                const products = response?.data?.items || []

                // Sort theo rating cao nhất và lấy top 6
                const topProducts = products
                    .filter(product => product.rating && product.rating > 0) // Chỉ lấy sản phẩm có rating
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort theo rating giảm dần
                    .slice(0, 6) // Lấy top 6

                // Xử lý hình ảnh
                const productsWithImages = topProducts.map(product => ({
                    ...product,
                    image: product.commonImage?.startsWith("http")
                        ? product.commonImage
                        : `${import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn"}/${product.commonImage}`
                }))

                setFeaturedProducts(productsWithImages)
            } catch (error) {
                console.error("Error fetching featured products:", error)
                setFeaturedProducts([])
            } finally {
                setLoadingProducts(false)
            }
        }

        fetchFeaturedProducts()
    }, [])

    return (
        <div style={{ paddingTop: "80px" }}>
            {/* Hero Section */}
            <section className="hero-section position-relative overflow-hidden">
                {/* Shapes */}
                <motion.div className="shape shape-1" style={{ y: y1 }} />
                <motion.div className="shape shape-2" style={{ y: y2 }} />
                <motion.div className="shape shape-3" style={{ y: y3 }} />

                <Container>
                    <Row className="align-items-center min-vh-75">
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="display-4 fw-bold mb-4">
                                    Khám Phá Thế Giới
                                    <br />
                                    <span style={{ color: "#ffffff" }}>Handmade Độc Đáo</span>
                                </h1>
                                <p className="lead mb-4" style={{ fontSize: "1.2rem", opacity: 0.9 }}>
                                    Những sản phẩm thủ công tinh xảo được tạo ra với tình yêu và sự tận tâm.
                                    Mỗi món đồ đều mang trong mình câu chuyện riêng và giá trị độc đáo.
                                </p>
                                <div className="d-flex gap-3">
                                    <Link to="/products">
                                        <Button className="btn-primary-custom" size="lg">
                                            Khám Phá Ngay <ArrowRight className="ms-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/products">
                                        <Button variant="outline-light" size="lg" className="btn-outline-custom">
                                            Xem Bộ Sưu Tập
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </Col>
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-center"
                            >
                                <img
                                    src="https://png.pngtree.com/png-vector/20240816/ourmid/pngtree-embracing-full-handmade-products-png-image_13504255.png"
                                    alt="Handmade Products"
                                    className="img-fluid rounded-3"
                                    style={{ maxHeight: "500px", objectFit: "cover" }}
                                />
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="section-padding" style={{ backgroundColor: "#f8f9fa" }}>
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                    Tại Sao Chọn Chúng Tôi?
                                </h2>
                                <p className="lead text-muted">Những giá trị cốt lõi làm nên sự khác biệt</p>
                            </motion.div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} className="mb-4">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        backgroundColor: "#B2D9EA",
                                    }}
                                >
                                    <Heart size={32} color="white" />
                                </div>
                                <h4 className="fw-bold mb-3">Làm Bằng Tình Yêu</h4>
                                <p className="text-muted">
                                    Mỗi sản phẩm được chế tác với tình yêu và sự tận tâm, mang đến cho bạn những trải nghiệm đặc biệt
                                    nhất.
                                </p>
                            </motion.div>
                        </Col>

                        <Col md={4} className="mb-4">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        backgroundColor: "#84B4C8",
                                    }}
                                >
                                    <Award size={32} color="white" />
                                </div>
                                <h4 className="fw-bold mb-3">Chất Lượng Cao</h4>
                                <p className="text-muted">
                                    Chúng tôi chỉ sử dụng những nguyên liệu tốt nhất và áp dụng quy trình sản xuất nghiêm ngặt để đảm bảo
                                    chất lượng.
                                </p>
                            </motion.div>
                        </Col>

                        <Col md={4} className="mb-4">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        backgroundColor: "#B2D9EA",
                                    }}
                                >
                                    <Star size={32} color="white" />
                                </div>
                                <h4 className="fw-bold mb-3">Độc Đáo & Đặc Biệt</h4>
                                <p className="text-muted">
                                    Mỗi sản phẩm đều có thiết kế độc đáo, không trùng lặp, giúp bạn thể hiện phong cách riêng biệt.
                                </p>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Featured Products Section */}
            <section className="section-padding">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                    Sản Phẩm Nổi Bật
                                </h2>
                                <p className="lead text-muted">Top 6 sản phẩm có đánh giá cao nhất</p>
                            </motion.div>
                        </Col>
                    </Row>

                    {loadingProducts ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                1024: { slidesPerView: 3 },
                            }}
                            className="featured-products-swiper"
                        >
                            {featuredProducts.map((product, index) => (
                                <SwiperSlide key={product.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <Card className="product-card h-100 shadow-sm">
                                            <div className="position-relative">
                                                <Card.Img
                                                    variant="top"
                                                    src={product.image || "/images/placeholder.jpg"}
                                                    className="product-image"
                                                    style={{ height: "250px", objectFit: "cover" }}
                                                />
                                                {/* Rating badge */}
                                                <div
                                                    className="position-absolute top-0 end-0 m-2 bg-warning text-dark px-2 py-1 rounded"
                                                    style={{ fontSize: "0.8rem", fontWeight: "bold" }}
                                                >
                                                    ⭐ {product.rating}
                                                </div>
                                            </div>
                                            <Card.Body className="d-flex flex-column">
                                                <Card.Title className="fw-bold" style={{ color: "#2c3e50", fontSize: "1.1rem" }}>
                                                    {product.name}
                                                </Card.Title>
                                                <Card.Text className="text-muted flex-grow-1" style={{ fontSize: "0.9rem" }}>
                                                    <div dangerouslySetInnerHTML={{
                                                        __html: product.description?.substring(0, 100) + "..."
                                                    }} />
                                                </Card.Text>
                                                <div className="d-flex justify-content-between align-items-center mt-auto mb-2">
                                                    <span className="fw-bold" style={{ color: "#84B4C8", fontSize: "1.2rem" }}>
                                                        {product.price?.toLocaleString("vi-VN")}đ
                                                    </span>
                                                    <div className="d-flex align-items-center">
                                                        <Star fill="#ffc107" color="#ffc107" size={16} />
                                                        <span className="ms-1 text-muted fw-bold">{product.rating}</span>
                                                    </div>
                                                </div>
                                                {/* Shop info */}
                                                {product.shopName && (
                                                    <div className="mb-2">
                                                        <small className="text-muted">
                                                            Cửa hàng: <span className="fw-bold">{product.shopName}</span>
                                                        </small>
                                                    </div>
                                                )}
                                                <Link to={`/products/${product.id}`}>
                                                    <Button className="btn-primary-custom w-100">Xem Chi Tiết</Button>
                                                </Link>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className="text-center py-5">
                            <p className="text-muted">Chưa có sản phẩm nổi bật</p>
                        </div>
                    )}
                </Container>
            </section>

            {/* Testimonials Section */}
            <section className="section-padding" style={{ backgroundColor: "#f8f9fa" }}>
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                Khách Hàng Nói Gì?
                            </h2>
                            <p className="lead text-muted">Cảm nhận từ những khách hàng thân thiết</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <Card className="p-4 shadow-sm h-100">
                                <Card.Text>"Sản phẩm cực kỳ tinh xảo, mình rất ưng ý!"</Card.Text>
                                <div className="d-flex align-items-center mt-3">
                                    <img
                                        src="https://i.pravatar.cc/60?img=12"
                                        alt="avatar"
                                        className="rounded-circle me-3"
                                        width="50"
                                        height="50"
                                    />
                                    <h6 className="fw-bold mb-0">Nguyễn Lan</h6>
                                </div>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="p-4 shadow-sm h-100">
                                <Card.Text>"Giao hàng nhanh, đóng gói cẩn thận, 5 sao!"</Card.Text>
                                <div className="d-flex align-items-center mt-3">
                                    <img
                                        src="https://i.pravatar.cc/60?img=20"
                                        alt="avatar"
                                        className="rounded-circle me-3"
                                        width="50"
                                        height="50"
                                    />
                                    <h6 className="fw-bold mb-0">Trần Minh</h6>
                                </div>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="p-4 shadow-sm h-100">
                                <Card.Text>"Độc đáo, không trùng lặp, sẽ ủng hộ tiếp."</Card.Text>
                                <div className="d-flex align-items-center mt-3">
                                    <img
                                        src="https://i.pravatar.cc/60?img=33"
                                        alt="avatar"
                                        className="rounded-circle me-3"
                                        width="50"
                                        height="50"
                                    />
                                    <h6 className="fw-bold mb-0">Hoàng Thảo</h6>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                Các Cửa Hàng Trên Hmall
                            </h2>
                            <p className="lead text-muted">
                                Những cửa hàng uy tín đã đăng ký gian hàng và bày bán sản phẩm
                            </p>
                        </Col>
                    </Row>

                    <div className="logo-slider">
                        <div className="logo-track">
                            {[
                                { name: "May's House", logo: "https://scontent.fsgn6-2.fna.fbcdn.net/v/t39.30808-6/495027495_1737299460255348_941442336585434906_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHphTSkkZYxCKF3I9Zifc3_WX3uvz9JILZZfe6_P0kgtmuFZa6dnkyA63WvWHzdpt27k9ThuYKLIJ9m0ikLBZ3B&_nc_ohc=-ykK0tXUZXwQ7kNvwHfZbjy&_nc_oc=AdnawMi2nr9o-rpwbl5AP_-2j1fAhiKwRvjh3wcLux9O1Dsl89Cktp0rHXKhwbT7xoI&_nc_zt=23&_nc_ht=scontent.fsgn6-2.fna&_nc_gid=xkHaqSbjQLedsA37W-m8BA&oh=00_AfZweq5nZWMOKcXLoYk8wpIkr_hlc2tTI2dXXn0C07Bd_Q&oe=68D0E919" },
                                { name: "Little Daisy Handmade", logo: "https://scontent.fsgn6-2.fna.fbcdn.net/v/t39.30808-1/225655040_126918576215004_913598083002304554_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=100&ccb=1-7&_nc_sid=2d3e12&_nc_eui2=AeHoMxChgbvdYP1wtapl4dUkb9xceX606ORv3Fx5frTo5LKNCJpCyQdYnHt7QtA29VMM-8jwW6DgIMacB3kvvES7&_nc_ohc=P9x_CSAn8nEQ7kNvwEM80st&_nc_oc=AdkLQx5rQ9Z42s5IUUQNbC7oGkO1Yv2knI3dWbJJSuUPMZbeHGe9Clv_68R2HnVhTVg&_nc_zt=24&_nc_ht=scontent.fsgn6-2.fna&_nc_gid=niVGs9w4wAgdXa9OlTAHrQ&oh=00_AfbqVkQS2-u4z3OUyVI-XAa-7nQOXb8sOAiPoe4uG66UaA&oe=68D0FA5B" },
                                { name: "Her Craft", logo: "https://scontent.fsgn6-1.fna.fbcdn.net/v/t39.30808-6/522904321_122148796196716319_2323392279456159065_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGXb7MgPAXVqWuaqmBDOF_pVl7ymuOK5TlWXvKa44rlOVgt3UHgTMo8Dz1-lj69Xq4ae_CZuyND5FwWkgbOaC2V&_nc_ohc=5W605qIJsLUQ7kNvwFwiymw&_nc_oc=AdkpPpDDPTtTJ4tsELmxSgHAl6pzo6Jgs2Aad2oxBgOHriO43IggHsZE2IUHzBLEc-I&_nc_zt=23&_nc_ht=scontent.fsgn6-1.fna&_nc_gid=rONdfH3uOP0U673cR6GLwg&oh=00_AfZ0nZdQQD29e9up5cLrgXSNVylhVxFNNAQz49CSlYjuMw&oe=68D1003C" },
                                { name: "Vừng Handmade", logo: "https://scontent.fsgn6-2.fna.fbcdn.net/v/t39.30808-6/387043017_6603267993075829_4323439864794366052_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFWlS0yxi16QPBM3fT6P32kg0VGCwIVikCDRUYLAhWKQO5TrrXlHu_MRZCk7DCw36HQGv0-ZAAud9fVnBfNP8lI&_nc_ohc=BK1G_lXH7vUQ7kNvwHwYDZF&_nc_oc=AdkILuDqZysyLXSsPZlDUQ4lncsPQpHRRNUWYhbX9aAXfcxtxts8OYQ9ai3lk6lrwM8&_nc_zt=23&_nc_ht=scontent.fsgn6-2.fna&_nc_gid=QdSNmNlmPybX8RiBBdzA-Q&oh=00_AfasPAwaHwkudCv6f4T5sR2lzVgOuLfNWOsK2AY1-61Glw&oe=68D0DA08" },
                            ].map((shop, index) => (
                                <div className="logo-item" key={index}>
                                    <img src={shop.logo} alt={shop.name} />
                                    <p>{shop.name}</p>
                                </div>
                            ))}
                            {/* Lặp lại để tạo hiệu ứng vô tận */}
                            {[
                                { name: "May's House", logo: "https://scontent.fsgn6-2.fna.fbcdn.net/v/t39.30808-6/495027495_1737299460255348_941442336585434906_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHphTSkkZYxCKF3I9Zifc3_WX3uvz9JILZZfe6_P0kgtmuFZa6dnkyA63WvWHzdpt27k9ThuYKLIJ9m0ikLBZ3B&_nc_ohc=-ykK0tXUZXwQ7kNvwHfZbjy&_nc_oc=AdnawMi2nr9o-rpwbl5AP_-2j1fAhiKwRvjh3wcLux9O1Dsl89Cktp0rHXKhwbT7xoI&_nc_zt=23&_nc_ht=scontent.fsgn6-2.fna&_nc_gid=xkHaqSbjQLedsA37W-m8BA&oh=00_AfZweq5nZWMOKcXLoYk8wpIkr_hlc2tTI2dXXn0C07Bd_Q&oe=68D0E919" },
                                { name: "Little Daisy Handmade", logo: "https://scontent.fsgn6-2.fna.fbcdn.net/v/t39.30808-1/225655040_126918576215004_913598083002304554_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=100&ccb=1-7&_nc_sid=2d3e12&_nc_eui2=AeHoMxChgbvdYP1wtapl4dUkb9xceX606ORv3Fx5frTo5LKNCJpCyQdYnHt7QtA29VMM-8jwW6DgIMacB3kvvES7&_nc_ohc=P9x_CSAn8nEQ7kNvwEM80st&_nc_oc=AdkLQx5rQ9Z42s5IUUQNbC7oGkO1Yv2knI3dWbJJSuUPMZbeHGe9Clv_68R2HnVhTVg&_nc_zt=24&_nc_ht=scontent.fsgn6-2.fna&_nc_gid=niVGs9w4wAgdXa9OlTAHrQ&oh=00_AfbqVkQS2-u4z3OUyVI-XAa-7nQOXb8sOAiPoe4uG66UaA&oe=68D0FA5B" },
                                { name: "Her Craft", logo: "https://scontent.fsgn6-1.fna.fbcdn.net/v/t39.30808-6/522904321_122148796196716319_2323392279456159065_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGXb7MgPAXVqWuaqmBDOF_pVl7ymuOK5TlWXvKa44rlOVgt3UHgTMo8Dz1-lj69Xq4ae_CZuyND5FwWkgbOaC2V&_nc_ohc=5W605qIJsLUQ7kNvwFwiymw&_nc_oc=AdkpPpDDPTtTJ4tsELmxSgHAl6pzo6Jgs2Aad2oxBgOHriO43IggHsZE2IUHzBLEc-I&_nc_zt=23&_nc_ht=scontent.fsgn6-1.fna&_nc_gid=rONdfH3uOP0U673cR6GLwg&oh=00_AfZ0nZdQQD29e9up5cLrgXSNVylhVxFNNAQz49CSlYjuMw&oe=68D1003C" },
                                { name: "Vừng Handmade", logo: "https://scontent.fsgn6-2.fna.fbcdn.net/v/t39.30808-6/387043017_6603267993075829_4323439864794366052_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFWlS0yxi16QPBM3fT6P32kg0VGCwIVikCDRUYLAhWKQO5TrrXlHu_MRZCk7DCw36HQGv0-ZAAud9fVnBfNP8lI&_nc_ohc=BK1G_lXH7vUQ7kNvwHwYDZF&_nc_oc=AdkILuDqZysyLXSsPZlDUQ4lncsPQpHRRNUWYhbX9aAXfcxtxts8OYQ9ai3lk6lrwM8&_nc_zt=23&_nc_ht=scontent.fsgn6-2.fna&_nc_gid=QdSNmNlmPybX8RiBBdzA-Q&oh=00_AfasPAwaHwkudCv6f4T5sR2lzVgOuLfNWOsK2AY1-61Glw&oe=68D0DA08" },
                            ].map((shop, index) => (
                                <div className="logo-item" key={`dup-${index}`}>
                                    <img src={shop.logo} alt={shop.name} />
                                    <p>{shop.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Gallery Section */}
            <section className="section-padding">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                Bộ Sưu Tập Hình Ảnh
                            </h2>
                            <p className="lead text-muted">Một vài khoảnh khắc được yêu thích</p>
                        </Col>
                    </Row>
                    <Row className="g-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Col xs={6} md={4} key={i}>
                                <motion.img
                                    src={`/images/gallery-${i}.jpg`}
                                    alt={`Gallery ${i}`}
                                    className="img-fluid rounded-3 gallery-img"
                                    style={{ width: "100%", height: '300px' }}
                                    whileHover={{ scale: 1.05 }}
                                />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Call to Action Section */}
            <section
                className="section-padding text-center text-white"
                style={{
                    background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                }}
            >
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-5 fw-bold mb-4">Sẵn Sàng Khám Phá?</h2>
                                <p className="lead mb-4">
                                    Hãy cùng chúng tôi khám phá thế giới handmade đầy màu sắc.
                                </p>
                                <Link to="/products">
                                    <Button variant="light" size="lg" className="fw-bold" style={{ color: "#84B4C8" }}>
                                        Xem Tất Cả Sản Phẩm <ArrowRight className="ms-2" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    )
}

export default Home