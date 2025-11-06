import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
import { uploadMultipleFiles } from "../api/upload";
import {
    getBlogsByAuthor,
    getBlogDetail,
    editBlog,
    deleteBlog,
    createBlog,
} from "../api/blog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const BASE_API_URL = "https://hmstoresapi.eposh.io.vn/";

const ShopBlogManager = () => {
    const token = localStorage.getItem("token");
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
    const [blogForm, setBlogForm] = useState({ title: "", content: "", image: "" });
    const [uploading, setUploading] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailBlog, setDetailBlog] = useState(null);

    // Quill toolbar/config
    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"]
        ]
    };
    const quillFormats = [
        "header", "bold", "italic", "underline", "strike",
        "list", "bullet", "link", "image"
    ];

    // Lấy danh sách blog của shop (dùng API cũ)
    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await getBlogsByAuthor({}, token);
            setBlogs(res.data?.items || []);
        } catch {
            setBlogs([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBlogs();
        // eslint-disable-next-line
    }, []);

    // Xử lý upload ảnh
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await uploadMultipleFiles({ files: [file], customeFolder: "blogs" }, token);
            const relativePath = res?.files?.[0];
            if (relativePath) {
                setBlogForm((prev) => ({ ...prev, image: `${BASE_API_URL}${relativePath}` }));
                setMessage("Tải ảnh thành công!");
                setMessageType("success");
            } else {
                setMessage("Tải ảnh thất bại!");
                setMessageType("danger");
            }
        } catch {
            setMessage("Tải ảnh thất bại!");
            setMessageType("danger");
        }
        setUploading(false);
    };

    // Mở modal tạo mới
    const handleCreate = () => {
        setModalMode("create");
        setBlogForm({ title: "", content: "", image: "" });
        setShowModal(true);
    };

    // Mở modal sửa
    const handleEdit = async (blog) => {
        setModalMode("edit");
        setBlogForm({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            image: blog.image || "",
        });
        setShowModal(true);
    };

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

    // Lưu blog (tạo mới hoặc cập nhật)
    const handleSave = async () => {
        try {
            if (!blogForm.title?.trim() || !blogForm.content?.trim()) {
                setMessage("Vui lòng điền đầy đủ tiêu đề và nội dung!");
                setMessageType("danger");
                return;
            }

            if (modalMode === "create") {
                await createBlog(blogForm, token);
                setMessage("Tạo blog thành công!");
                setMessageType("success");
            } else {
                await editBlog(blogForm.id, blogForm, token);
                setMessage("Cập nhật blog thành công!");
                setMessageType("success");
            }
            setShowModal(false);
            fetchBlogs();
        } catch {
            setMessage("Có lỗi xảy ra!");
            setMessageType("danger");
        }
    };

    // Xóa blog
    const handleDelete = async () => {
        try {
            await deleteBlog(selectedBlog.id, token);
            setMessage("Xóa blog thành công!");
            setMessageType("success");
            setShowDeleteModal(false);
            fetchBlogs();
        } catch {
            setMessage("Xóa blog thất bại!");
            setMessageType("danger");
        }
    };

    return (
        <div style={{ marginTop: 80, padding: 24 }}>
            <h3>Quản lý Blog Shop</h3>
            {message && (
                <Alert variant={messageType} onClose={() => setMessage("")} dismissible>
                    {message}
                </Alert>
            )}
            <Button variant="primary" className="mb-3" onClick={handleCreate}>
                Thêm blog mới
            </Button>
            {loading ? (
                <Spinner animation="border" />
            ) : (
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
                                    <Button size="sm" variant="warning" onClick={() => handleEdit(blog)}>
                                        Sửa
                                    </Button>{" "}
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
            )}

            {/* Modal tạo/sửa blog */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === "create" ? "Thêm Blog mới" : "Chỉnh sửa Blog"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={blogForm.title}
                                onChange={(e) => setBlogForm((prev) => ({ ...prev, title: e.target.value }))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                            {uploading && <Spinner size="sm" />}
                            {blogForm.image && (
                                <div className="mt-2">
                                    <img
                                        src={blogForm.image}
                                        alt="blog"
                                        style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6 }}
                                    />
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="ms-2"
                                        onClick={() => setBlogForm((prev) => ({ ...prev, image: "" }))}
                                    >
                                        Xóa ảnh
                                    </Button>
                                </div>
                            )}
                        </Form.Group>

                        {/* ReactQuill editor for blog content */}
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung<span className="text-danger">*</span></Form.Label>
                            <ReactQuill
                                theme="snow"
                                value={blogForm.content}
                                onChange={(value) => setBlogForm((prev) => ({ ...prev, content: value }))}
                                modules={quillModules}
                                formats={quillFormats}
                                style={{ minHeight: 200, marginBottom: 10 }}
                            />
                            <Form.Text className="text-muted">Nội dung được lưu ở dạng HTML.</Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={uploading}>
                        {modalMode === "create" ? "Tạo mới" : "Cập nhật"}
                    </Button>
                </Modal.Footer>
            </Modal>

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

export default ShopBlogManager;