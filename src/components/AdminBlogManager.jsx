import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Spinner, Alert, Pagination } from "react-bootstrap";
import {
    getBlogs,
    getBlogDetail,
    deleteBlog,
} from "../api/blog";

const PAGE_SIZE = 10;

const AdminBlogManager = () => {
    const token = localStorage.getItem("token");
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailBlog, setDetailBlog] = useState(null);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [totalCount, setTotalCount] = useState(0);

    // Lấy danh sách blog (dùng getBlogs cho admin)
    const fetchBlogs = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getBlogs({ pageNumber: page, pageSize: PAGE_SIZE });
            setBlogs(res.data?.items || []);
            setTotalPages(res.data?.totalPages || 1);
            setTotalCount(res.data?.totalCount || 0);
            setCurrentPage(page);
        } catch {
            setBlogs([]);
            setTotalPages(1);
            setTotalCount(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBlogs();

    }, []);

    // Xem chi tiết blog
    const handleViewDetail = async (blog) => {
        setShowDetailModal(true);
        setDetailLoading(true);
        try {
            const res = await getBlogDetail(blog.id, token);
            setDetailBlog(res.data);
        } catch {
            setDetailBlog(null);
        }
        setDetailLoading(false);
    };

    // Xóa blog
    const handleDelete = async () => {
        try {
            await deleteBlog(selectedBlog.id, token);
            setMessage("Xóa blog thành công!");
            setMessageType("success");
            setShowDeleteModal(false);
            fetchBlogs(currentPage);
        } catch {
            setMessage("Xóa blog thất bại!");
            setMessageType("danger");
        }
    };

    // Xử lý chuyển trang
    const handlePageChange = (page) => {
        if (page !== currentPage && page > 0 && page <= totalPages) {
            fetchBlogs(page);
        }
    };

    return (
        <div style={{ marginTop: 80, padding: 24 }}>
            <h3>Quản lý Blog (Admin)</h3>
            {message && (
                <Alert variant={messageType} onClose={() => setMessage("")} dismissible>
                    {message}
                </Alert>
            )}
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Ảnh</th>
                                <th>Nội dung</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((blog) => (
                                <tr key={blog.id}>
                                    <td>{blog.title}</td>
                                    <td>
                                        {blog.image && (
                                            <img src={blog.image} alt="" style={{ width: 80, height: 60, objectFit: "cover" }} />
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ color: "#888" }}>
                                            {(blog.content ? blog.content.replace(/<[^>]+>/g, "") : "").slice(0, 80)}...
                                        </span>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="info"
                                            className="me-1"
                                            onClick={() => handleViewDetail(blog)}
                                        >
                                            Xem
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => {
                                                setSelectedBlog(blog);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                                <Pagination.First
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                />
                                <Pagination.Prev
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                />
                                {[...Array(totalPages)].map((_, idx) => {
                                    const page = idx + 1;
                                    return (
                                        <Pagination.Item
                                            key={page}
                                            active={page === currentPage}
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </Pagination.Item>
                                    );
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
            )}

            {/* Modal xem chi tiết blog */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết Blog</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Đang tải...</p>
                        </div>
                    ) : detailBlog ? (
                        <div>
                            <h4>{detailBlog.title}</h4>
                            <div className="mb-3">
                                <small className="text-muted">
                                    <strong>Ngày xuất bản:</strong> {detailBlog.publishDate && new Date(detailBlog.publishDate).toLocaleString("vi-VN")}
                                </small>
                            </div>
                            {detailBlog.image && (
                                <div className="mb-3">
                                    <img
                                        src={detailBlog.image}
                                        alt={detailBlog.title}
                                        className="img-fluid rounded"
                                        style={{ maxHeight: "300px", objectFit: "cover" }}
                                    />
                                </div>
                            )}
                            <div
                                dangerouslySetInnerHTML={{ __html: detailBlog.content }}
                                style={{ lineHeight: "1.6" }}
                            />
                        </div>
                    ) : (
                        <Alert variant="danger">Không thể tải chi tiết blog</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xóa Blog</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa blog này?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminBlogManager;