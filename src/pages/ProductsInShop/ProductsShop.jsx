import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Pagination, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Star, Heart, HeartFill, Search, Filter } from 'react-bootstrap-icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProducts, favoriteProduct } from '../../api/product';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import './ProductsShop.css';

const ProductsShop = () => {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Like (favorite) states
    const [favoriteLoadings, setFavoriteLoadings] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    // Utility for localStorage favorite
    const FAVORITES_KEY = 'userFavorites';

    const getFavoriteStatus = (productId) => {
        if (!token || !productId) return false;
        try {
            const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}');
            const userFavorites = allFavorites[token] || {};
            return Boolean(userFavorites[productId]);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            return false;
        }
    };

    const setFavoriteStatus = (productId, status) => {
        if (!token || !productId) return;
        try {
            const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}');
            if (!allFavorites[token]) {
                allFavorites[token] = {};
            }
            if (status) {
                allFavorites[token][productId] = true;
            } else {
                delete allFavorites[token][productId];
            }
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites));
            window.dispatchEvent(new CustomEvent('localStorageChange', {
                detail: { key: FAVORITES_KEY, productId, status }
            }));
            // eslint-disable-next-line no-unused-vars, no-empty
        } catch (error) { }
    };

    const handleFavoriteToggle = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!token) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname)
            navigate("/login")
            return
        }

        setFavoriteLoadings(prev => ({ ...prev, [productId]: true }));

        const oldStatus = getFavoriteStatus(productId);
        const newStatus = !oldStatus;

        setFavoriteStatus(productId, newStatus);

        try {
            const response = await favoriteProduct(productId, token);

            if (response?.statusCode === 200) {
                setToastMessage(
                    newStatus
                        ? "Đã thêm vào danh sách yêu thích!"
                        : "Đã bỏ khỏi danh sách yêu thích!"
                );
                setToastType("success");
                setShowToast(true);
            } else {
                setFavoriteStatus(productId, oldStatus);
                setToastMessage(response?.message || "Có lỗi xảy ra!");
                setToastType("danger");
                setShowToast(true);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setFavoriteStatus(productId, oldStatus);
            setToastMessage("Có lỗi xảy ra khi cập nhật yêu thích!");
            setToastType("danger");
            setShowToast(true);
        } finally {
            setFavoriteLoadings(prev => ({ ...prev, [productId]: false }));
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = {
                    pageNumber,
                    pageSize,
                    ShopID: shopId,
                    isActive: true,
                };

                if (searchTerm) params.search = searchTerm;
                if (selectedCategory !== 'all') params.filter = selectedCategory;

                const res = await getProducts(params);

                if (res.statusCode === 200) {
                    // normalize items locally as a safety-net (API helper should also normalize)
                    const itemsRaw = res.data.items || [];
                    const items = itemsRaw.map(it => {
                        const stock = Number(it.stock) || 0;
                        const statusRaw = (it.status || "").toString().trim();
                        const statusLower = statusRaw.toLowerCase();
                        const isInStock = statusRaw ? (statusLower === "available") : (stock > 0);
                        return {
                            ...it,
                            stock,
                            status: statusRaw,
                            isInStock,
                            isActive: typeof it.isActive === "boolean" ? it.isActive : isInStock,
                        };
                    });

                    setProducts(items);
                    setTotalPages(res.data.totalPages || 1);
                    setTotalItems(res.data.totalRecord || items.length);
                } else {
                    setError(res.message || 'Không thể tải sản phẩm');
                }
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setError('Không thể tải sản phẩm. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        if (shopId) {
            fetchProducts();
        }
    }, [shopId, pageNumber, pageSize, searchTerm, selectedCategory]);

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    const handleSearch = (e) => {
        e.preventDefault();
        setPageNumber(1);
    };

    const handlePageChange = (newPage) => {
        setPageNumber(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setPageNumber(1);
    };

    if (!shopId) {
        return (
            <Container className="py-5">
                <Alert variant="warning" className="text-center">
                    <h4>Không tìm thấy thông tin shop</h4>
                    <p>Vui lòng kiểm tra lại đường dẫn hoặc thông tin shop.</p>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="products-shop-page" style={{ paddingTop: "100px" }}>
            <Container className="py-4">
                {/* Header */}
                <div className="shop-header mb-4">
                    {products.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="shop-name">{products[0].shopName}</h2>
                            <p className="shop-info text-muted">
                                📍 {products[0].shopAddress} | 📞 {products[0].shopPhone}
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Thanh tìm kiếm và bộ lọc */}
                <Row className="mb-4">
                    <Col lg={8}>
                        <Form onSubmit={handleSearch}>
                            <div className="position-relative">
                                <Search
                                    className="position-absolute"
                                    style={{
                                        left: '15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6c757d',
                                    }}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm trong shop..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        paddingLeft: '45px',
                                        borderRadius: '25px',
                                        border: '2px solid #e9ecef',
                                    }}
                                />
                            </div>
                        </Form>
                    </Col>
                    <Col lg={4} className="d-flex gap-2">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ borderRadius: '25px', minWidth: '120px' }}
                        >
                            <Filter className="me-2" />
                            Bộ lọc
                        </Button>
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

                {/* Bộ lọc danh mục */}
                {showFilters && categories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Row className="mb-4">
                            <Col>
                                <Card className="p-3" style={{ backgroundColor: '#f8f9fa', border: 'none' }}>
                                    <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>
                                        Danh mục sản phẩm:
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Badge
                                            bg={selectedCategory === 'all' ? 'primary' : 'light'}
                                            text={selectedCategory === 'all' ? 'white' : 'dark'}
                                            style={{
                                                cursor: 'pointer',
                                                padding: '8px 16px',
                                                fontSize: '0.9rem',
                                                backgroundColor: selectedCategory === 'all' ? '#84B4C8' : '#e9ecef',
                                            }}
                                            onClick={() => setSelectedCategory('all')}
                                        >
                                            Tất cả
                                        </Badge>
                                        {categories.map((category) => (
                                            <Badge
                                                key={category}
                                                bg={selectedCategory === category ? 'primary' : 'light'}
                                                text={selectedCategory === category ? 'white' : 'dark'}
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '8px 16px',
                                                    fontSize: '0.9rem',
                                                    backgroundColor: selectedCategory === category ? '#84B4C8' : '#e9ecef',
                                                }}
                                                onClick={() => setSelectedCategory(category)}
                                            >
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </motion.div>
                )}

                {/* Thông tin kết quả */}
                <Row className="mb-4">
                    <Col>
                        <p className="text-muted">
                            Hiển thị {products.length} trong tổng số {totalItems} sản phẩm
                            {selectedCategory !== 'all' && (
                                <span> trong danh mục "<strong>{selectedCategory}</strong>"</span>
                            )}
                            {searchTerm && (
                                <span> cho từ khóa "<strong>{searchTerm}</strong>"</span>
                            )}
                        </p>
                    </Col>
                </Row>

                {/* Hiển thị lỗi */}
                {error && (
                    <Row className="mb-4">
                        <Col className="text-center">
                            <Alert variant="danger">{error}</Alert>
                        </Col>
                    </Row>
                )}

                {/* Danh sách sản phẩm */}
                <Row>
                    {loading ? (
                        <Col className="text-center py-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </Spinner>
                            <h4 className="mt-3">Đang tải sản phẩm...</h4>
                        </Col>
                    ) : products.length > 0 ? (
                        products.map((product, index) => (
                            <Col lg={4} md={6} className="mb-4" key={product.id}>
                                <Link
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                    to={`/products/${product.id}`}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <Card className="product-card h-100">
                                            <div className="position-relative">
                                                <Card.Img
                                                    variant="top"
                                                    src={product.commonImage || '/images/gallery-1.jpg'}
                                                    className="product-image"
                                                    style={{
                                                        objectFit: 'cover',
                                                        height: '250px'
                                                    }}
                                                />
                                                {(product.status === 'Available' || product.isInStock) ? (
                                                    <Badge
                                                        bg="success"
                                                        className="position-absolute"
                                                        style={{ top: '10px', left: '10px' }}
                                                    >
                                                        Còn hàng
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        bg="danger"
                                                        className="position-absolute"
                                                        style={{ top: '10px', left: '10px' }}
                                                    >
                                                        Hết hàng
                                                    </Badge>
                                                )}
                                                {/* Like button giống Products */}
                                                <Button
                                                    variant="light"
                                                    className="position-absolute"
                                                    style={{
                                                        top: '10px',
                                                        right: '10px',
                                                        borderRadius: '50%',
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                                        border: 'none'
                                                    }}
                                                    onClick={(e) => handleFavoriteToggle(e, product.id)}
                                                    disabled={favoriteLoadings[product.id]}
                                                    title={getFavoriteStatus(product.id) ? "Bỏ yêu thích" : "Yêu thích"}
                                                >
                                                    {favoriteLoadings[product.id] ? (
                                                        <Spinner size="sm" />
                                                    ) : getFavoriteStatus(product.id) ? (
                                                        <HeartFill color="#ff0000" size={16} />
                                                    ) : (
                                                        <Heart size={16} />
                                                    )}
                                                </Button>
                                            </div>
                                            <Card.Body className="d-flex flex-column">
                                                <div className="mb-2">
                                                    <Badge bg="light" text="dark" style={{ fontSize: '0.75rem' }}>
                                                        {product.category}
                                                    </Badge>
                                                </div>
                                                <Card.Title className="fw-bold" style={{ color: '#2c3e50' }}>
                                                    {product.name}
                                                </Card.Title>
                                                <Card.Text
                                                    className="text-muted flex-grow-1"
                                                    style={{
                                                        fontSize: '0.9rem',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <ReactQuill
                                                        value={product.description || ""}
                                                        readOnly
                                                        theme="bubble"
                                                        modules={{ toolbar: false }}
                                                        style={{
                                                            background: "transparent",
                                                            padding: 0,
                                                            minHeight: 0,
                                                            fontSize: "0.9rem"
                                                        }}
                                                    />
                                                </Card.Text>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="fw-bold" style={{ color: '#84B4C8', fontSize: '1.3rem' }}>
                                                        {product.price?.toLocaleString('vi-VN')}đ
                                                    </span>
                                                    <div className="d-flex align-items-center">
                                                        <Star fill="#ffc107" color="#ffc107" size={16} />
                                                        <span className="ms-1 text-muted fw-bold">
                                                            {product.rating}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <Button
                                                        variant="outline-secondary"
                                                        style={{ borderRadius: '25px' }}
                                                    >
                                                        Xem chi tiết
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
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h4 className="text-muted mb-3">Không tìm thấy sản phẩm nào</h4>
                                <p className="text-muted">
                                    Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm sản phẩm.
                                </p>
                                <Button
                                    className="btn-primary-custom"
                                    onClick={resetFilters}
                                >
                                    Xem Tất Cả Sản Phẩm
                                </Button>
                            </motion.div>
                        </Col>
                    )}
                </Row>

                {/* Phân trang */}
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

                {/* Toast notifications */}
                <ToastContainer position="top-end" className="p-3">
                    <Toast
                        onClose={() => setShowToast(false)}
                        show={showToast}
                        delay={3000}
                        autohide
                        bg={toastType}
                    >
                        <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        </div>
    );
};

export default ProductsShop;