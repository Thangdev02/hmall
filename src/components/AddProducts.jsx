import { useState, useRef } from "react";
import React from "react";
import { Modal, Button, Form, Spinner, Alert, Row, Col } from "react-bootstrap";
import { uploadMultipleFiles } from "../api/upload";
import { createProduct } from "../api/product";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

const AddProducts = ({ show, onHide, onCreated, token }) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        costPrice: "",
        price: "",
        stock: "",
        material: "",
        commonImage: "",
        category: "",
        moreImage: [{ url: "" }],
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const commonImageRef = useRef();
    const moreImageRefs = useRef([React.createRef()]);

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
        if (!form.costPrice || form.costPrice <= 0) newErrors.costPrice = "Giá vốn phải lớn hơn 0";
        if (!form.price || form.price <= 0) newErrors.price = "Giá bán phải lớn hơn 0";
        if (!form.stock || form.stock < 0) newErrors.stock = "Số lượng không được âm";
        if (!form.category) newErrors.category = "Vui lòng chọn danh mục";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateImage = (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!file.type.startsWith("image/")) {
            return "Chỉ chấp nhận file ảnh (jpg, png, etc.)";
        }
        if (file.size > maxSize) {
            return "Kích thước ảnh tối đa là 5MB";
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        const newErrors = { ...errors };
        if (name === "name" && value.trim()) delete newErrors.name;
        if (name === "costPrice" && value > 0) delete newErrors.costPrice;
        if (name === "price" && value > 0) delete newErrors.price;
        if (name === "stock" && value >= 0) delete newErrors.stock;
        if (name === "category" && value) delete newErrors.category;
        setErrors(newErrors);
    };

    const handleDescriptionChange = (value) => {
        setForm({ ...form, description: value });
    };

    const handleCommonImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const imageError = validateImage(file);
        if (imageError) {
            setGeneralError(imageError);
            return;
        }
        setUploading(true);
        try {
            const res = await uploadMultipleFiles({ files: [file], customeFolder: "products" }, token);
            const relativePath = res?.files?.[0];
            if (relativePath) {
                const imgUrl = `${BASE_API_URL}${relativePath}`;
                setForm({ ...form, commonImage: imgUrl });
            } else {
                setGeneralError("Tải ảnh chính thất bại: Không nhận được đường dẫn ảnh");
            }
        } catch {
            setGeneralError("Tải ảnh chính thất bại");
        }
        setUploading(false);
    };

    const handleMoreImageChange = async (idx, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const imageError = validateImage(file);
        if (imageError) {
            setGeneralError(imageError);
            return;
        }
        setUploading(true);
        try {
            const res = await uploadMultipleFiles({ files: [file], customeFolder: "products" }, token);
            const relativePath = res?.files?.[0];
            if (relativePath) {
                const imgUrl = `${BASE_API_URL}${relativePath}`;
                const newMoreImage = [...form.moreImage];
                newMoreImage[idx] = { url: imgUrl };
                setForm({ ...form, moreImage: newMoreImage });
            } else {
                setGeneralError("Tải ảnh phụ thất bại: Không nhận được đường dẫn ảnh");
            }
        } catch {
            setGeneralError("Tải ảnh phụ thất bại");
        }
        setUploading(false);
    };

    const handleAddMoreImage = () => {
        if (form.moreImage.length >= 5) {
            setGeneralError("Tối đa 5 ảnh phụ");
            return;
        }
        setForm({ ...form, moreImage: [...form.moreImage, { url: "" }] });
        moreImageRefs.current.push(React.createRef());
    };

    const handleRemoveMoreImage = (idx) => {
        const newMoreImage = [...form.moreImage];
        newMoreImage.splice(idx, 1);
        moreImageRefs.current.splice(idx, 1);
        setForm({ ...form, moreImage: newMoreImage });
    };

    const handleRemoveCommonImage = () => {
        setForm({ ...form, commonImage: "" });
        commonImageRef.current.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setGeneralError("");
        try {
            const data = {
                ...form,
                costPrice: Number(form.costPrice),
                price: Number(form.price),
                stock: Number(form.stock),
                moreImage: form.moreImage.filter((img) => img.url),
            };
            const res = await createProduct(data, token);
            if (res.statusCode === 201) {
                onCreated();
                onHide();
                setForm({
                    name: "",
                    description: "",
                    costPrice: "",
                    price: "",
                    stock: "",
                    material: "",
                    commonImage: "",
                    category: "",
                    moreImage: [{ url: "" }],
                });
                moreImageRefs.current = [React.createRef()];
                commonImageRef.current.value = null;
                setErrors({});
            } else {
                setGeneralError(res.message || "Tạo sản phẩm thất bại");
            }
        } catch {
            setGeneralError("Tạo sản phẩm thất bại");
        }
        setLoading(false);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" aria-labelledby="add-product-modal">
            <Modal.Header closeButton>
                <Modal.Title id="add-product-modal">Thêm sản phẩm mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {generalError && (
                    <Alert variant="danger" onClose={() => setGeneralError("")} dismissible>
                        {generalError}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit} noValidate>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    isInvalid={!!errors.name}
                                    size="sm"
                                    placeholder="Nhập tên sản phẩm"
                                    aria-describedby="name-error"
                                />
                                <Form.Control.Feedback type="invalid" id="name-error">
                                    {errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả</Form.Label>
                                <ReactQuill
                                    value={form.description}
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
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                    isInvalid={!!errors.category}
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
                                    {errors.category}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Giá vốn <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    name="costPrice"
                                    value={form.costPrice}
                                    onChange={handleChange}
                                    type="number"
                                    required
                                    isInvalid={!!errors.costPrice}
                                    size="sm"
                                    placeholder="Nhập giá vốn"
                                    aria-describedby="costPrice-error"
                                />
                                <Form.Control.Feedback type="invalid" id="costPrice-error">
                                    {errors.costPrice}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Giá bán <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    type="number"
                                    required
                                    isInvalid={!!errors.price}
                                    size="sm"
                                    placeholder="Nhập giá bán"
                                    aria-describedby="price-error"
                                />
                                <Form.Control.Feedback type="invalid" id="price-error">
                                    {errors.price}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Số lượng <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    name="stock"
                                    value={form.stock}
                                    onChange={handleChange}
                                    type="number"
                                    required
                                    isInvalid={!!errors.stock}
                                    size="sm"
                                    placeholder="Nhập số lượng"
                                    aria-describedby="stock-error"
                                />
                                <Form.Control.Feedback type="invalid" id="stock-error">
                                    {errors.stock}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Chất liệu</Form.Label>
                                <Form.Control
                                    name="material"
                                    value={form.material}
                                    onChange={handleChange}
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
                            ref={commonImageRef}
                            onChange={handleCommonImageChange}
                            disabled={uploading}
                            size="sm"
                            aria-describedby="commonImage-help"
                        />
                        <Form.Text id="commonImage-help" muted>
                            Chọn file ảnh (jpg, png, tối đa 5MB)
                        </Form.Text>
                        {form.commonImage && (
                            <div className="mt-2 position-relative d-inline-block">
                                <img
                                    src={form.commonImage}
                                    alt="Common"
                                    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6 }}
                                />
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="position-absolute top-0 end-0"
                                    onClick={handleRemoveCommonImage}
                                    aria-label="Xóa ảnh chính"
                                >
                                    X
                                </Button>
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Ảnh phụ (tối đa 5)</Form.Label>
                        {form.moreImage.map((img, idx) => (
                            <div key={idx} className="d-flex mb-2 align-items-center">
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    ref={(el) => (moreImageRefs.current[idx] = el)}
                                    onChange={(e) => handleMoreImageChange(idx, e)}
                                    disabled={uploading}
                                    size="sm"
                                    aria-describedby={`moreImage-help-${idx}`}
                                />
                                <Form.Text id={`moreImage-help-${idx}`} muted className="ms-2">
                                    jpg, png, tối đa 5MB
                                </Form.Text>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRemoveMoreImage(idx)}
                                    className="ms-2"
                                    disabled={uploading}
                                    aria-label={`Xóa ảnh phụ ${idx + 1}`}
                                >
                                    X
                                </Button>
                                {img.url && (
                                    <div className="ms-2 position-relative d-inline-block">
                                        <img
                                            src={img.url}
                                            alt={`More ${idx}`}
                                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                                        />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0"
                                            onClick={() => handleRemoveMoreImage(idx)}
                                            aria-label={`Xóa ảnh phụ ${idx + 1}`}
                                        >
                                            X
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleAddMoreImage}
                            disabled={uploading || form.moreImage.length >= 5}
                            className="mt-2"
                            aria-label="Thêm ảnh phụ"
                        >
                            Thêm ảnh phụ
                        </Button>
                    </Form.Group>
                    <div className="mt-4 text-end">
                        <Button
                            variant="outline-secondary"
                            onClick={onHide}
                            className="me-2"
                            disabled={loading || uploading}
                            aria-label="Hủy"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || uploading || Object.keys(errors).length > 0}
                            aria-label="Tạo sản phẩm"
                        >
                            {loading ? <Spinner size="sm" className="me-2" /> : null}
                            Tạo sản phẩm
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddProducts;