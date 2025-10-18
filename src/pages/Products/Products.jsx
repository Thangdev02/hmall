import { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, Pagination, Toast, ToastContainer, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { Star, Heart, HeartFill, Search, Filter, Shop } from "react-bootstrap-icons";
import "./Products.css";
import { Link, useNavigate } from "react-router-dom";
import { getProducts, favoriteProduct } from "../../api/product";

const Products = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [showFilters, setShowFilters] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [totalItems, setTotalItems] = useState(0);
    const [showLoadMore, setShowLoadMore] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    // favorite states...
    const [favoriteLoadings, setFavoriteLoadings] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    const FAVORITES_KEY = 'userFavorites'

    const getFavoriteStatus = (productId) => {
        if (!token || !productId) return false
        try {
            const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
            const userFavorites = allFavorites[token] || {}
            return Boolean(userFavorites[productId])
        } catch (error) {
            console.error('Error reading favorites from localStorage:', error)
            return false
        }
    }

    const setFavoriteStatus = (productId, status) => {
        if (!token || !productId) return
        try {
            const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
            if (!allFavorites[token]) allFavorites[token] = {}
            if (status) allFavorites[token][productId] = true
            else delete allFavorites[token][productId]
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites))
            window.dispatchEvent(new CustomEvent('localStorageChange', {
                detail: { key: FAVORITES_KEY, productId, status }
            }))
        } catch (error) {
            console.error('Error saving favorite status to localStorage:', error)
        }
    }

    const handleFavoriteToggle = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname)
            navigate("/login")
            return
        }

        setFavoriteLoadings(prev => ({ ...prev, [productId]: true }));

        const oldStatus = getFavoriteStatus(productId)
        const newStatus = !oldStatus
        setFavoriteStatus(productId, newStatus)

        try {
            const response = await favoriteProduct(productId, token)
            if (response?.statusCode === 200) {
                setToastMessage(newStatus ? "Đã thêm vào danh sách yêu thích!" : "Đã bỏ khỏi danh sách yêu thích!")
                setToastType("success")
                setShowToast(true)
            } else {
                setFavoriteStatus(productId, oldStatus)
                setToastMessage(response?.message || "Có lỗi xảy ra!")
                setToastType("danger")
                setShowToast(true)
            }
        } catch (error) {
            console.error("Error toggling favorite:", error)
            setFavoriteStatus(productId, oldStatus)
            setToastMessage("Có lỗi xảy ra khi cập nhật yêu thích!")
            setToastType("danger")
            setShowToast(true)
        } finally {
            setFavoriteLoadings(prev => ({ ...prev, [productId]: false }));
        }
    }

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = {
                    search: searchQuery,
                    pageNumber,
                    pageSize,
                };

                if (selectedCategory !== "all") params.filter = selectedCategory;

                console.log("API params:", params);

                const res = await getProducts(params);
                console.log("API response:", res);

                let items = res?.data?.items || [];

                // Ensure normalized fields exist (API helper should do this, but double-check)
                items = items.map(it => ({
                    ...it,
                    status: (it.status || "").toString().trim(),
                    isInStock: typeof it.isInStock === "boolean" ? it.isInStock : ((it.status || "").toString().toLowerCase() === "available"),
                    isActive: typeof it.isActive === "boolean" ? it.isActive : (it.isInStock || false),
                    stock: Number(it.stock) || 0
                }));

                // Client-side filter by statusFilter using status / isInStock
                if (statusFilter === "active") {
                    items = items.filter(i => i.status === "Available" || i.isInStock === true);
                } else if (statusFilter === "inactive") {
                    items = items.filter(i => !(i.status === "Available" || i.isInStock === true));
                }

                setProducts(items);
                setTotalItems(res?.data?.totalRecord ?? items.length);
            } catch (error) {
                console.error(error);
                setError("Không thể tải sản phẩm. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [pageNumber, pageSize, selectedCategory, searchQuery, statusFilter]);

    const categories = useMemo(() => {
        const set = new Set(products.map((p) => p.category).filter(Boolean));
        return Array.from(set);
    }, [products]);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low": return a.price - b.price;
                case "price-high": return b.price - a.price;
                case "rating": return (b.rating || 0) - (a.rating || 0);
                case "name":
                default: return a.name.localeCompare(b.name);
            }
        });
        return filtered;
    }, [products, sortBy]);

    const handleSearch = () => {
        setSearchQuery(searchTerm);
        setPageNumber(1);
        setShowLoadMore(true);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleLoadMore = () => {
        setPageSize(12);
        setPageNumber(1);
        setShowLoadMore(false);
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    const handlePageChange = (newPage) => {
        setPageNumber(newPage);
        setPageSize(12);
        setShowLoadMore(false);
    };

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <Container>
                <section className="banner-section">
                    <div className="banner-overlay"></div>
                    <Container className="h-100">
                        <Row className="h-100 align-items-center justify-content-center text-center">
                            <Col>
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                    <h1 className="display-4 fw-bold mb-3 text-white">Sản Phẩm Handmade</h1>
                                    <p className="lead text-light">Khám phá bộ sưu tập đầy đủ các sản phẩm thủ công độc đáo</p>
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <Row className="mb-4">
                    <Col lg={5}>
                        <div className="position-relative d-flex">
                            <Form.Control type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress} style={{ paddingLeft: "15px", borderRadius: "25px 0 0 25px", border: "2px solid #e9ecef", borderRight: "none" }} />
                            <Button variant="primary" onClick={handleSearch} style={{ borderRadius: "0 25px 25px 0", border: "2px solid #84B4C8", backgroundColor: "#84B4C8", borderLeft: "none", minWidth: "60px" }}>
                                <Search size={16} />
                            </Button>
                        </div>
                    </Col>
                    <Col lg={2}>
                        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ borderRadius: "25px" }}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Còn hàng</option>
                            <option value="inactive">Hết hàng</option>
                        </Form.Select>
                    </Col>
                    <Col lg={3}>
                        <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ borderRadius: "25px" }}>
                            <option value="name">Sắp xếp theo tên</option>
                            <option value="price-low">Giá thấp đến cao</option>
                            <option value="price-high">Giá cao đến thấp</option>
                            <option value="rating">Đánh giá cao nhất</option>
                        </Form.Select>
                    </Col>
                    <Col lg={2}>
                        <Button variant="outline-secondary" onClick={() => setShowFilters(!showFilters)} style={{ borderRadius: "25px", minWidth: "120px" }}>
                            <Filter className="me-2" /> Bộ lọc
                        </Button>
                    </Col>
                </Row>

                {showFilters && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                        <Row className="mb-4">
                            <Col>
                                <Card className="p-3" style={{ backgroundColor: "#f8f9fa", border: "none" }}>
                                    <h6 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>Danh mục sản phẩm:</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Badge key="all" bg={selectedCategory === "all" ? "primary" : "light"} text={selectedCategory === "all" ? "white" : "dark"} style={{ cursor: "pointer", padding: "8px 16px", fontSize: "0.9rem", backgroundColor: selectedCategory === "all" ? "#84B4C8" : "#e9ecef" }} onClick={() => setSelectedCategory("all")}>Tất cả</Badge>
                                        {categories.map((category) => (
                                            <Badge key={category} bg={selectedCategory === category ? "primary" : "light"} text={selectedCategory === category ? "white" : "dark"} style={{ cursor: "pointer", padding: "8px 16px", fontSize: "0.9rem", backgroundColor: selectedCategory === category ? "#84B4C8" : "#e9ecef" }} onClick={() => setSelectedCategory(category)}>
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </motion.div>
                )}

                <Row className="mb-4">
                    <Col>
                        <p className="text-muted">
                            Hiển thị {filteredProducts.length} sản phẩm
                            {selectedCategory !== "all" && <span> trong danh mục "<strong>{selectedCategory}</strong>"</span>}
                            {statusFilter !== "all" && <span> - <strong>{statusFilter === "active" ? "Còn hàng" : "Hết hàng"}</strong></span>}
                            {searchQuery && <span> cho từ khóa "<strong>{searchQuery}</strong>"</span>}
                        </p>
                    </Col>
                </Row>

                {error && (
                    <Row className="mb-4">
                        <Col className="text-center">
                            <h4 className="text-danger">{error}</h4>
                        </Col>
                    </Row>
                )}

                <Row>
                    {loading ? (
                        <Col className="text-center py-5">
                            <h4>Đang tải sản phẩm...</h4>
                        </Col>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <Col lg={4} md={6} className="mb-4" key={product.id}>
                                <Link style={{ textDecoration: "none", color: "inherit" }} to={`/products/${product.id}`}>
                                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                                        <Card className="product-card h-100">
                                            <div className="position-relative">
                                                <Card.Img variant="top" src={product.commonImage || "public/images/gallery-1.jpg"} className="product-image" />
                                                {(product.status === "Available" || product.isInStock) ? (
                                                    <Badge bg="success" className="position-absolute" style={{ top: "10px", left: "10px" }}>Còn hàng</Badge>
                                                ) : (
                                                    <Badge bg="danger" className="position-absolute" style={{ top: "10px", left: "10px" }}>Hết hàng</Badge>
                                                )}
                                                <Button variant="light" className="position-absolute" style={{ top: "10px", right: "10px", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255, 255, 255, 0.9)", border: "none" }} onClick={(e) => handleFavoriteToggle(e, product.id)} disabled={favoriteLoadings[product.id]} title={getFavoriteStatus(product.id) ? "Bỏ yêu thích" : "Yêu thích"}>
                                                    {favoriteLoadings[product.id] ? <Spinner size="sm" /> : getFavoriteStatus(product.id) ? <HeartFill color="#ff0000" size={16} /> : <Heart size={16} />}
                                                </Button>
                                            </div>
                                            <Card.Body className="card-body">
                                                <div className="mb-2">
                                                    <Badge bg="light" text="dark" style={{ fontSize: "0.75rem" }}>{product.category}</Badge>
                                                </div>
                                                <Card.Title className="fw-bold card-title" style={{ color: "#2c3e50" }}>{product.name}</Card.Title>

                                                {product.shopID && product.shopName && (
                                                    <div className="mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <Shop size={14} className="text-primary me-1" />
                                                            <small className="text-muted fw-bold">{product.shopName}</small>
                                                        </div>
                                                    </div>
                                                )}

                                                <Card.Text className="text-muted card-text" style={{ fontSize: "0.9rem" }}>
                                                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                                </Card.Text>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="fw-bold" style={{ color: "#84B4C8", fontSize: "1.3rem" }}>{product.price?.toLocaleString("vi-VN")}đ</span>
                                                    <div className="d-flex align-items-center">
                                                        <Star fill="#ffc107" color="#ffc107" size={16} />
                                                        <span className="ms-1 text-muted fw-bold">{product.rating || 0}</span>
                                                    </div>
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <Button variant="outline-secondary" style={{ borderRadius: "25px" }}>Xem chi tiết</Button>
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
                                <Button className="btn-primary-custom" onClick={() => { setSearchTerm(""); setSearchQuery(""); setSelectedCategory("all"); setStatusFilter("all"); }}>Xem Tất Cả Sản Phẩm</Button>
                            </motion.div>
                        </Col>
                    )}
                </Row>

                {filteredProducts.length > 0 && (
                    <Row className="mt-5">
                        <Col className="text-center">
                            {showLoadMore && <Button variant="outline-primary" size="lg" style={{ borderRadius: "25px", marginBottom: "20px" }} className="load-more-button" onClick={handleLoadMore} disabled={loading}>Xem Thêm Sản Phẩm</Button>}
                            {!showLoadMore && totalPages >= 1 && (
                                <Pagination className="justify-content-center">
                                    <Pagination.First onClick={() => handlePageChange(1)} disabled={pageNumber === 1 || loading} />
                                    <Pagination.Prev onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1 || loading} />
                                    {[...Array(totalPages)].map((_, index) => (
                                        <Pagination.Item key={index + 1} active={pageNumber === index + 1} onClick={() => handlePageChange(index + 1)} disabled={loading}>{index + 1}</Pagination.Item>
                                    ))}
                                    <Pagination.Next onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber === totalPages || loading} />
                                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={pageNumber === totalPages || loading} />
                                </Pagination>
                            )}
                        </Col>
                    </Row>
                )}

                <ToastContainer position="top-end" className="p-3">
                    <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastType}><Toast.Body className="text-white">{toastMessage}</Toast.Body></Toast>
                </ToastContainer>
            </Container>
        </div>
    );
};

export default Products;