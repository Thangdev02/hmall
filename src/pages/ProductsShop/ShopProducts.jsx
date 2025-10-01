import { useEffect, useState } from "react";
import { Table, Container, Button, Spinner, Alert, Pagination, Toast, Modal, Form, Row, Col } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getProductsByShop, deleteProduct, updateProduct } from "../../api/product";
import AddProducts from "../../components/AddProducts";

const BASE_API_URL = "https://hmstoresapi.eposh.io.vn/";

// Predefined categories extracted from API data
const CATEGORIES = [
    "Đồ decor",
    "Đồ gia dụng",
    "Phụ kiện",
    "Túi xách",
    "Thời trang",
    "Thời trang nam",
    "Gia dụng",
    "Balo - Túi xách",
    "Thời trang nữ",
    "Giày dép",
    "Điện tử",
];

const ShopProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        costPrice: "",
        price: "",
        stock: "",
        material: "",
        category: "",
        commonImage: "",
        moreImages: [],
    });
    const [editErrors, setEditErrors] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const token = localStorage.getItem("token");
    const shopId = localStorage.getItem("shopId");

    // Validate edit form
    const validateEditForm = () => {
        const newErrors = {};
        if (!editForm.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
        if (!editForm.costPrice || editForm.costPrice <= 0) newErrors.costPrice = "Giá vốn phải lớn hơn 0";
        if (!editForm.price || editForm.price <= 0) newErrors.price = "Giá bán phải lớn hơn 0";
        if (!editForm.stock || editForm.stock < 0) newErrors.stock = "Số lượng không được âm";
        if (!editForm.category) newErrors.category = "Vui lòng chọn danh mục";
        setEditErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            setError("");
            try {
                const res = await getProductsByShop({ pageNumber, pageSize, shopId }, token);
                console.log("API response:", res);
                if (res.statusCode === 200) {
                    const activeProducts = (res.data.items || []);
                    setProducts(activeProducts);
                    setTotalPages(res.data.totalPages || 1);
                } else {
                    setError(res.message || "Lỗi khi tải sản phẩm");
                }
                // eslint-disable-next-line no-unused-vars
            } catch (err) {
                setError("Không thể tải sản phẩm");
            }
            setLoading(false);
        }
        fetchProducts();
    }, [pageNumber, pageSize, shopId, token]);

    const handleProductCreated = async () => {
        setPageNumber(1);
        setLoading(true);
        try {
            const res = await getProductsByShop({ pageNumber: 1, pageSize, shopId }, token);
            if (res.statusCode === 200) {
                const activeProducts = (res.data.items || []).filter(p => p.isActive === true);
                setProducts(activeProducts);
                setTotalPages(res.data.totalPages || 1);
            } else {
                setError(res.message || "Không thể tải lại danh sách sản phẩm");
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Không thể tải lại danh sách sản phẩm");
        }
        setLoading(false);
        setShowAddModal(false);
        setToastMsg("Tạo sản phẩm thành công!");
        setShowToast(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
        setDeleteLoadingId(productId);
        try {
            const res = await deleteProduct(productId, token);
            if (res.statusCode === 200) {
                setProducts(products.filter((p) => p.id !== productId));
                setToastMsg("Xóa sản phẩm thành công!");
                setShowToast(true);
            } else {
                setToastMsg(res.message || "Xóa sản phẩm thất bại!");
                setShowToast(true);
            }
        } catch {
            setToastMsg("Xóa sản phẩm thất bại!");
            setShowToast(true);
        }
        setDeleteLoadingId(null);
    };

    const handleShowEditModal = (product) => {
        setSelectedProduct(product);
        setEditForm({
            name: product.name || "",
            description: product.description || "",
            costPrice: product.costPrice || "",
            price: product.price || "",
            stock: product.stock || "",
            material: product.material || "",
            category: product.category || "",
            commonImage: product.commonImage || "",
            moreImages: product.moreImages && product.moreImages.length > 0 ? product.moreImages : [],
        });
        setEditErrors({});
        setShowEditModal(true);
    };

    const handleEditImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditLoading(true);
        try {
            const { uploadMultipleFiles } = await import("../../api/upload");
            const res = await uploadMultipleFiles({ files: [file], customeFolder: "products" }, token);
            const relativePath = res?.files?.[0];
            if (relativePath) {
                const imgUrl = `${BASE_API_URL}${relativePath}`;
                setEditForm((prev) => ({ ...prev, commonImage: imgUrl }));
            } else {
                setToastMsg("Tải ảnh chính thất bại: Không nhận được đường dẫn ảnh");
                setShowToast(true);
            }
        } catch {
            setToastMsg("Tải ảnh chính thất bại!");
            setShowToast(true);
        }
        setEditLoading(false);
    };

    const handleEditMoreImagesChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setEditLoading(true);
        try {
            const { uploadMultipleFiles } = await import("../../api/upload");
            const res = await uploadMultipleFiles({ files, customeFolder: "products" }, token);
            const newImageUrls = res?.files?.map(file => ({ url: `${BASE_API_URL}${file}` })) || [];
            setEditForm((prev) => ({
                ...prev,
                moreImages: [...prev.moreImages, ...newImageUrls],
            }));
        } catch {
            setToastMsg("Tải ảnh bổ sung thất bại!");
            setShowToast(true);
        }
        setEditLoading(false);
    };

    const handleRemoveMoreImage = (index) => {
        setEditForm((prev) => ({
            ...prev,
            moreImages: prev.moreImages.filter((_, i) => i !== index),
        }));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm({ ...editForm, [name]: value });
        const newErrors = { ...editErrors };
        if (name === "name" && value.trim()) delete newErrors.name;
        if (name === "costPrice" && value > 0) delete newErrors.costPrice;
        if (name === "price" && value > 0) delete newErrors.price;
        if (name === "stock" && value >= 0) delete newErrors.stock;
        if (name === "category" && value) delete newErrors.category;
        setEditErrors(newErrors);
    };

    const handleDescriptionChange = (value) => {
        setEditForm({ ...editForm, description: value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!validateEditForm()) return;
        setEditLoading(true);
        try {
            const data = {
                ...editForm,
                costPrice: Number(editForm.costPrice),
                price: Number(editForm.price),
                stock: Number(editForm.stock),
                moreImages: editForm.moreImages.filter(img => img.url),
            };
            const res = await updateProduct(selectedProduct.id, data, token);
            if (res.statusCode === 200 || res.statusCode === 201) {
                setShowEditModal(false);
                setToastMsg("Cập nhật sản phẩm thành công!");
                setShowToast(true);
                const reload = await getProductsByShop({ pageNumber, pageSize, shopId }, token);
                const activeProducts = (reload.data.items || []).filter(p => p.isActive === true);
                setProducts(activeProducts);
            } else {
                setToastMsg(res.message || "Cập nhật sản phẩm thất bại!");
                setShowToast(true);
            }
        } catch {
            setToastMsg("Cập nhật sản phẩm thất bại!");
            setShowToast(true);
        }
        setEditLoading(false);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === pageNumber}
                    onClick={() => setPageNumber(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return (
            <Pagination className="justify-content-center mt-3">
                <Pagination.First onClick={() => setPageNumber(1)} disabled={pageNumber === 1} />
                <Pagination.Prev onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber === 1} />
                {items}
                <Pagination.Next onClick={() => setPageNumber(pageNumber + 1)} disabled={pageNumber === totalPages} />
                <Pagination.Last onClick={() => setPageNumber(totalPages)} disabled={pageNumber === totalPages} />
            </Pagination>
        );
    };

    return (
        <Container style={{ padding: 40 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Danh sách sản phẩm của Shop</h2>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Thêm sản phẩm
                </Button>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Giá</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted">
                                        Không có sản phẩm nào
                                    </td>
                                </tr>
                            ) : (
                                products.map((p, idx) => (
                                    <tr key={p.id}>
                                        <td>{(pageNumber - 1) * pageSize + idx + 1}</td>
                                        <td>
                                            <img
                                                src={
                                                    p.commonImage
                                                        ? p.commonImage.startsWith("http")
                                                            ? p.commonImage
                                                            : `${BASE_API_URL}${p.commonImage}`
                                                        : "https://via.placeholder.com/60"
                                                }
                                                alt={p.name}
                                                style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                                            />
                                        </td>
                                        <td>{p.name}</td>
                                        <td>{p.price?.toLocaleString("vi-VN")} đ</td>
                                        <td>
                                            {p.status === "Available" || p.status === "InStock" ? (
                                                <span className="text-success">Còn hàng</span>
                                            ) : (
                                                <span className="text-danger">Hết hàng</span>
                                            )}
                                        </td>
                                        <td>{new Date(p.createdDate).toLocaleDateString("vi-VN")}</td>
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleShowEditModal(p)}
                                            >
                                                Sửa
                                            </Button>
                                            {p.isActive && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteProduct(p.id)}
                                                    disabled={deleteLoadingId === p.id}
                                                >
                                                    {deleteLoadingId === p.id ? <Spinner size="sm" /> : "Xóa"}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                    {renderPagination()}
                </>
            )}

            <AddProducts
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onCreated={handleProductCreated}
                token={token}
            />

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Sửa sản phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {Object.keys(editErrors).length > 0 && (
                        <Alert variant="danger">
                            {Object.values(editErrors).map((err, idx) => (
                                <div key={idx}>{err}</div>
                            ))}
                        </Alert>
                    )}
                    <Form onSubmit={handleEditSubmit} noValidate>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        required
                                        isInvalid={!!editErrors.name}
                                        size="sm"
                                        placeholder="Nhập tên sản phẩm"
                                        aria-describedby="name-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="name-error">
                                        {editErrors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mô tả</Form.Label>
                                    <ReactQuill
                                        value={editForm.description}
                                        onChange={handleDescriptionChange}
                                        placeholder="Nhập mô tả sản phẩm"
                                        theme="snow"
                                        style={{ height: "150px", marginBottom: "40px" }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={editForm.category}
                                        onChange={handleEditChange}
                                        required
                                        isInvalid={!!editErrors.category}
                                        size="sm"
                                        aria-describedby="category-error"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {CATEGORIES.map((category, idx) => (
                                            <option key={idx} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid" id="category-error">
                                        {editErrors.category}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá vốn <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        name="costPrice"
                                        value={editForm.costPrice}
                                        onChange={handleEditChange}
                                        type="number"
                                        required
                                        isInvalid={!!editErrors.costPrice}
                                        size="sm"
                                        placeholder="Nhập giá vốn"
                                        aria-describedby="costPrice-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="costPrice-error">
                                        {editErrors.costPrice}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá bán <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        name="price"
                                        value={editForm.price}
                                        onChange={handleEditChange}
                                        type="number"
                                        required
                                        isInvalid={!!editErrors.price}
                                        size="sm"
                                        placeholder="Nhập giá bán"
                                        aria-describedby="price-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="price-error">
                                        {editErrors.price}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số lượng <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        name="stock"
                                        value={editForm.stock}
                                        onChange={handleEditChange}
                                        type="number"
                                        required
                                        isInvalid={!!editErrors.stock}
                                        size="sm"
                                        placeholder="Nhập số lượng"
                                        aria-describedby="stock-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="stock-error">
                                        {editErrors.stock}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Chất liệu</Form.Label>
                                    <Form.Control
                                        name="material"
                                        value={editForm.material}
                                        onChange={handleEditChange}
                                        size="sm"
                                        placeholder="Nhập chất liệu sản phẩm"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh chính</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageChange}
                                disabled={editLoading}
                                size="sm"
                                aria-describedby="commonImage-help"
                            />
                            <Form.Text id="commonImage-help" muted>
                                Chọn file ảnh (jpg, png, tối đa 5MB)
                            </Form.Text>
                            {editForm.commonImage && (
                                <div className="mt-2 position-relative d-inline-block">
                                    <img
                                        src={editForm.commonImage}
                                        alt="Common"
                                        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6 }}
                                    />
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="position-absolute top-0 end-0"
                                        onClick={() => setEditForm({ ...editForm, commonImage: "" })}
                                        disabled={editLoading}
                                        aria-label="Xóa ảnh chính"
                                    >
                                        X
                                    </Button>
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh bổ sung (tối đa 5)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleEditMoreImagesChange}
                                disabled={editLoading}
                                size="sm"
                                aria-describedby="moreImages-help"
                            />
                            <Form.Text id="moreImages-help" muted>
                                Chọn nhiều file ảnh (jpg, png, tối đa 5MB mỗi ảnh)
                            </Form.Text>
                            {editForm.moreImages && editForm.moreImages.length > 0 && (
                                <div className="mt-2 d-flex flex-wrap">
                                    {editForm.moreImages.map((img, idx) => (
                                        <div key={idx} className="position-relative me-2 mb-2">
                                            <img
                                                src={img.url}
                                                alt={`Additional ${idx}`}
                                                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }}
                                            />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0"
                                                style={{ borderRadius: "50%", padding: "2px 6px" }}
                                                onClick={() => handleRemoveMoreImage(idx)}
                                                disabled={editLoading}
                                                aria-label={`Xóa ảnh bổ sung ${idx + 1}`}
                                            >
                                                X
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                        <div className="mt-4 text-end">
                            <Button
                                variant="secondary"
                                onClick={() => setShowEditModal(false)}
                                className="me-2"
                                disabled={editLoading}
                                aria-label="Hủy"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={editLoading || Object.keys(editErrors).length > 0}
                                aria-label="Lưu thay đổi"
                            >
                                {editLoading ? <Spinner size="sm" className="me-2" /> : null}
                                Lưu thay đổi
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Toast
                show={showToast}
                onClose={() => setShowToast(false)}
                delay={2000}
                autohide
                style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    minWidth: 250,
                    zIndex: 9999,
                }}
                bg="success"
            >
                <Toast.Header>
                    <strong className="me-auto">Thông báo</strong>
                </Toast.Header>
                <Toast.Body className="text-white">{toastMsg}</Toast.Body>
            </Toast>
        </Container>
    );
};

export default ShopProducts;