import React, { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col, Badge, Spinner, Alert } from "react-bootstrap";
import { getUsers, blockUnblockUser } from "../../api/user";

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
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
        isActive: undefined
    });

    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                pageNumber: pagination.pageNumber,
                pageSize: pagination.pageSize,
                search: filters.search
            };

            // Chỉ thêm isActive nếu có giá trị
            if (filters.isActive !== undefined) {
                params.isActive = filters.isActive;
            }

            const response = await getUsers(params, token);

            if (response.statusCode === 200) {
                let items = response.data.items || [];
                // Nếu lọc bị khóa, chỉ lấy user có isActive === false (fix BE trả về sai)
                if (filters.isActive === false) {
                    items = items.filter(u => u.isActive === false);
                }
                setUsers(items);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.totalPages || 0,
                    totalRecord: response.data.totalRecord || 0
                }));
                setError("");
            } else {
                setError(response.message || "Lỗi khi tải danh sách người dùng");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Lỗi kết nối server");
        }
        setLoading(false);
    };

    const handleBlockUnblock = async (userId) => {
        try {
            const response = await blockUnblockUser(userId, token);
            if (response.statusCode === 200) {
                setSuccess("Cập nhật trạng thái người dùng thành công");
                fetchUsers();
            } else {
                setError(response.message || "Lỗi khi cập nhật trạng thái người dùng");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Lỗi kết nối server");
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, pageNumber: newPage }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
        fetchUsers();
    };

    const handleStatusFilter = (value) => {
        let isActive;
        if (value === "active") isActive = true;
        else if (value === "blocked") isActive = false;
        else isActive = undefined; // Tất cả trạng thái

        setFilters(prev => ({ ...prev, isActive: isActive }));
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.pageNumber, pagination.pageSize, filters.isActive]);

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
            <h2 className="mb-4">Quản lý Người dùng</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* Bộ lọc */}
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={filters.isActive === undefined ? "" : filters.isActive.toString()}
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

            {/* Bảng người dùng */}
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
                                <th>ID</th>
                                <th>Tên đăng nhập</th>
                                <th>Email</th>
                                <th>Họ tên</th>
                                <th>Số điện thoại</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filters.isActive === true
                                ? users.filter(u => u.isActive === true)
                                : filters.isActive === false
                                    ? users.filter(u => u.isActive === false)
                                    : users
                            ).length > 0 ? (
                                (filters.isActive === true
                                    ? users.filter(u => u.isActive === true)
                                    : filters.isActive === false
                                        ? users.filter(u => u.isActive === false)
                                        : users
                                ).map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.userName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.fullName || "Chưa cập nhật"}</td>
                                        <td>{user.phoneNumber || user.phone || "Chưa cập nhật"}</td>
                                        <td>
                                            <Badge bg={user.isActive ? "success" : "danger"}>
                                                {user.isActive ? "Đang hoạt động" : "Bị khóa"}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button
                                                variant={user.isActive ? "danger" : "success"}
                                                size="sm"
                                                onClick={() => handleBlockUnblock(user.id)}
                                            >
                                                {user.isActive ? "Khóa" : "Mở khóa"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
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
        </div>
    );
}