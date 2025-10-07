import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Button,
    Spinner,
    Alert,
    Modal,
    Form,
    Pagination,
    Badge,
    Table
} from 'react-bootstrap';
import {
    EyeFill,
    PencilSquare,
    TrashFill,
    Calendar,
    ChatDots,
    Heart
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Import API functions
import {
    getBlogsByAuthor,
    getBlogDetail,
    editBlog,
    deleteBlog,
} from '../../api/blog';
import { uploadMultipleFiles } from '../../api/upload';

const BASE_API_URL = "https://hmstoresapi.eposh.io.vn/";

const BlogManagementUser = () => {
    const token = localStorage.getItem('token');

    // State cho danh sách blogs
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5,
        totalPages: 1,
        totalCount: 0
    });

    // State cho modal xem chi tiết
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // State cho modal chỉnh sửa
    const [showEditModal, setShowEditModal] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [editMode, setEditMode] = useState('edit'); // chỉ cho phép sửa
    const [blogForm, setBlogForm] = useState({
        title: '',
        content: '',
        image: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // State cho modal xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // State cho thông báo
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    // Quill configuration
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    const quillFormats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'align',
        'link', 'image', 'list', 'bullet'
    ];

    // Fetch blogs của user
    const fetchUserBlogs = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getBlogsByAuthor({
                pageNumber: page,
                pageSize: pagination.pageSize
            }, token);

            if (response.statusCode === 200) {
                setBlogs(response.data.items || []);
                setPagination(prev => ({
                    ...prev,
                    currentPage: page,
                    totalPages: response.data.totalPages || 1,
                    totalCount: response.data.totalCount || 0
                }));
            } else {
                setBlogs([]);
                showMessage('Không thể tải danh sách bài viết', 'danger');
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setBlogs([]);
            showMessage('Có lỗi xảy ra khi tải danh sách bài viết', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchUserBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Hiển thị thông báo
    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
        }, 3000);
    };

    // Handle pagination
    const handlePageChange = (page) => {
        fetchUserBlogs(page);
    };

    // Xem chi tiết blog
    const handleViewDetail = async (blogId) => {
        setDetailLoading(true);
        setShowDetailModal(true);

        try {
            const response = await getBlogDetail(blogId);
            if (response.statusCode === 200) {
                setSelectedBlog(response.data);
            } else {
                showMessage('Không thể tải chi tiết bài viết', 'danger');
                setShowDetailModal(false);
            }
        } catch (error) {
            console.error('Error fetching blog detail:', error);
            showMessage('Có lỗi xảy ra khi tải chi tiết bài viết', 'danger');
            setShowDetailModal(false);
        } finally {
            setDetailLoading(false);
        }
    };

    // Mở modal chỉnh sửa blog
    const handleEdit = async (blogId) => {
        setDetailLoading(true);
        setEditMode('edit');

        try {
            const response = await getBlogDetail(blogId);
            if (response.statusCode === 200) {
                const blog = response.data;
                setBlogForm({
                    id: blog.id,
                    title: blog.title || '',
                    content: blog.content || '',
                    image: blog.image || ''
                });
                setFormErrors({});
                setShowEditModal(true);
            } else {
                showMessage('Không thể tải thông tin bài viết', 'danger');
            }
        } catch (error) {
            console.error('Error fetching blog for edit:', error);
            showMessage('Có lỗi xảy ra khi tải thông tin bài viết', 'danger');
        } finally {
            setDetailLoading(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!blogForm.title.trim()) {
            errors.title = 'Vui lòng nhập tiêu đề';
        }

        if (!blogForm.content.trim() || blogForm.content === '<p><br></p>') {
            errors.content = 'Vui lòng nhập nội dung bài viết';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setBlogForm(prev => ({ ...prev, [name]: value }));

        // Clear error khi user nhập
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle content change (ReactQuill)
    const handleContentChange = (content) => {
        setBlogForm(prev => ({ ...prev, content }));

        // Clear error khi user nhập
        if (formErrors.content) {
            setFormErrors(prev => ({ ...prev, content: '' }));
        }
    };

    // Xử lý upload ảnh
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await uploadMultipleFiles({ files: [file], customeFolder: "blogs" }, token);
            const relativePath = res?.files?.[0];
            if (relativePath) {
                const imgUrl = `${BASE_API_URL}${relativePath}`;
                setBlogForm(prev => ({ ...prev, image: imgUrl }));
                showMessage('Upload ảnh thành công!', 'success');
            } else {
                showMessage('Tải ảnh thất bại: Không nhận được đường dẫn ảnh', 'danger');
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            showMessage('Tải ảnh thất bại!', 'danger');
        } finally {
            setUploading(false);
        }
    };

    // Xóa ảnh
    const handleRemoveImage = () => {
        setBlogForm(prev => ({ ...prev, image: '' }));
    };

    // Submit form (chỉ cập nhật)
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            const blogData = {
                title: blogForm.title.trim(),
                content: blogForm.content.trim(),
                image: blogForm.image.trim()
            };

            let response = await editBlog(blogForm.id, blogData, token);

            if (response.statusCode === 200) {
                showMessage('Cập nhật bài viết thành công!', 'success');
                setShowEditModal(false);
                // Refresh danh sách
                fetchUserBlogs(pagination.currentPage);
            } else {
                showMessage(response.message || 'Có lỗi xảy ra!', 'danger');
            }
        } catch (error) {
            console.error('Error submitting blog:', error);
            showMessage('Có lỗi xảy ra khi lưu bài viết!', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    // Mở modal xóa
    const handleDeleteClick = (blog) => {
        setDeleteTarget(blog);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa blog
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            const response = await deleteBlog(deleteTarget.id, token);

            if (response.statusCode === 200) {
                showMessage('Xóa bài viết thành công!', 'success');
                setShowDeleteModal(false);
                // Refresh danh sách
                fetchUserBlogs(pagination.currentPage);
            } else {
                showMessage(response.message || 'Không thể xóa bài viết!', 'danger');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            showMessage('Có lỗi xảy ra khi xóa bài viết!', 'danger');
        } finally {
            setDeleting(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Truncate content for display
    const truncateContent = (content, maxLength = 100) => {
        if (!content) return "";
        // Loại bỏ tất cả thẻ HTML, kể cả <p>
        const text = content.replace(/<[^>]+>/g, '');
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div style={{ marginTop: 80 }}>
            <div className="justify-content-between align-items-center mb-4">
                <h3 className="profile-form-title">Quản lý bài viết của tôi</h3>
            </div>
            <h3 className="profile-form-title">Quản lý bài viết của tôi</h3>
            {/* Thông báo */}
            {message && (
                <Alert
                    variant={messageType}
                    className="mb-3"
                    dismissible
                    onClose={() => setMessage('')}
                >
                    {message}
                </Alert>
            )}

            {/* Danh sách blogs */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Đang tải...</p>
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center py-5">
                    <h5>Chưa có bài viết nào</h5>
                    <p className="text-muted">Bạn chưa có bài viết nào.</p>
                </div>
            ) : (
                <>
                    {/* Desktop view - Table */}
                    <div className="d-none d-md-block">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Tiêu đề</th>
                                    <th>Nội dung</th>
                                    <th>Ngày tạo</th>
                                    <th>Lượt thích</th>
                                    <th>Bình luận</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.map(blog => (
                                    <tr key={blog.id}>
                                        <td>
                                            <strong>{blog.title}</strong>
                                        </td>
                                        <td>
                                            <span className="text-muted">
                                                {truncateContent(blog.content)}
                                            </span>
                                        </td>
                                        <td>
                                            <small>{formatDate(blog.publishDate)}</small>
                                        </td>
                                        <td>
                                            <Badge bg="primary">
                                                <Heart className="me-1" size={12} />
                                                {blog.totalLike || 0}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg="info">
                                                <ChatDots className="me-1" size={12} />
                                                {blog.totalComment || 0}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(blog.id)}
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeFill size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => handleEdit(blog.id)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <PencilSquare size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(blog)}
                                                    title="Xóa"
                                                >
                                                    <TrashFill size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    {/* Mobile view - Cards */}
                    <div className="d-md-none">
                        <Row>
                            {blogs.map(blog => (
                                <Col xs={12} className="mb-3" key={blog.id}>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title className="h6">{blog.title}</Card.Title>
                                            <Card.Text className="text-muted small">
                                                {truncateContent(blog.content)}
                                            </Card.Text>

                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <small className="text-muted">
                                                    <Calendar className="me-1" size={12} />
                                                    {formatDate(blog.publishDate)}
                                                </small>
                                                <div className="d-flex gap-2">
                                                    <Badge bg="primary">
                                                        <Heart className="me-1" size={10} />
                                                        {blog.totalLike || 0}
                                                    </Badge>
                                                    <Badge bg="info">
                                                        <ChatDots className="me-1" size={10} />
                                                        {blog.totalComment || 0}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(blog.id)}
                                                >
                                                    <EyeFill size={12} className="me-1" />
                                                    Xem
                                                </Button>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => handleEdit(blog.id)}
                                                >
                                                    <PencilSquare size={12} className="me-1" />
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(blog)}
                                                >
                                                    <TrashFill size={12} className="me-1" />
                                                    Xóa
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.First
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.currentPage === 1}
                                />
                                <Pagination.Prev
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                />

                                {[...Array(pagination.totalPages)].map((_, index) => {
                                    const page = index + 1;
                                    return (
                                        <Pagination.Item
                                            key={page}
                                            active={page === pagination.currentPage}
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </Pagination.Item>
                                    );
                                })}

                                <Pagination.Next
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                />
                                <Pagination.Last
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                />
                            </Pagination>
                        </div>
                    )}

                    {/* Info */}
                    <div className="text-center mt-3">
                        <small className="text-muted">
                            Hiển thị {blogs.length} / {pagination.totalCount} bài viết
                        </small>
                    </div>
                </>
            )}

            {/* Modal xem chi tiết */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Đang tải...</p>
                        </div>
                    ) : selectedBlog ? (
                        <div>
                            <h4>{selectedBlog.title}</h4>
                            <div className="mb-3">
                                <small className="text-muted">
                                    <strong>Tác giả:</strong> {selectedBlog.author} |
                                    <strong> Ngày xuất bản:</strong> {formatDate(selectedBlog.publishDate)} |
                                    <strong> Lượt thích:</strong> {selectedBlog.totalLike || 0} |
                                    <strong> Bình luận:</strong> {selectedBlog.totalComment || 0}
                                </small>
                            </div>

                            {selectedBlog.image && (
                                <div className="mb-3">
                                    <img
                                        src={selectedBlog.image}
                                        alt={selectedBlog.title}
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}

                            <div
                                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                                style={{ lineHeight: '1.6' }}
                            />
                        </div>
                    ) : (
                        <Alert variant="danger">Không thể tải chi tiết bài viết</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                    {selectedBlog && (
                        <Button
                            as={Link}
                            to={`/blog/${selectedBlog.id}`}
                            variant="primary"
                            target="_blank"
                        >
                            <EyeFill className="me-2" />
                            Xem trên trang chủ
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Modal chỉnh sửa blog */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Chỉnh sửa bài viết
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề *</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={blogForm.title}
                                onChange={handleFormChange}
                                placeholder="Nhập tiêu đề bài viết"
                                isInvalid={!!formErrors.title}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.title}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Upload ảnh */}
                        <Form.Group className="mb-3">
                            <Form.Label>Hình ảnh (URL hoặc upload)</Form.Label>
                            <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                    type="url"
                                    name="image"
                                    value={blogForm.image}
                                    onChange={handleFormChange}
                                    placeholder="https://example.com/image.jpg"
                                    style={{ maxWidth: 350 }}
                                />
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    style={{ maxWidth: 180 }}
                                />
                                {uploading && <Spinner size="sm" />}
                            </div>
                            <Form.Text className="text-muted">
                                Bạn có thể dán link ảnh hoặc upload ảnh mới (jpg, png, tối đa 5MB)
                            </Form.Text>
                            {blogForm.image && (
                                <div className="mt-2 position-relative d-inline-block">
                                    <img
                                        src={blogForm.image}
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
                                        &times;
                                    </Button>
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung *</Form.Label>
                            <ReactQuill
                                theme="snow"
                                value={blogForm.content}
                                onChange={handleContentChange}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Viết nội dung bài viết..."
                                style={{ height: '300px', marginBottom: '50px' }}
                            />
                            {formErrors.content && (
                                <div className="text-danger mt-2">
                                    <small>{formErrors.content}</small>
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={submitting || uploading}
                    >
                        {submitting ? (
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

            {/* Modal xóa */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <TrashFill className="me-2" />
                        Xóa bài viết
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteTarget && (
                        <>
                            <Alert variant="warning">
                                <strong>Cảnh báo!</strong> Bạn có chắc chắn muốn xóa bài viết này không?
                            </Alert>
                            <div className="mb-2">
                                <strong>Tiêu đề:</strong> {deleteTarget.title}
                            </div>
                            <div className="mb-2">
                                <strong>Lượt thích:</strong> {deleteTarget.totalLike || 0}
                            </div>
                            <div className="mb-2">
                                <strong>Bình luận:</strong> {deleteTarget.totalComment || 0}
                            </div>
                            <div className="text-danger">
                                <small>* Hành động này không thể hoàn tác</small>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Không, giữ lại
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang xóa...
                            </>
                        ) : (
                            <>
                                <TrashFill className="me-2" />
                                Có, xóa bài viết
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BlogManagementUser;