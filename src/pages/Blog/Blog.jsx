"use client"

import { useState, useMemo } from "react"
import { Container, Row, Col, Card, Badge, Form, Button } from "react-bootstrap"
import { motion } from "framer-motion"
import { Calendar, Person, Clock, Search, ArrowRight } from "react-bootstrap-icons"

import { Link } from "react-router-dom"
import { blogCategories, blogPosts } from "../../data/blog"

const Blog = () => {
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")

    // Filter blog posts
    const filteredPosts = useMemo(() => {
        let filtered = blogPosts

        // Filter by category
        if (selectedCategory !== "all") {
            filtered = filtered.filter((post) => post.category === selectedCategory)
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.content.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [selectedCategory, searchTerm])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const featuredPost = blogPosts[0]
    const regularPosts = filteredPosts.slice(1)

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <Container>
                {/* Page Header */}
                <section className="banner-section blog-banner">
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
                                        Blog Handmade
                                    </h1>
                                    <p className="lead text-light">
                                        Chia sẻ kiến thức, kinh nghiệm và câu chuyện về thế giới handmade
                                    </p>
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                </section>


                {/* Search and Filter */}
                <Row className="mb-5">
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
                                placeholder="Tìm kiếm bài viết..."
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
                </Row>

                {/* Category Filters */}
                <Row className="mb-5">
                    <Col>
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            {blogCategories.map((category) => (
                                <Badge
                                    key={category.id}
                                    bg={selectedCategory === category.id ? "primary" : "light"}
                                    text={selectedCategory === category.id ? "white" : "dark"}
                                    style={{
                                        cursor: "pointer",
                                        padding: "10px 20px",
                                        fontSize: "0.9rem",
                                        backgroundColor: selectedCategory === category.id ? "#84B4C8" : "#e9ecef",
                                        borderRadius: "25px",
                                    }}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.name}
                                </Badge>
                            ))}
                        </div>
                    </Col>
                </Row>

                {/* Featured Post */}
                {selectedCategory === "all" && !searchTerm && (
                    <Row className="mb-5">
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Card
                                    className="featured-post"
                                    style={{
                                        border: "none",
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <Row className="g-0">
                                        <Col md={6}>
                                            <Card.Img
                                                src={featuredPost.image}
                                                alt={featuredPost.title}
                                                style={{ height: "400px", objectFit: "cover" }}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <Card.Body className="p-5 d-flex flex-column h-100">
                                                <div>
                                                    <Badge
                                                        bg="primary"
                                                        className="mb-3"
                                                        style={{ backgroundColor: "#B2D9EA", fontSize: "0.8rem" }}
                                                    >
                                                        Bài viết nổi bật
                                                    </Badge>
                                                    <Card.Title className="fw-bold mb-3" style={{ color: "#2c3e50", fontSize: "1.5rem" }}>
                                                        {featuredPost.title}
                                                    </Card.Title>
                                                    <Card.Text className="text-muted mb-4" style={{ lineHeight: "1.6" }}>
                                                        {featuredPost.excerpt}
                                                    </Card.Text>
                                                </div>
                                                <div className="mt-auto">
                                                    <div className="d-flex align-items-center mb-3 text-muted">
                                                        <Person size={16} className="me-2" />
                                                        <span className="me-3">{featuredPost.author}</span>
                                                        <Calendar size={16} className="me-2" />
                                                        <span className="me-3">{formatDate(featuredPost.date)}</span>
                                                        <Clock size={16} className="me-2" />
                                                        <span>{featuredPost.readTime}</span>
                                                    </div>
                                                    <Button className="btn-primary-custom">
                                                        Đọc tiếp <ArrowRight className="ms-2" />
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Col>
                                    </Row>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                )}

                {/* Results Info */}
                <Row className="mb-4">
                    <Col>
                        <p className="text-muted">
                            Hiển thị {filteredPosts.length} bài viết
                            {selectedCategory !== "all" && (
                                <span>
                                    {" "}
                                    trong danh mục "<strong>{blogCategories.find((cat) => cat.id === selectedCategory)?.name}</strong>"
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

                {/* Blog Posts Grid */}
                <Row>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (

                            <Col lg={4} md={6} className="mb-4" key={post.id}>
                                <Link style={{ textDecoration: "none", color: "inherit" }} to={`/blog/${post.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <Card
                                            className="h-100"
                                            style={{
                                                border: "none",
                                                borderRadius: "15px",
                                                overflow: "hidden",
                                                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                                                transition: "all 0.3s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "translateY(-10px)"
                                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)"
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "translateY(0)"
                                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)"
                                            }}
                                        >
                                            <Card.Img
                                                variant="top"
                                                src={post.image}
                                                alt={post.title}
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                            <Card.Body className="p-4 d-flex flex-column">
                                                <div className="mb-2">
                                                    <Badge bg="light" text="dark" style={{ fontSize: "0.75rem", backgroundColor: "#f8f9fa" }}>
                                                        {post.category}
                                                    </Badge>
                                                </div>

                                                <Card.Title className="fw-bold mb-3" style={{ color: "#2c3e50", fontSize: "1.1rem" }}>
                                                    {post.title}
                                                </Card.Title>

                                                <Card.Text className="text-muted flex-grow-1" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                                                    {post.excerpt}
                                                </Card.Text>

                                                <div className="mt-auto">
                                                    <div className="d-flex align-items-center mb-3 text-muted" style={{ fontSize: "0.8rem" }}>
                                                        <Person size={14} className="me-1" />
                                                        <span className="me-3">{post.author}</span>
                                                        <Calendar size={14} className="me-1" />
                                                        <span className="me-3">{formatDate(post.date)}</span>
                                                        <Clock size={14} className="me-1" />
                                                        <span>{post.readTime}</span>
                                                    </div>
                                                    <Button variant="outline-primary" size="sm" style={{ borderRadius: "20px" }}>
                                                        Đọc thêm
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
                                <h4 className="text-muted mb-3">Không tìm thấy bài viết nào</h4>
                                <p className="text-muted">Hãy thử thay đổi từ khóa tìm kiếm hoặc danh mục để xem thêm bài viết.</p>
                                <Button
                                    className="btn-primary-custom"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setSelectedCategory("all")
                                    }}
                                >
                                    Xem Tất Cả Bài Viết
                                </Button>
                            </motion.div>
                        </Col>
                    )}
                </Row>

                {/* Newsletter Subscription */}
                <section
                    className="text-center text-white mt-5"
                    style={{
                        background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                        margin: "80px -15px 0",
                        padding: "60px 15px",
                        borderRadius: "20px",
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
                                    <h3 className="fw-bold mb-3">Đăng Ký Nhận Tin Mới</h3>
                                    <p className="mb-4">Nhận thông báo về những bài viết mới nhất và tips handmade hữu ích</p>
                                    <Row className="justify-content-center">
                                        <Col md={6}>
                                            <div className="d-flex gap-2">
                                                <Form.Control type="email" placeholder="Nhập email của bạn" style={{ borderRadius: "25px" }} />
                                                <Button variant="light" style={{ borderRadius: "25px", color: "#84B4C8", fontWeight: "bold" }}>
                                                    Đăng ký
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                </section>
            </Container>
        </div>
    )
}

export default Blog
