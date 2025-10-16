import React, { useState, useEffect } from 'react';
import {
    Container,
    Card,
    Table,
    Badge,
    Button,
    Modal,
    Form,
    Alert,
    Spinner,
    Row,
    Col,
    Pagination,
    InputGroup,
    FormControl
} from 'react-bootstrap';
import {
    Search,
    EyeFill,
    PencilSquare,
    CalendarFill,
    PersonFill,
    TelephoneFill,
    GeoAltFill,
    CreditCardFill,
    BoxSeamFill,
    CheckCircleFill,
    XCircleFill,
    ClockFill,
    CashStack,
    TrashFill
} from 'react-bootstrap-icons';
import { getOrdersByShop, editOrderStatus, getOrderDetails, cancelOrder } from '../../api/oder';

const OrderShop = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // Pagination and Filter
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecord, setTotalRecord] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');

    // Order Status Configuration
    const ORDER_STATUS = {
        WaitForPayment: {
            label: 'Chờ thanh toán',
            variant: 'warning',
            icon: ClockFill,
            color: '#ffc107'
        },
        Paid: {
            label: 'Đã thanh toán',
            variant: 'info',
            icon: CashStack,
            color: '#0dcaf0'
        },
        Cancelled: {
            label: 'Đã hủy',
            variant: 'danger',
            icon: XCircleFill,
            color: '#dc3545'
        },
        Completed: {
            label: 'Hoàn thành',
            variant: 'success',
            icon: CheckCircleFill,
            color: '#198754'
        }
    };

    const STATUS_OPTIONS = [
        { value: 'WaitForPayment', label: 'Chờ thanh toán' },
        { value: 'Paid', label: 'Đã thanh toán' },
        { value: 'Cancelled', label: 'Đã hủy' },
        { value: 'Completed', label: 'Hoàn thành' }
    ];

    // Function để tổng hợp sản phẩm cùng tên (giữ ảnh, mô tả, và concat notes)
    const groupProductsByName = (items) => {
        if (!items || !Array.isArray(items)) return [];

        const grouped = items.reduce((acc, item) => {
            const existingItem = acc.find(p => p.productName === item.productName);

            if (existingItem) {
                existingItem.quantity += item.quantity;
                existingItem.totalPrice += item.totalAmounts || (item.unitPrice * item.quantity);
                // Concat note nếu có và khác nhau
                if (item.note && item.note.trim() && !existingItem.notes.includes(item.note.trim())) {
                    existingItem.notes.push(item.note.trim());
                }
            } else {
                acc.push({
                    productName: item.productName,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                    totalPrice: item.totalAmounts || (item.unitPrice || 0) * (item.quantity || 1),
                    commonImage: item.commonImage || '',
                    description: item.description || '',
                    notes: item.note && item.note.trim() ? [item.note.trim()] : []
                });
            }

            return acc;
        }, []);

        return grouped;
    };

    // Fetch orders (không truyền filter/searchTerm lên BE)
    const fetchOrders = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = await getOrdersByShop({
                pageNumber: page,
                pageSize: pageSize
            }, token);

            if (response.statusCode === 200) {
                setOrders(response.data.items || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalRecord(response.data.totalRecord || 0);
                setCurrentPage(response.data.pageNumber || 1);
            } else {
                setError(response.message || 'Không thể tải danh sách đơn hàng');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi tải dữ liệu');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch order details
    const fetchOrderDetails = async (orderId) => {
        try {
            setDetailLoading(true);
            const response = await getOrderDetails(orderId, 1, 9999, token);

            if (response.statusCode === 200) {
                // API trả về một object với items mảng
                setOrderDetails(response.data);
            } else {
                setError('Không thể tải chi tiết đơn hàng');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi tải chi tiết');
            console.error('Error fetching order details:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Clear messages after 3 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Handle status change
    const handleStatusChange = async () => {
        if (!selectedOrder || !newStatus) return;

        try {
            setUpdating(true);
            const response = await editOrderStatus(selectedOrder.orderID, newStatus, token);

            if (response.statusCode === 200) {
                setSuccess('Cập nhật trạng thái đơn hàng thành công!');
                setShowStatusModal(false);
                fetchOrders(); // Reload data
            } else {
                setError(response.message || 'Không thể cập nhật trạng thái');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi cập nhật');
            console.error('Error updating order status:', err);
        } finally {
            setUpdating(false);
        }
    };

    // Handle cancel order
    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            setCancelling(true);
            const response = await cancelOrder({ orderID: selectedOrder.orderID }, token);

            if (response.statusCode === 200) {
                setSuccess('Hủy đơn hàng thành công!');
                setShowCancelModal(false);
                fetchOrders(); // Reload data
            } else {
                setError(response.message || 'Không thể hủy đơn hàng');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi hủy đơn hàng');
            console.error('Error cancelling order:', err);
        } finally {
            setCancelling(false);
        }
    };

    // Handle view details
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        fetchOrderDetails(order.orderID);
        setShowDetailModal(true);
    };

    // Handle edit status
    const handleEditStatus = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setShowStatusModal(true);
    };

    // Handle cancel modal
    const handleShowCancelModal = (order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
    };

    // FE filter orders theo searchTerm
    const filteredOrders = orders.filter(order =>
        order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.receiverPhone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle search (chỉ setSearchTerm, không gọi lại API)
    const handleSearch = () => {
        // Không gọi lại API, chỉ filter FE
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchOrders(page);
    };

    // Check if order can be cancelled
    const canCancelOrder = (status) => {
        return status === 'WaitForPayment' || status === 'Paid';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Get status component
    const getStatusBadge = (status) => {
        const statusConfig = ORDER_STATUS[status] || ORDER_STATUS.WaitForPayment;
        const IconComponent = statusConfig.icon;

        return (
            <Badge bg={statusConfig.variant} className="d-flex align-items-center gap-1">
                <IconComponent size={12} />
                {statusConfig.label}
            </Badge>
        );
    };

    return (
        <Container style={{ padding: 40 }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <BoxSeamFill className="me-2" />
                        Quản lý đơn hàng
                    </h2>
                    <p className="text-muted mb-0">
                        Tổng {totalRecord} đơn hàng
                    </p>
                </div>

                {/* Search */}
                <div style={{ width: '300px' }}>
                    <InputGroup>
                        <FormControl
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button variant="outline-secondary" onClick={handleSearch}>
                            <Search />
                        </Button>
                    </InputGroup>
                </div>
            </div>

            {/* Alert Messages */}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* Orders Table */}
            <Card>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </Spinner>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        <>
                            <Table striped bordered hover responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Mã đơn hàng</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Thanh toán</th>
                                        <th>Ngày tạo</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.orderID}>
                                            <td>
                                                <div>
                                                    <strong className="text-primary">
                                                        {order.orderCode}
                                                    </strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        ID: {order.orderID.slice(0, 8)}...
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="d-flex align-items-center mb-1">
                                                        <PersonFill className="me-1 text-muted" size={12} />
                                                        <strong>{order.receiverName}</strong>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <TelephoneFill className="me-1 text-muted" size={12} />
                                                        <small>{order.receiverPhone}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <strong className="text-success">
                                                    {formatCurrency(order.totalAmounts)}
                                                </strong>
                                            </td>
                                            <td>
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td>
                                                <Badge bg="info" pill>
                                                    <CreditCardFill className="me-1" size={12} />
                                                    {order.paymentMethod === 'OnlineBanking' ? 'Chuyển khoản' : order.paymentMethod}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <CalendarFill className="me-1 text-muted" size={12} />
                                                    <small>{formatDate(order.createdDate)}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(order)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <EyeFill size={12} />
                                                    </Button>
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => handleEditStatus(order)}
                                                        title="Thay đổi trạng thái"
                                                    >
                                                        <PencilSquare size={12} />
                                                    </Button>
                                                    {canCancelOrder(order.status) && (
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleShowCancelModal(order)}
                                                            title="Hủy đơn hàng"
                                                        >
                                                            <TrashFill size={12} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center p-3">
                                    <Pagination>
                                        <Pagination.First
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                        />
                                        <Pagination.Prev
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        />

                                        {[...Array(totalPages)].map((_, index) => {
                                            const page = index + 1;
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                            ) {
                                                return (
                                                    <Pagination.Item
                                                        key={page}
                                                        active={page === currentPage}
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </Pagination.Item>
                                                );
                                            }
                                            return null;
                                        })}

                                        <Pagination.Next
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        />
                                        <Pagination.Last
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <BoxSeamFill size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">Không tìm thấy đơn hàng nào</h5>
                            <p className="text-muted">Vui lòng thử từ khóa khác</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Status Edit Modal */}
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Thay đổi trạng thái đơn hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <div className="mb-3">
                                <strong>Đơn hàng:</strong> {selectedOrder.orderCode}
                            </div>
                            <div className="mb-3">
                                <strong>Trạng thái hiện tại:</strong> {getStatusBadge(selectedOrder.status)}
                            </div>
                            <Form.Group>
                                <Form.Label>Trạng thái mới *</Form.Label>
                                <Form.Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    required
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleStatusChange}
                        disabled={updating || newStatus === selectedOrder?.status}
                    >
                        {updating ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang cập nhật...
                            </>
                        ) : (
                            'Cập nhật'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Cancel Order Modal */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <TrashFill className="me-2" />
                        Hủy đơn hàng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <Alert variant="warning">
                                <strong>Cảnh báo!</strong> Bạn có chắc chắn muốn hủy đơn hàng này không?
                            </Alert>
                            <div className="mb-2">
                                <strong>Mã đơn hàng:</strong> {selectedOrder.orderCode}
                            </div>
                            <div className="mb-2">
                                <strong>Khách hàng:</strong> {selectedOrder.receiverName}
                            </div>
                            <div className="mb-2">
                                <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmounts)}
                            </div>
                            <div className="mb-2">
                                <strong>Trạng thái hiện tại:</strong> {getStatusBadge(selectedOrder.status)}
                            </div>
                            <div className="text-danger">
                                <small>* Hành động này không thể hoàn tác</small>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Không, giữ lại
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleCancelOrder}
                        disabled={cancelling}
                    >
                        {cancelling ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang hủy...
                            </>
                        ) : (
                            <>
                                <TrashFill className="me-2" />
                                Có, hủy đơn hàng
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Order Details Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đơn hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </Spinner>
                        </div>
                    ) : selectedOrder ? (
                        <Row>
                            <Col md={6}>
                                <h6>Thông tin đơn hàng</h6>
                                <div className="mb-2"><strong>Mã:</strong> {selectedOrder.orderCode}</div>
                                <div className="mb-2"><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</div>
                                <div className="mb-2"><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmounts)}</div>
                                <div className="mb-2"><strong>Thanh toán:</strong> {selectedOrder.paymentMethod === 'OnlineBanking' ? 'Chuyển khoản' : selectedOrder.paymentMethod}</div>
                                <div className="mb-2"><strong>Ngày tạo:</strong> {formatDate(selectedOrder.createdDate)}</div>
                            </Col>
                            <Col md={6}>
                                <h6>Thông tin giao hàng</h6>
                                <div className="mb-2">
                                    <PersonFill className="me-1" />
                                    <strong>Người nhận:</strong> {selectedOrder.receiverName}
                                </div>
                                <div className="mb-2">
                                    <TelephoneFill className="me-1" />
                                    <strong>Số điện thoại:</strong> {selectedOrder.receiverPhone}
                                </div>
                                <div className="mb-2">
                                    <GeoAltFill className="me-1" />
                                    <strong>Địa chỉ:</strong> {selectedOrder.deliveryAddress}
                                </div>
                            </Col>
                            {orderDetails && orderDetails.items && (
                                <Col md={12} className="mt-3">
                                    <h6>Sản phẩm trong đơn hàng</h6>
                                    {groupProductsByName(orderDetails.items).map((item, index) => (
                                        <div key={index} className="border rounded p-3 mb-2 d-flex gap-3 align-items-start">
                                            <div style={{ width: 90, flexShrink: 0 }}>
                                                {item.commonImage ? (
                                                    <img src={item.commonImage} alt={item.productName} style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 6 }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: 70, background: '#f0f0f0', borderRadius: 6 }} />
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>{item.productName}</strong>
                                                        <div className="text-muted" style={{ fontSize: 13 }}>
                                                            <span>Số lượng: {item.quantity}</span>
                                                            {' • '}
                                                            <span>Đơn giá: {formatCurrency(item.unitPrice)}</span>
                                                        </div>
                                                        {/* Hiển thị note per item (concat nếu nhiều) */}
                                                        {item.notes && item.notes.length > 0 ? (
                                                            <div className="mt-1 text-primary" style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
                                                                <strong>Ghi chú custom:</strong> {item.notes.join('; ')}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1 text-muted" style={{ fontSize: 13 }}>
                                                                <strong>Ghi chú:</strong> Không có
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-end">
                                                        <strong className="text-success">{formatCurrency(item.totalPrice)}</strong>
                                                    </div>
                                                </div>
                                                {item.description ? (
                                                    <div className="mt-2 text-muted" style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}
                                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Tổng kết */}
                                    <div className="border-top pt-3 mt-3">
                                        <Row>
                                            <Col md={8}>
                                                <strong>Tổng cộng:</strong>
                                            </Col>
                                            <Col md={4} className="text-end">
                                                <strong className="text-success fs-5">
                                                    {formatCurrency(selectedOrder.totalAmounts)}
                                                </strong>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OrderShop;