import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Badge, Pagination } from "react-bootstrap";
import { motion } from "framer-motion";
import { Star, Search, Filter, GeoAltFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { getShops } from "../../api/shop";
import "./Shop.css";

const Shop = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(9);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedProvince, setSelectedProvince] = useState("all");
    // eslint-disable-next-line no-unused-vars
    const [isActiveFilter, setIsActiveFilter] = useState(true);

    useEffect(() => {
        const fetchShops = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getShops({
                    search: searchTerm,
                    filter: selectedProvince !== "all" ? selectedProvince : "",
                    pageNumber,
                    pageSize,
                    IsActive: isActiveFilter
                });

                console.log("API response:", res);

                if (res.statusCode === 200) {
                    const data = res.data.items || [];
                    setShops(data);
                    setTotalItems(res.data.totalRecord || 0);
                    setTotalPages(res.data.totalPages || 0);
                } else {
                    setError(res.message || "Không thể tải danh sách shop");
                }
            } catch (error) {
                console.error(error);
                setError("Không thể tải danh sách shop. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, [pageNumber, pageSize, selectedProvince, searchTerm, isActiveFilter]);

    // Lấy danh sách tỉnh/thành phố từ shops
    const provinces = [...new Set(shops.map(shop => shop.province).filter(Boolean))];

    const handlePageChange = (newPage) => {
        setPageNumber(newPage);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPageNumber(1); // Reset về trang đầu khi search
    };

    const handleProvinceFilter = (province) => {
        setSelectedProvince(province);
        setPageNumber(1); // Reset về trang đầu khi filter
    };

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <Container>
                {/* Banner Section */}
                <section className="shop-banner-section">
                    <div className="shop-banner-overlay"></div>
                    <Container className="h-100">
                        <Row className="h-100 align-items-center justify-content-center text-center">
                            <Col>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h1 className="display-4 fw-bold mb-3 text-white">Cửa Hàng Handmade</h1>
                                    <p className="lead text-light">
                                        Khám phá các cửa hàng thủ công độc đáo trên khắp Việt Nam
                                    </p>
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Search and Filter Section */}
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
                                placeholder="Tìm kiếm cửa hàng..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={{
                                    paddingLeft: "45px",
                                    borderRadius: "25px",
                                    border: "2px solid #e9ecef",
                                }}
                            />
                        </div>
                    </Col>
                    <Col lg={4} className="d-flex gap-2">

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

                {/* Filters */}
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
                                        Lọc theo tỉnh/thành phố:
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Badge
                                            bg={selectedProvince === "all" ? "primary" : "light"}
                                            text={selectedProvince === "all" ? "white" : "dark"}
                                            style={{
                                                cursor: "pointer",
                                                padding: "8px 16px",
                                                fontSize: "0.9rem",
                                                backgroundColor: selectedProvince === "all" ? "#84B4C8" : "#e9ecef",
                                            }}
                                            onClick={() => handleProvinceFilter("all")}
                                        >
                                            Tất cả
                                        </Badge>
                                        {provinces.map((province) => (
                                            <Badge
                                                key={province}
                                                bg={selectedProvince === province ? "primary" : "light"}
                                                text={selectedProvince === province ? "white" : "dark"}
                                                style={{
                                                    cursor: "pointer",
                                                    padding: "8px 16px",
                                                    fontSize: "0.9rem",
                                                    backgroundColor: selectedProvince === province ? "#84B4C8" : "#e9ecef",
                                                }}
                                                onClick={() => handleProvinceFilter(province)}
                                            >
                                                {province}
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
                            Hiển thị {shops.length} cửa hàng
                            {selectedProvince !== "all" && (
                                <span>
                                    {" "}
                                    tại "<strong>{selectedProvince}</strong>"
                                </span>
                            )}
                            {searchTerm && (
                                <span>
                                    {" "}
                                    cho từ khóa "<strong>{searchTerm}</strong>"
                                </span>
                            )}
                            {" "}
                            (Tổng: {totalItems} cửa hàng)
                        </p>
                    </Col>
                </Row>

                {/* Error Message */}
                {error && (
                    <Row className="mb-4">
                        <Col className="text-center">
                            <h4 className="text-danger">{error}</h4>
                        </Col>
                    </Row>
                )}

                {/* Shops Grid */}
                <Row>
                    {loading ? (
                        <Col className="text-center py-5">
                            <h4>Đang tải cửa hàng...</h4>
                        </Col>
                    ) : shops.length > 0 ? (
                        shops.map((shop, index) => (
                            <Col lg={4} md={6} className="mb-4" key={shop.shopID}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Card className="shop-card h-100">
                                        <div className="position-relative">
                                            <Card.Img
                                                variant="top"
                                                src={shop.logo || "/images/default-shop-logo.svg"}
                                                className="shop-logo-image"
                                                onError={(e) => {
                                                    e.target.src = "/images/default-shop-logo.svg";
                                                }}
                                            />
                                            <Badge
                                                bg={shop.isActive ? "success" : "danger"}
                                                className="position-absolute"
                                                style={{ top: "10px", left: "10px" }}
                                            >
                                                {shop.isActive ? "Đang hoạt động" : "Tạm đóng cửa"}
                                            </Badge>
                                        </div>
                                        <Card.Body className="shop-card-body">
                                            <Card.Title className="fw-bold shop-title" style={{ color: "#2c3e50" }}>
                                                {shop.name}
                                            </Card.Title>
                                            <div className="mb-2">
                                                <div className="d-flex align-items-center text-muted mb-1">
                                                    <GeoAltFill className="me-2" size={14} />
                                                    <small>{shop.address}</small>
                                                </div>
                                                <div className="d-flex align-items-center text-muted">
                                                    <small>{shop.city}, {shop.province}</small>
                                                </div>
                                            </div>

                                            <div className="d-grid gap-2">
                                                <Link to={`/shop/${shop.shopID}/products`} style={{ textDecoration: "none" }}>
                                                    <Button
                                                        variant="outline-primary"
                                                        style={{ borderRadius: "25px" }}
                                                        className="w-100"
                                                    >
                                                        Xem sản phẩm
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))
                    ) : (
                        <Col className="text-center py-5">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h4 className="text-muted mb-3">Không tìm thấy cửa hàng nào</h4>
                                <p className="text-muted">
                                    Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm cửa hàng.
                                </p>
                                <Button
                                    className="btn-primary-custom"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedProvince("all");
                                    }}
                                >
                                    Xem Tất Cả Cửa Hàng
                                </Button>
                            </motion.div>
                        </Col>
                    )}
                </Row>

                {/* Pagination */}
                {shops.length > 0 && totalPages > 1 && (
                    <Row className="mt-5">
                        <Col className="text-center">
                            <Pagination className="justify-content-center">
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
            </Container>
        </div>
    );
};

export default Shop;