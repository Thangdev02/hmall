import React, { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col, Badge, Spinner, Alert, Image, Modal, Card } from "react-bootstrap";
import { Eye, Envelope, Telephone, GeoAlt, Calendar } from "react-bootstrap-icons";
import { getShops } from "../../api/shop";
import { getShopDetail } from "../../api/shop";
import { blockUnblockShop } from "../../api/user";

export default function ShopsManagement() {
    const [allShops, setAllShops] = useState([]); // Lưu toàn bộ dữ liệu từ BE
    const [shops, setShops] = useState([]); // Danh sách hiển thị sau khi lọc FE
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalRecord: 0
    });
    const [filters, setFilters] = useState({
        search: "",
        status: "" // "all" | "active" | "blocked"
    });

    // Detail modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const token = localStorage.getItem("token");

    // Lấy toàn bộ shops (không truyền IsActive lên BE)
    const fetchShops = async () => {
        setLoading(true);
        try {
            const response = await getShops({
                pageNumber: pagination.pageNumber,
                pageSize: pagination.pageSize,
                search: filters.search,
                filter: filters.filter
            }, token);

            if (response.statusCode === 200) {
                setAllShops(response.data.items || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.totalPages || 0,
                    totalRecord: response.data.totalRecord || 0
                }));
                setError("");
            } else {
                setError(response.message || "Lỗi khi tải danh sách cửa hàng");
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Lỗi kết nối server");
        }
        setLoading(false);
    };

    // FE tự lọc theo trạng thái
    useEffect(() => {
        let filtered = allShops;
        if (filters.status === "active") {
            filtered = allShops.filter(shop => shop.isActive === true);
        } else if (filters.status === "blocked") {
            filtered = allShops.filter(shop => shop.isActive === false);
        }
        setShops(filtered);
    }, [allShops, filters.status]);

    const fetchShopDetail = async (shopId) => {
        setDetailLoading(true);
        try {
            const response = await getShopDetail(shopId, token);

            if (response.statusCode === 200) {
                setSelectedShop(response.data);
                setShowDetailModal(true);
            } else {
                setError(response.message || "Lỗi khi tải thông tin chi tiết cửa hàng");
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Lỗi kết nối server");
        }
        setDetailLoading(false);
    };

    const handleViewDetail = (shopId) => {
        fetchShopDetail(shopId);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedShop(null);
    };

    const handleBlockUnblock = async (shopId) => {
        try {
            const response = await blockUnblockShop(shopId, token);
            if (response.statusCode === 200) {
                setSuccess("Cập nhật trạng thái cửa hàng thành công");
                fetchShops();
                if (selectedShop && selectedShop.id === shopId) {
                    setSelectedShop(prev => ({ ...prev, isActive: !prev.isActive }));
                }
            } else {
                setError(response.message || "Lỗi khi cập nhật trạng thái cửa hàng");
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Lỗi kết nối server");
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, pageNumber: newPage }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
        fetchShops();
    };

    const handleStatusFilter = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    };

    useEffect(() => {
        fetchShops();
        // eslint-disable-next-line
    }, [pagination.pageNumber, pagination.pageSize, filters.search]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div>
            <h2 className="mb-4">Quản lý Cửa hàng</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* Bộ lọc */}
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm cửa hàng..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={filters.status}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="blocked">Bị khóa</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Button variant="primary" onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
                </Col>
            </Row>

            {/* Bảng cửa hàng */}
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Logo</th>
                                <th>ID</th>
                                <th>Tên cửa hàng</th>
                                <th>Địa chỉ</th>
                                <th>Thành phố</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shops.length > 0 ? shops.map((shop) => (
                                <tr key={shop.shopID}>
                                    <td>
                                        <Image
                                            src={shop.logo}
                                            alt={shop.name}
                                            width="50"
                                            height="50"
                                            roundedCircle
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/50x50?text=Logo";
                                            }}
                                        />
                                    </td>
                                    <td>{shop.shopID}</td>
                                    <td>{shop.name}</td>
                                    <td>{shop.address}</td>
                                    <td>{shop.city}, {shop.province}</td>
                                    <td>
                                        <Badge bg={shop.isActive ? "success" : "danger"}>
                                            {shop.isActive ? "Đang hoạt động" : "Bị khóa"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => handleViewDetail(shop.shopID)}
                                            className="me-2"
                                            disabled={detailLoading}
                                        >
                                            <Eye className="me-1" />
                                            Xem
                                        </Button>
                                        <Button
                                            variant={shop.isActive ? "danger" : "success"}
                                            size="sm"
                                            onClick={() => handleBlockUnblock(shop.shopID)}
                                        >
                                            {shop.isActive ? "Khóa" : "Mở khóa"}
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* Phân trang */}
                    <div className="d-flex justify-content-between align-items-center">

                        <div>
                            <Button
                                variant="outline-primary"
                                disabled={pagination.pageNumber === 1}
                                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                className="me-2"
                            >
                                Trước
                            </Button>
                            <span className="mx-2">
                                Trang {pagination.pageNumber} / {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline-primary"
                                disabled={pagination.pageNumber === pagination.totalPages}
                                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Modal chi tiết cửa hàng */}
            <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết cửa hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailLoading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" />
                            <p className="mt-2">Đang tải thông tin cửa hàng...</p>
                        </div>
                    ) : selectedShop ? (
                        <div>
                            {/* Cover Image */}
                            {selectedShop.coverImageUrl && (
                                <Card className="mb-4">
                                    <div style={{ height: "200px", overflow: "hidden" }}>
                                        <Image
                                            src={selectedShop.coverImageUrl}
                                            alt="Cover"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover"
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    </div>
                                </Card>
                            )}

                            <Row>
                                {/* Thông tin cơ bản */}
                                <Col md={8}>
                                    <Card className="h-100">
                                        <Card.Header>
                                            <h5 className="mb-0">Thông tin cơ bản</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={3} className="text-center mb-3">
                                                    <Image
                                                        src={selectedShop.logoUrl}
                                                        alt="Logo"
                                                        width="100"
                                                        height="100"
                                                        roundedCircle
                                                        className="border"
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/100x100?text=Logo";
                                                        }}
                                                    />
                                                </Col>
                                                <Col md={9}>
                                                    <h4 className="text-primary mb-3">{selectedShop.name}</h4>

                                                    <div className="mb-3">
                                                        <strong>ID:</strong>
                                                        <p className="text-muted mb-0 small">{selectedShop.id}</p>
                                                    </div>

                                                    <div className="mb-3">
                                                        <GeoAlt className="text-primary me-2" />
                                                        <strong>Địa chỉ:</strong>
                                                        <p className="mb-0">{selectedShop.address}</p>
                                                        <small className="text-muted">{selectedShop.city}, {selectedShop.province}</small>
                                                    </div>

                                                    <Row>
                                                        <Col md={6}>
                                                            <div className="mb-3">
                                                                <Telephone className="text-primary me-2" />
                                                                <strong>Số điện thoại:</strong>
                                                                <p className="mb-0">{selectedShop.phone}</p>
                                                            </div>
                                                        </Col>
                                                        <Col md={6}>
                                                            <div className="mb-3">
                                                                <Envelope className="text-primary me-2" />
                                                                <strong>Email:</strong>
                                                                <p className="mb-0">{selectedShop.email}</p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Thông tin thời gian */}
                                <Col md={4}>
                                    <Card className="h-100">
                                        <Card.Header>
                                            <h6 className="mb-0">Thông tin thời gian</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="mb-3">
                                                <Calendar className="text-primary me-2" />
                                                <strong>Ngày tạo:</strong>
                                                <p className="mb-0">
                                                    {new Date(selectedShop.createdDate).toLocaleDateString("vi-VN", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>

                                            <div className="mb-3">
                                                <Calendar className="text-primary me-2" />
                                                <strong>Cập nhật lần cuối:</strong>
                                                <p className="mb-0">
                                                    {new Date(selectedShop.modifyDate).toLocaleDateString("vi-VN", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>

                                            <hr />

                                            <div className="text-center">
                                                <h6>Trạng thái hoạt động</h6>
                                                <Badge
                                                    bg={selectedShop.isActive ? "success" : "danger"}
                                                    className="fs-6 px-3 py-2"
                                                >
                                                    {selectedShop.isActive ? "Đang hoạt động" : "Bị khóa"}
                                                </Badge>
                                            </div>

                                            <div className="mt-3 text-center">
                                                <Button
                                                    variant={selectedShop.isActive ? "danger" : "success"}
                                                    size="sm"
                                                    onClick={() => handleBlockUnblock(selectedShop.id)}
                                                >
                                                    {selectedShop.isActive ? "Khóa cửa hàng" : "Mở khóa cửa hàng"}
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Alert variant="warning">Không tìm thấy thông tin cửa hàng</Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailModal}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}