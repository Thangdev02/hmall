import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Badge, Form, Button, Spinner, Alert, Pagination, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { Calendar, Person, Search, ArrowRight, Heart, ChatDots, Plus, Upload, X } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getBlogs, createBlog } from "../../api/blog";
import { uploadMultipleFiles } from "../../api/upload";

const BASE_API_URL = "https://hmstoresapi.eposh.io.vn/";

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
    const [featuredBlog, setFeaturedBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // State cho modal tạo blog
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newBlog, setNewBlog] = useState({
        title: '',
        content: '',
        image: ''
    });
    const [createAlert, setCreateAlert] = useState({ show: false, message: '', variant: 'success' });

    const token = localStorage.getItem('token');
    const imageRef = useRef();

    // React Quill configuration
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['link'],
            ['clean']
        ],
    };

    const quillFormats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'blockquote', 'code-block', 'link'
    ];

    // Lấy blog có nhiều like nhất cho featured
    const fetchFeaturedBlog = async () => {
        try {
            const res = await getBlogs({
                pageNumber: 1,
                pageSize: 50,
                sortBy: 'totalLike',
                sortOrder: 'desc'
            });

            if (res.statusCode === 200 && res.data.items.length > 0) {
                const mostLikedBlog = res.data.items.reduce((prev, current) => {
                    return (current.totalLike > prev.totalLike) ? current : prev;
                });

                setFeaturedBlog(mostLikedBlog);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            // ignore
        }
    };

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

                const res = await getBlogs(params);

                if (res.statusCode === 200) {
                    setBlogs(res.data.items || []);
                    setTotalPages(res.data.totalPages || 1);
                    setTotalItems(res.data.totalRecord || 0);

                    if (!searchTerm && pageNumber === 1) {
                        await fetchFeaturedBlog();
                    }
                } else {
                    setError(res.message || 'Không thể tải bài viết');
                }
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setError('Không thể tải bài viết. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [pageNumber, pageSize, searchTerm]);

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
        setFeaturedBlog(null);
    };

    // Xử lý thay đổi trang
    const handlePageChange = (newPage) => {
        setPageNumber(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset bộ lọc
    const resetFilters = () => {
        setSearchTerm('');
        setPageNumber(1);
    };

    // Validate image
    const validateImage = (file) => {
        const maxSize = 5 * 1024 * 1024;
        if (!file.type.startsWith("image/")) {
            return "Chỉ chấp nhận file ảnh (jpg, png, etc.)";
        }
        if (file.size > maxSize) {
            return "Kích thước ảnh tối đa là 5MB";
        }
        return "";
    };

    // Xử lý upload ảnh
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imageError = validateImage(file);
        if (imageError) {
            setCreateAlert({ show: true, message: imageError, variant: 'danger' });
            return;
        }

        setUploading(true);
        try {
            const res = await uploadMultipleFiles({ files: [file], customeFolder: "blogs" }, token);
            const relativePath = res?.files?.[0];
            if (relativePath) {
                const imgUrl = `${BASE_API_URL}${relativePath}`;
                setNewBlog(prev => ({ ...prev, image: imgUrl }));
                setCreateAlert({ show: true, message: 'Upload ảnh thành công!', variant: 'success' });
            } else {
                setCreateAlert({ show: true, message: 'Tải ảnh thất bại: Không nhận được đường dẫn ảnh', variant: 'danger' });
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setCreateAlert({ show: true, message: 'Tải ảnh thất bại!', variant: 'danger' });
        } finally {
            setUploading(false);
        }
    };

    // Xóa ảnh
    const handleRemoveImage = () => {
        setNewBlog(prev => ({ ...prev, image: '' }));
        if (imageRef.current) {
            imageRef.current.value = null;
        }
    };

    // Strip HTML tags for plain text (for validation)
    const stripHtml = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    // Xử lý tạo blog mới (validate tất cả trường có dấu *)
    const handleCreateBlog = async () => {
        if (!newBlog.title.trim()) {
            setCreateAlert({ show: true, message: 'Vui lòng nhập tiêu đề bài viết!', variant: 'danger' });
            return;
        }
        if (!newBlog.image) {
            setCreateAlert({ show: true, message: 'Vui lòng chọn ảnh bài viết!', variant: 'danger' });
            return;
        }
        const plainTextContent = stripHtml(newBlog.content);
        if (!plainTextContent.trim()) {
            setCreateAlert({ show: true, message: 'Vui lòng nhập nội dung bài viết!', variant: 'danger' });
            return;
        }

        setCreateLoading(true);
        try {
            const blogData = {
                title: newBlog.title,
                content: newBlog.content,
                image: newBlog.image || ''
            };

            const res = await createBlog(blogData, token);

            if (res.statusCode === 200) {
                setCreateAlert({ show: true, message: 'Tạo bài viết thành công!', variant: 'success' });
                setNewBlog({ title: '', content: '', image: '' });
                if (imageRef.current) {
                    imageRef.current.value = null;
                }
                setTimeout(() => {
                    setShowCreateModal(false);
                    setCreateAlert({ show: false, message: '', variant: 'success' });
                    setPageNumber(1);
                    window.location.reload();
                }, 1500);
            } else {
                setCreateAlert({ show: true, message: res.message || 'Có lỗi xảy ra!', variant: 'danger' });
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setCreateAlert({ show: true, message: 'Có lỗi xảy ra khi tạo bài viết!', variant: 'danger' });
        } finally {
            setCreateLoading(false);
        }
    };

    // Đóng modal tạo blog
    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setNewBlog({ title: '', content: '', image: '' });
        setCreateAlert({ show: false, message: '', variant: 'success' });
        if (imageRef.current) {
            imageRef.current.value = null;
        }
    };

    // Lọc ra các blog không phải featured để hiển thị trong grid
    const filteredBlogs = blogs.filter(blog =>
        !featuredBlog || blog.id !== featuredBlog.id
    );

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
                <Row className="mb-4 ">
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
                        {/* Button tạo bài viết mới */}
                        {token && (
                            <Button
                                variant="primary"
                                onClick={() => setShowCreateModal(true)}
                                style={{
                                    borderRadius: '25px',
                                    background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                                    border: "none",
                                    fontWeight: "600"
                                }}
                            >
                                <Plus className="me-2" />
                                Tạo bài viết
                            </Button>
                        )}
                        {searchTerm && (
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

                {/* Results Info */}
                <Row className="mb-4">
                    <Col>
                        <p className="text-muted">
                            Hiển thị {blogs.length} trong tổng số {totalItems} bài viết
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

                {/* Featured Post - Blog có nhiều like nhất */}
                {featuredBlog && !searchTerm && !loading && pageNumber === 1 && (
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
                                                src={featuredBlog.image || 'https://via.placeholder.com/400x400/84B4C8/ffffff?text=Blog+Image'}
                                                alt={featuredBlog.title}
                                                style={{ height: "400px", objectFit: "cover" }}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <Card.Body className="p-5 d-flex flex-column h-100">
                                                <div>
                                                    <Badge
                                                        bg="primary"
                                                        className="mb-3"
                                                        style={{ backgroundColor: "#FF6B6B", fontSize: "0.8rem" }}
                                                    >
                                                        🔥 Bài viết được yêu thích nhất
                                                    </Badge>
                                                    <Card.Title className="fw-bold mb-3" style={{ color: "#2c3e50", fontSize: "1.5rem" }}>
                                                        {featuredBlog.title}
                                                    </Card.Title>
                                                    <p className="text-muted mb-3" style={{ fontSize: "0.95rem" }}>
                                                        {stripHtml(featuredBlog.content || '').substring(0, 150)}...
                                                    </p>
                                                </div>
                                                <div className="mt-auto">
                                                    <div className="d-flex align-items-center mb-3 text-muted">
                                                        <Person size={16} className="me-2" />
                                                        <span className="me-3">{featuredBlog.author}</span>
                                                        <Calendar size={16} className="me-2" />
                                                        <span className="me-3">{formatDate(featuredBlog.publishDate)}</span>
                                                        <Heart size={16} className="me-2" style={{ color: '#FF6B6B' }} />
                                                        <span className="me-3 fw-bold" style={{ color: '#FF6B6B' }}>
                                                            {featuredBlog.totalLike}
                                                        </span>
                                                        <ChatDots size={16} className="me-2" />
                                                        <span>{featuredBlog.totalComment}</span>
                                                    </div>
                                                    <Link to={`/blog/${featuredBlog.id}`} style={{ textDecoration: 'none' }}>
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
                    ) : (searchTerm ? blogs : filteredBlogs).length > 0 ? (
                        (searchTerm ? blogs : filteredBlogs).map((post, index) => (
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
                                <p className="text-muted">Hãy thử thay đổi từ khóa tìm kiếm để xem thêm bài viết.</p>
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

            </Container>

            {/* Modal tạo bài viết mới */}
            <Modal show={showCreateModal} onHide={handleCloseCreateModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo bài viết mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {createAlert.show && (
                        <Alert variant={createAlert.variant} className="mb-3">
                            {createAlert.message}
                        </Alert>
                    )}

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Tiêu đề bài viết <span style={{ color: "red" }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tiêu đề bài viết..."
                                value={newBlog.title}
                                onChange={(e) => setNewBlog(prev => ({ ...prev, title: e.target.value }))}
                                maxLength={200}
                                isInvalid={!newBlog.title.trim() && createAlert.show}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập tiêu đề bài viết!
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                {newBlog.title.length}/200 ký tự
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Ảnh bài viết <span style={{ color: "red" }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                ref={imageRef}
                                onChange={handleImageUpload}
                                disabled={uploading}
                                aria-describedby="image-help"
                                isInvalid={!newBlog.image && createAlert.show}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng chọn ảnh bài viết!
                            </Form.Control.Feedback>
                            <Form.Text id="image-help" muted>
                                Chọn file ảnh (jpg, png, tối đa 5MB)*
                            </Form.Text>
                            {newBlog.image && (
                                <div className="mt-2 position-relative d-inline-block">
                                    <img
                                        src={newBlog.image}
                                        alt="Blog"
                                        style={{ width: 150, height: 100, objectFit: "cover", borderRadius: 6 }}
                                    />
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="position-absolute top-0 end-0"
                                        onClick={handleRemoveImage}
                                        aria-label="Xóa ảnh"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Nội dung bài viết <span style={{ color: "red" }}>*</span>
                            </Form.Label>
                            <ReactQuill
                                theme="snow"
                                value={newBlog.content}
                                onChange={(content) => setNewBlog(prev => ({ ...prev, content }))}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Viết nội dung bài viết của bạn..."
                                style={{ height: '200px', marginBottom: '50px' }}
                            />
                            {(!stripHtml(newBlog.content).trim() && createAlert.show) && (
                                <div style={{ color: "red", fontSize: 13, marginTop: 4 }}>
                                    Vui lòng nhập nội dung bài viết!
                                </div>
                            )}
                            <Form.Text className="text-muted">
                                {stripHtml(newBlog.content).length}/5000 ký tự
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseCreateModal}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateBlog}
                        disabled={createLoading || uploading || !newBlog.title.trim() || !stripHtml(newBlog.content).trim() || !newBlog.image}
                        style={{
                            background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                            border: "none"
                        }}
                    >
                        {createLoading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang tạo...
                            </>
                        ) : uploading ? (
                            <>
                                <Upload className="me-2" />
                                Đang upload...
                            </>
                        ) : (
                            <>
                                <Plus className="me-2" />
                                Tạo bài viết
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Blog;