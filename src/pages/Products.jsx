"use client"

import { useState, useMemo } from "react"
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap"
import { motion } from "framer-motion"
import { Star, Heart, Search, Filter } from "react-bootstrap-icons"
import { products, categories } from "../data/products"
import "./Products.css"
import { Link } from "react-router-dom"
const Products = () => {
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("name")
    const [showFilters, setShowFilters] = useState(false)

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = products

        // Filter by category
        if (selectedCategory !== "all") {
            filtered = filtered.filter((product) => product.category === selectedCategory)
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price
                case "price-high":
                    return b.price - a.price
                case "rating":
                    return b.rating - a.rating
                case "name":
                default:
                    return a.name.localeCompare(b.name)
            }
        })

        return filtered
    }, [selectedCategory, searchTerm, sortBy])

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <Container>
                {/* Page Header */}
                <section className="banner-section">
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
                                        Sản Phẩm Handmade
                                    </h1>
                                    <p className="lead text-light">
                                        Khám phá bộ sưu tập đầy đủ các sản phẩm thủ công độc đáo
                                    </p>
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                </section>


                {/* Search and Filter Bar */}
                <Row className="mb-4">
                    <Col lg={8}>
                        <div className="position-relative">
                            <Search
                                className="position-absolute"
                                style={{
                                    left: "15px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#6c757d",
                                }}
                            />
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    paddingLeft: "45px",
                                    borderRadius: "25px",
                                    border: "2px solid #e9ecef",
                                }}
                            />
                        </div>
                    </Col>
                    <Col lg={4} className="d-flex gap-2">
                        <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ borderRadius: "25px" }}>
                            <option value="name">Sắp xếp theo tên</option>
                            <option value="price-low">Giá thấp đến cao</option>
                            <option value="price-high">Giá cao đến thấp</option>
                            <option value="rating">Đánh giá cao nhất</option>
                        </Form.Select>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ borderRadius: "25px", minWidth: "120px" }}
                        >
                            <Filter className="me-2" />
                            Bộ lọc
                        </Button>
                    </Col>
                </Row>

                {/* Category Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Row className="mb-4">
                            <Col>
                                <Card className="p-3" style={{ backgroundColor: "#f8f9fa", border: "none" }}>
                                    <h6 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                        Danh mục sản phẩm:
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <Badge
                                                key={category.id}
                                                bg={selectedCategory === category.id ? "primary" : "light"}
                                                text={selectedCategory === category.id ? "white" : "dark"}
                                                style={{
                                                    cursor: "pointer",
                                                    padding: "8px 16px",
                                                    fontSize: "0.9rem",
                                                    backgroundColor: selectedCategory === category.id ? "#84B4C8" : "#e9ecef",
                                                }}
                                                onClick={() => setSelectedCategory(category.id)}
                                            >
                                                {category.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </motion.div>
                )}

                {/* Results Info */}
                <Row className="mb-4">
                    <Col>
                        <p className="text-muted">
                            Hiển thị {filteredProducts.length} sản phẩm
                            {selectedCategory !== "all" && (
                                <span>
                                    {" "}
                                    trong danh mục "<strong>{categories.find((cat) => cat.id === selectedCategory)?.name}</strong>"
                                </span>
                            )}
                            {searchTerm && (
                                <span>
                                    {" "}
                                    cho từ khóa "<strong>{searchTerm}</strong>"
                                </span>
                            )}
                        </p>
                    </Col>
                </Row>

                {/* Products Grid */}
                <Row>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <Col lg={4} md={6} className="mb-4" key={product.id}>
                            <Link style={{ textDecoration: "none", color: "inherit" }} to={`/products/${product.id}`}>

                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Card className="product-card h-100">
                                        <div className="position-relative">
                                            <Card.Img variant="top" src={product.image} className="product-image" style={{ objectFit: "cover" }} />
                                            {product.inStock && (
                                                <Badge bg="success" className="position-absolute" style={{ top: "10px", left: "10px" }}>
                                                    Còn hàng
                                                </Badge>
                                            )}
                                            <Button
                                                variant="light"
                                                className="position-absolute"
                                                style={{
                                                    top: "10px",
                                                    right: "10px",
                                                    borderRadius: "50%",
                                                    width: "40px",
                                                    height: "40px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Heart size={16} />
                                            </Button>
                                        </div>

                                        <Card.Body className="d-flex flex-column">
                                            <div className="mb-2">
                                                <Badge bg="light" text="dark" style={{ fontSize: "0.75rem" }}>
                                                    {categories.find((cat) => cat.id === product.category)?.name}
                                                </Badge>
                                            </div>

                                            <Card.Title className="fw-bold" style={{ color: "#2c3e50" }}>
                                                {product.name}
                                            </Card.Title>

                                            <Card.Text className="text-muted flex-grow-1" style={{ fontSize: "0.9rem" }}>
                                                {product.description}
                                            </Card.Text>

                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="fw-bold" style={{ color: "#84B4C8", fontSize: "1.3rem" }}>
                                                    {product.price.toLocaleString("vi-VN")}đ
                                                </span>
                                                <div className="d-flex align-items-center">
                                                    <Star fill="#ffc107" color="#ffc107" size={16} />
                                                    <span className="ms-1 text-muted fw-bold">{product.rating}</span>
                                                </div>
                                            </div>

                                            <div className="d-grid gap-2">
                                             
                                                <Button variant="outline-secondary" style={{ borderRadius: "25px" }}>
                                                    Thêm Vào Giỏ
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Link>
                            </Col>
                        ))
                    ) : (
                        <Col className="text-center py-5">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                <h4 className="text-muted mb-3">Không tìm thấy sản phẩm nào</h4>
                                <p className="text-muted">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm sản phẩm.</p>
                                <Button
                                    className="btn-primary-custom"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setSelectedCategory("all")
                                    }}
                                >
                                    Xem Tất Cả Sản Phẩm
                                </Button>
                            </motion.div>
                        </Col>
                    )}
                </Row>

                {/* Load More Button (if needed) */}
                {filteredProducts.length > 0 && (
                    <Row className="mt-5">
                        <Col className="text-center">
                            <Button variant="outline-primary" size="lg" style={{ borderRadius: "25px" }}>
                                Xem Thêm Sản Phẩm
                            </Button>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    )
}

export default Products
