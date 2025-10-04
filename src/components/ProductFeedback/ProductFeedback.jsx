import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Alert } from 'react-bootstrap';
import { Star, StarFill } from 'react-bootstrap-icons';
import {
    getProductFeedbacks,
    createProductFeedback,
    editProductFeedback,
    deleteFeedback
} from '../../api/product';
import { getUser } from '../../api/auth';
import './ProductFeedback.css';

const ProductFeedback = ({ productID, show, onHide }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [newFeedback, setNewFeedback] = useState({
        content: '',
        rating: 5
    });
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
    const [hasPurchased, setHasPurchased] = useState(false);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (show && productID) {
            fetchFeedbacks();
            checkPurchaseHistory();
            getCurrentUser();
        }
    }, [show, productID]);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            console.log('Fetching feedbacks for productID:', productID);

            if (!productID) {
                console.error('No productID provided');
                setFeedbacks([]);
                return;
            }

            const res = await getProductFeedbacks({ productID }, token);
            console.log('Feedbacks response:', res);

            if (res && res.statusCode === 200) {
                setFeedbacks(res.data?.items || []);
            } else {
                console.error('Failed to fetch feedbacks:', res);
                setFeedbacks([]);
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    const checkPurchaseHistory = async () => {
        // TODO: Implement API to check if user has purchased this product
        // For now, we'll set it to true for testing
        setHasPurchased(true);
    };

    const getCurrentUser = async () => {
        if (!token) {
            console.log('No token found');
            return;
        }

        try {
            console.log('Getting current user...');
            const res = await getUser(token);
            console.log('Current user response:', res);

            if (res && res.statusCode === 200) {
                const userData = res.data;
                setCurrentUser(userData);
                setCurrentUserID(userData.id || userData.userID || userData.userId);
                console.log('Current user ID:', userData.id || userData.userID || userData.userId);

                // Lưu vào localStorage để cache
                localStorage.setItem('currentUser', JSON.stringify(userData));
                localStorage.setItem('userID', userData.id || userData.userID || userData.userId);
            } else {
                console.error('Failed to get current user:', res);
                // Thử lấy từ localStorage cache
                const cachedUser = localStorage.getItem('currentUser');
                const cachedUserID = localStorage.getItem('userID');
                if (cachedUser && cachedUserID) {
                    setCurrentUser(JSON.parse(cachedUser));
                    setCurrentUserID(cachedUserID);
                    console.log('Using cached user ID:', cachedUserID);
                }
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            // Fallback to cached data
            const cachedUser = localStorage.getItem('currentUser');
            const cachedUserID = localStorage.getItem('userID');
            if (cachedUser && cachedUserID) {
                setCurrentUser(JSON.parse(cachedUser));
                setCurrentUserID(cachedUserID);
                console.log('Using cached user ID (error fallback):', cachedUserID);
            }
        }
    };

    const showAlert = (message, variant = 'success') => {
        setAlert({ show: true, message, variant });
        setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
    };

    const handleCreateFeedback = async () => {
        if (!hasPurchased) {
            showAlert('Bạn cần mua sản phẩm này trước khi đánh giá!', 'danger');
            return;
        }

        if (!newFeedback.content.trim()) {
            showAlert('Vui lòng nhập nội dung đánh giá!', 'danger');
            return;
        }

        try {
            const feedbackData = {
                content: newFeedback.content,
                rating: newFeedback.rating,
                productID: productID
            };

            console.log('Creating feedback with data:', feedbackData);
            const res = await createProductFeedback(feedbackData, token);
            console.log('Feedback response:', res);

            if (res.statusCode === 200) {
                showAlert('Đánh giá thành công!');
                setNewFeedback({ content: '', rating: 5 });
                setShowCreateForm(false);
                fetchFeedbacks(); // Reload để thấy feedback mới
            } else {
                showAlert(res.message || 'Có lỗi xảy ra!', 'danger');
            }
        } catch (error) {
            console.error('Error creating feedback:', error);
            showAlert('Có lỗi xảy ra khi đánh giá!', 'danger');
        }
    };

    const handleEditFeedback = async () => {
        try {
            const editData = {
                content: editingFeedback.content,
                rating: editingFeedback.rating
            };

            const res = await editProductFeedback(editingFeedback.id, editData, token);

            if (res.statusCode === 200) {
                showAlert('Cập nhật đánh giá thành công!');
                setEditingFeedback(null);
                fetchFeedbacks();
            } else {
                showAlert(res.message || 'Có lỗi xảy ra!', 'danger');
            }
        } catch (error) {
            console.error('Error editing feedback:', error);
            showAlert('Có lỗi xảy ra khi cập nhật!', 'danger');
        }
    };

    const handleDeleteFeedback = async (feedbackID) => {
        if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
            try {
                const res = await deleteFeedback(feedbackID, token);
                if (res.statusCode === 200) {
                    showAlert('Xóa đánh giá thành công!');
                    fetchFeedbacks();
                } else {
                    showAlert(res.message || 'Có lỗi xảy ra!', 'danger');
                }
            } catch (error) {
                console.error('Error deleting feedback:', error);
                showAlert('Có lỗi xảy ra khi xóa!', 'danger');
            }
        }
    };

    const renderStars = (rating, interactive = false, onStarClick = null) => {
        return (
            <div className="d-flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                        onClick={() => interactive && onStarClick && onStarClick(star)}
                    >
                        {star <= rating ? (
                            <StarFill color="#ffc107" size={20} />
                        ) : (
                            <Star color="#ffc107" size={20} />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    // Kiểm tra xem feedback có phải của user hiện tại không
    const isMyFeedback = (feedback) => {
        try {
            const isMatch = currentUserID && feedback?.userID && feedback.userID === currentUserID;
            console.log(`Checking feedback ${feedback?.id}: userID=${feedback?.userID}, currentUserID=${currentUserID}, isMatch=${isMatch}`);
            return isMatch;
        } catch (error) {
            console.error('Error checking if feedback is mine:', error);
            return false;
        }
    };

    // Kiểm tra xem user đã có feedback cho sản phẩm này chưa
    const hasUserFeedback = () => {
        return feedbacks.some(feedback => isMyFeedback(feedback));
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Đánh giá sản phẩm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {alert.show && (
                    <Alert variant={alert.variant} className="mb-3">
                        {alert.message}
                    </Alert>
                )}

                {!showCreateForm ? (
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <h6>Các đánh giá ({feedbacks.length})</h6>
                        {token && !hasUserFeedback() && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowCreateForm(true)}
                            >
                                Viết đánh giá
                            </Button>
                        )}
                        {token && hasUserFeedback() && (
                            <small className="text-muted">Bạn đã đánh giá sản phẩm này</small>
                        )}
                    </div>
                ) : (
                    <Card className="mb-3">
                        <Card.Header>
                            <h6 className="mb-0">Viết đánh giá mới</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Đánh giá ({newFeedback.rating} sao)</Form.Label>
                                    <div>
                                        {renderStars(newFeedback.rating, true, (rating) =>
                                            setNewFeedback(prev => ({ ...prev, rating }))
                                        )}
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nội dung đánh giá</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={newFeedback.content}
                                        onChange={(e) => setNewFeedback(prev => ({
                                            ...prev, content: e.target.value
                                        }))}
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                        maxLength={500}
                                    />
                                    <Form.Text className="text-muted">
                                        {newFeedback.content.length}/500 ký tự
                                    </Form.Text>
                                </Form.Group>
                                <div className="d-flex gap-2">
                                    <Button variant="primary" onClick={handleCreateFeedback}>
                                        Gửi đánh giá
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewFeedback({ content: '', rating: 5 });
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                )}

                {loading ? (
                    <div className="text-center py-3">
                        <span>Đang tải đánh giá...</span>
                    </div>
                ) : feedbacks.length > 0 ? (
                    <div className="feedback-list">
                        {feedbacks.map((feedback) => (
                            <Card key={feedback.id} className="mb-3">
                                <Card.Body>
                                    {editingFeedback?.id === feedback.id ? (
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Đánh giá ({editingFeedback.rating} sao)</Form.Label>
                                                <div>
                                                    {renderStars(editingFeedback.rating, true, (rating) =>
                                                        setEditingFeedback(prev => ({ ...prev, rating }))
                                                    )}
                                                </div>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={editingFeedback.content}
                                                    onChange={(e) => setEditingFeedback(prev => ({
                                                        ...prev, content: e.target.value
                                                    }))}
                                                    maxLength={500}
                                                />
                                            </Form.Group>
                                            <div className="d-flex gap-2">
                                                <Button size="sm" variant="primary" onClick={handleEditFeedback}>
                                                    Lưu
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setEditingFeedback(null)}
                                                >
                                                    Hủy
                                                </Button>
                                            </div>
                                        </Form>
                                    ) : (
                                        <>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="d-flex align-items-center">
                                                    {feedback.avatar && (
                                                        <img
                                                            src={feedback.avatar}
                                                            alt={feedback.fullName}
                                                            className="rounded-circle me-2"
                                                            style={{ width: 40, height: 40, objectFit: 'cover' }}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="d-flex align-items-center">
                                                            <strong className="me-2">{feedback.fullName || 'Người dùng'}</strong>
                                                            {isMyFeedback(feedback) && (
                                                                <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>
                                                                    Của bạn
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>{renderStars(feedback.rating)}</div>
                                                    </div>
                                                </div>

                                                {/* Chỉ hiển thị nút sửa/xóa nếu là feedback của mình */}
                                                {isMyFeedback(feedback) && (
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => setEditingFeedback(feedback)}
                                                        >
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => handleDeleteFeedback(feedback.id)}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mb-2">{feedback.content}</p>
                                            <small className="text-muted">
                                                {feedback.createdDate && new Date(feedback.createdDate).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-3 text-muted">
                        <p>Chưa có đánh giá nào cho sản phẩm này</p>
                        <small>Hãy là người đầu tiên đánh giá sản phẩm này!</small>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ProductFeedback;