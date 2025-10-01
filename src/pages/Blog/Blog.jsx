import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Form, Button, Spinner, Alert, Pagination } from "react-bootstrap";
import { motion } from "framer-motion";
import { Calendar, Person, Clock, Search, ArrowRight, Heart, HeartFill, ChatDots } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { getBlogs } from "../../api/blog";

// Component để xử lý ảnh với fallback
const BlogImage = ({ src, alt, className, style }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImageSrc(src);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImageSrc('https://via.placeholder.com/400x200/84B4C8/ffffff?text=Blog+Image');
        }
    };

    return (
        <Card.Img
            variant="top"
            src={imageSrc}
            alt={alt}
            className={className}
            style={style}
            onError={handleError}
        />
    );
};

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Lấy danh sách blog từ API
    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = {
                    pageNumber,
                    pageSize,
                };

                if (searchTerm) params.search = searchTerm;
                if (selectedCategory !== 'all') params.filter = selectedCategory;

                const res = await getBlogs(params);

                if (res.statusCode === 200) {
                    setBlogs(res.data.items || []);
                    setTotalPages(res.data.totalPages || 1);
                    setTotalItems(res.data.totalRecord || 0);
                } else {
                    setError(res.message || 'Không thể tải bài viết');
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setError('Không thể tải bài viết. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [pageNumber, pageSize, searchTerm, selectedCategory]);

    // Lấy danh sách categories từ blogs (có thể mở rộng sau)
    const blogCategories = [
        { id: "all", name: "Tất cả" },
        { id: "tutorial", name: "Hướng dẫn" },
        { id: "tips", name: "Mẹo hay" },
        { id: "inspiration", name: "Cảm hứng" },
        { id: "review", name: "Đánh giá" },
    ];

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        setPageNumber(1);
    };

    // Xử lý thay đổi trang
    const handlePageChange = (newPage) => {
        setPageNumber(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset bộ lọc
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setPageNumber(1);
    };

    const featuredPost = blogs[0];
    const regularPosts = blogs.slice(1);

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <Container>
                {/* Page Header */}
                <section className="banner-section blog-banner mb-5">
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
                <Row className="mb-4">
                    <Col lg={8}>
                        <Form onSubmit={handleSearch}>
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
                        </Form>
                    </Col>
                    <Col lg={4} className="d-flex gap-2">
                        {(searchTerm || selectedCategory !== 'all') && (
                            <Button
                                variant="outline-danger"
                                onClick={resetFilters}
                                style={{ borderRadius: '25px' }}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
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

                {/* Results Info */}
                <Row className="mb-4">
                    <Col>
                        <p className="text-muted">
                            Hiển thị {blogs.length} trong tổng số {totalItems} bài viết
                            {selectedCategory !== 'all' && (
                                <span> trong danh mục "<strong>{blogCategories.find(cat => cat.id === selectedCategory)?.name}</strong>"</span>
                            )}
                            {searchTerm && (
                                <span> cho từ khóa "<strong>{searchTerm}</strong>"</span>
                            )}
                        </p>
                    </Col>
                </Row>

                {/* Error Message */}
                {error && (
                    <Row className="mb-4">
                        <Col className="text-center">
                            <Alert variant="danger">{error}</Alert>
                        </Col>
                    </Row>
                )}

                {/* Featured Post */}
                {featuredPost && selectedCategory === "all" && !searchTerm && !loading && (
                    <Row className="mb-5">
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Card
                                    style={{
                                        border: "none",
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <Row className="g-0">
                                        <Col md={6}>
                                            <BlogImage
                                                src={featuredPost.image || 'https://via.placeholder.com/400x400/84B4C8/ffffff?text=Blog+Image'}
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
                                                </div>
                                                <div className="mt-auto">
                                                    <div className="d-flex align-items-center mb-3 text-muted">
                                                        <Person size={16} className="me-2" />
                                                        <span className="me-3">{featuredPost.author}</span>
                                                        <Calendar size={16} className="me-2" />
                                                        <span className="me-3">{formatDate(featuredPost.publishDate)}</span>
                                                        <Heart size={16} className="me-2" />
                                                        <span className="me-3">{featuredPost.totalLike}</span>
                                                        <ChatDots size={16} className="me-2" />
                                                        <span>{featuredPost.totalComment}</span>
                                                    </div>
                                                    <Link to={`/blog/${featuredPost.id}`} style={{ textDecoration: 'none' }}>
                                                        <Button style={{
                                                            background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                                                            border: "none",
                                                            borderRadius: "25px",
                                                            padding: "12px 30px",
                                                            fontWeight: "600",
                                                            color: "white"
                                                        }}>
                                                            Đọc tiếp <ArrowRight className="ms-2" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </Card.Body>
                                        </Col>
                                    </Row>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                )}

                {/* Blog Posts Grid */}
                <Row>
                    {loading ? (
                        <Col className="text-center py-5">
                            <Spinner animation="border" role="status" style={{ color: "#84B4C8" }}>
                                <span className="visually-hidden">Đang tải...</span>
                            </Spinner>
                            <h4 className="mt-3">Đang tải bài viết...</h4>
                        </Col>
                    ) : regularPosts.length > 0 || (featuredPost && (selectedCategory !== "all" || searchTerm)) ? (
                        (selectedCategory !== "all" || searchTerm ? blogs : regularPosts).map((post, index) => (
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
                                                e.currentTarget.style.transform = "translateY(-10px)";
                                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)";
                                            }}
                                        >
                                            <BlogImage
                                                src={post.image || 'https://via.placeholder.com/400x200/84B4C8/ffffff?text=Blog+Image'}
                                                alt={post.title}
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                            <Card.Body className="p-4 d-flex flex-column">
                                                <Card.Title className="fw-bold mb-3" style={{ color: "#2c3e50", fontSize: "1.1rem" }}>
                                                    {post.title}
                                                </Card.Title>

                                                <div className="mt-auto">
                                                    <div className="d-flex align-items-center mb-3 text-muted" style={{ fontSize: "0.8rem" }}>
                                                        <Person size={14} className="me-1" />
                                                        <span className="me-3">{post.author}</span>
                                                        <Calendar size={14} className="me-1" />
                                                        <span className="me-3">{formatDate(post.publishDate)}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center gap-2">
                                                        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.8rem" }}>
                                                            <div className="d-flex align-items-center">
                                                                <Heart size={14} className="me-1" />
                                                                <span>{post.totalLike}</span>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <ChatDots size={14} />
                                                                <span>{post.totalComment}</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline-primary" size="sm" style={{ borderRadius: "20px" }}>
                                                            Đọc thêm
                                                        </Button>
                                                    </div>
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
                                    style={{
                                        background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                                        border: "none",
                                        borderRadius: "25px",
                                        padding: "12px 30px",
                                        fontWeight: "600",
                                        color: "white"
                                    }}
                                    onClick={resetFilters}
                                >
                                    Xem Tất Cả Bài Viết
                                </Button>
                            </motion.div>
                        </Col>
                    )}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Row className="mt-5">
                        <Col className="d-flex justify-content-center">
                            <Pagination>
                                <Pagination.First
                                    onClick={() => handlePageChange(1)}
                                    disabled={pageNumber === 1 || loading}
                                />
                                <Pagination.Prev
                                    onClick={() => handlePageChange(pageNumber - 1)}
                                    disabled={pageNumber === 1 || loading}
                                />
                                {[...Array(totalPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={pageNumber === index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                        disabled={loading}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next
                                    onClick={() => handlePageChange(pageNumber + 1)}
                                    disabled={pageNumber === totalPages || loading}
                                />
                                <Pagination.Last
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={pageNumber === totalPages || loading}
                                />
                            </Pagination>
                        </Col>
                    </Row>
                )}

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
    );
};

export default Blog;