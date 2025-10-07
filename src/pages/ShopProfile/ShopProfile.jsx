import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Badge, Spinner, Tab, Tabs } from 'react-bootstrap';
import { PencilFill, StarFill, GeoAltFill, TelephoneFill, EnvelopeFill, CalendarFill } from 'react-bootstrap-icons';
import { getShopByOwner, editShopInfo } from '../../api/shop';
import { editProfile } from '../../api/auth';
import BankManagement from '../../components/BankManagement/BankManagement';
import OrderStatistics from '../../components/OrderStatistics/OrderStatistics';
import './Shopprofile.css';

const ShopProfile = () => {
    const [shopData, setShopData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showOwnerEditModal, setShowOwnerEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [ownerEditForm, setOwnerEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [ownerSaving, setOwnerSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    const token = localStorage.getItem('token');

    const fetchShopData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getShopByOwner(token);
            if (response.statusCode === 200) {
                setShopData(response.data);
                setEditForm(response.data);
                setOwnerEditForm({
                    fullName: response.data.ownerName || '',
                    phoneNumber: response.data.ownerPhone || '',
                    email: response.data.ownerEmail || ''
                });
            } else {
                setError(response.message || 'Không thể tải thông tin shop');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi tải dữ liệu');
            console.error('Error fetching shop data:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const updateData = {
                name: editForm.name,
                address: editForm.address,
                phone: editForm.phone,
                email: editForm.email,
                city: editForm.city,
                province: editForm.province,
                logoUrl: editForm.logoUrl,
                coverImageUrl: editForm.coverImageUrl
            };

            const response = await editShopInfo(shopData.id, updateData, token);
            if (response.statusCode === 200) {
                setShopData({ ...shopData, ...updateData });
                setShowEditModal(false);
                setSuccessMessage('Cập nhật thông tin shop thành công!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(response.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi cập nhật');
            console.error('Error updating shop:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOwnerInputChange = (e) => {
        const { name, value } = e.target;
        setOwnerEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOwnerEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setOwnerSaving(true);
            const response = await editProfile(ownerEditForm, token);
            if (response.statusCode === 200) {
                setShopData(prev => ({
                    ...prev,
                    ownerName: ownerEditForm.fullName,
                    ownerPhone: ownerEditForm.phoneNumber,
                    ownerEmail: ownerEditForm.email
                }));
                setShowOwnerEditModal(false);
                setSuccessMessage('Cập nhật thông tin chủ shop thành công!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(response.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi cập nhật');
            console.error('Error updating owner profile:', err);
        } finally {
            setOwnerSaving(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="shop-profile-container mt-4">
            {successMessage && (
                <Alert variant="success" className="mb-4">
                    {successMessage}
                </Alert>
            )}

            {/* Cover Image Section */}
            <div className="shop-cover-section">
                <div
                    className="shop-cover-image"
                    style={{
                        backgroundImage: shopData?.coverImageUrl ? `url(${shopData.coverImageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                >
                    <div className="shop-cover-overlay">
                        <Container>
                            <Row className="align-items-end">
                                <Col md={3}>
                                    <div className="shop-logo-container">
                                        <img
                                            src={shopData?.logoUrl || '/images/default-shop-logo.png'}
                                            alt="Shop Logo"
                                            className="shop-logo"
                                            onError={(e) => {
                                                e.target.src = '/images/default-shop-logo.png';
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={9}>
                                    <div className="shop-basic-info">
                                        <h1 className="shop-name">{shopData?.name}</h1>

                                        <Badge bg={shopData?.isActive ? 'success' : 'danger'} className="shop-status">
                                            {shopData?.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                                        </Badge>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <Container className="mt-4">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4"
                >
                    <Tab eventKey="profile" title="Thông tin shop">
                        <Row>
                            <Col lg={8}>
                                {/* Shop Information Card */}
                                <Card className="shop-info-card mb-4">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Thông tin shop</h5>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => setShowEditModal(true)}
                                        >
                                            <PencilFill className="me-2" />
                                            Chỉnh sửa
                                        </Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <div className="info-item">
                                                    <strong>Tên shop:</strong>
                                                    <p>{shopData?.name}</p>
                                                </div>
                                                <div className="info-item">
                                                    <GeoAltFill className="info-icon" />
                                                    <strong>Địa chỉ:</strong>
                                                    <p>{shopData?.address}</p>
                                                </div>
                                                <div className="info-item">
                                                    <strong>Thành phố:</strong>
                                                    <p>{shopData?.city}, {shopData?.province}</p>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="info-item">
                                                    <TelephoneFill className="info-icon" />
                                                    <strong>Số điện thoại:</strong>
                                                    <p>{shopData?.phone}</p>
                                                </div>
                                                <div className="info-item">
                                                    <EnvelopeFill className="info-icon" />
                                                    <strong>Email:</strong>
                                                    <p>{shopData?.email}</p>
                                                </div>
                                                <div className="info-item">
                                                    <CalendarFill className="info-icon" />
                                                    <strong>Ngày tạo:</strong>
                                                    <p>{formatDate(shopData?.createdDate)}</p>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Owner Information Card */}
                                <Card className="owner-info-card">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Thông tin chủ shop</h5>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => setShowOwnerEditModal(true)}
                                        >
                                            <PencilFill className="me-2" />
                                            Chỉnh sửa
                                        </Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <div className="info-item">
                                                    <strong>Tên chủ shop:</strong>
                                                    <p>{shopData?.ownerName || 'Chưa cập nhật'}</p>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="info-item">
                                                    <strong>Số điện thoại:</strong>
                                                    <p>{shopData?.ownerPhone}</p>
                                                </div>
                                            </Col>
                                            <Col md={12}>
                                                <div className="info-item">
                                                    <strong>Email:</strong>
                                                    <p>{shopData?.ownerEmail}</p>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col lg={4}>
                                {/* Quick Stats */}
                                <Card className="stats-card mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Thống kê nhanh</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="stat-item">
                                            <div className="stat-number">{shopData?.ratingAverage || 0}</div>
                                            <div className="stat-label">Điểm đánh giá trung bình</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-number">0</div>
                                            <div className="stat-label">Tổng số sản phẩm</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-number">0</div>
                                            <div className="stat-label">Đơn hàng hoàn thành</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="statistics" title="Thống kê đơn hàng">
                        <OrderStatistics />
                    </Tab>

                    <Tab eventKey="banks" title="Tài khoản ngân hàng">
                        <BankManagement />
                    </Tab>
                </Tabs>
            </Container>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa thông tin shop</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên shop *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={editForm.name || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Địa chỉ *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={editForm.address || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số điện thoại *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={editForm.phone || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={editForm.email || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thành phố *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="city"
                                        value={editForm.city || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tỉnh/Thành phố *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="province"
                                        value={editForm.province || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>URL Logo</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="logoUrl"
                                        value={editForm.logoUrl || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>URL Ảnh bìa</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="coverImageUrl"
                                        value={editForm.coverImageUrl || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/cover.png"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Owner Edit Modal */}
            <Modal show={showOwnerEditModal} onHide={() => setShowOwnerEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa thông tin chủ shop</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleOwnerEditSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ và tên *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={ownerEditForm.fullName || ''}
                                        onChange={handleOwnerInputChange}
                                        required
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số điện thoại *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phoneNumber"
                                        value={ownerEditForm.phoneNumber || ''}
                                        onChange={handleOwnerInputChange}
                                        required
                                        placeholder="Nhập số điện thoại"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={ownerEditForm.email || ''}
                                        onChange={handleOwnerInputChange}
                                        required
                                        placeholder="Nhập địa chỉ email"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Alert variant="info" className="mt-3">
                            <strong>Lưu ý:</strong> Thông tin này sẽ được cập nhật trong hồ sơ cá nhân của bạn.
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowOwnerEditModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={ownerSaving}>
                            {ownerSaving ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default ShopProfile;