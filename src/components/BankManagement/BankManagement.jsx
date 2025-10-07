import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Modal,
    Form,
    Table,
    Alert,
    Spinner,
    Badge,
    Row,
    Col
} from 'react-bootstrap';
import {
    PlusCircleFill,
    PencilFill,
    TrashFill,
    CheckCircleFill,
    CreditCardFill
} from 'react-bootstrap-icons';
import { addBank, getBanks, editBank, deleteBank, setDefaultBank } from '../../api/bank';

const BankManagement = () => {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        bankName: '',
        bankNo: ''
    });

    const token = localStorage.getItem('token');

    // Danh sách ngân hàng Việt Nam
    const VIETNAM_BANKS = [
        { name: "Ngân hàng TMCP Công thương Việt Nam", code: "ICB", short_name: "VietinBank" },
        { name: "Ngân hàng TMCP Ngoại Thương Việt Nam", code: "VCB", short_name: "Vietcombank" },
        { name: "Ngân hàng TMCP Quân đội", code: "MB", short_name: "MBBank" },
        { name: "Ngân hàng TMCP Á Châu", code: "ACB", short_name: "ACB" },
        { name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", code: "VPB", short_name: "VPBank" },
        { name: "Ngân hàng TMCP Tiên Phong", code: "TPB", short_name: "TPBank" },
        { name: "Ngân hàng TMCP Hàng Hải", code: "MSB", short_name: "MSB" },
        { name: "Ngân hàng TMCP Bưu Điện Liên Việt", code: "LPB", short_name: "LienVietPostBank" },
        { name: "Ngân hàng TMCP Bản Việt", code: "VCCB", short_name: "VietCapitalBank" },
        { name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", code: "BIDV", short_name: "BIDV" },
        { name: "Ngân hàng TMCP Sài Gòn Thương Tín", code: "STB", short_name: "Sacombank" },
        { name: "Ngân hàng TMCP Quốc tế Việt Nam", code: "VIB", short_name: "VIB" },
        { name: "Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh", code: "HDB", short_name: "HDBank" },
        { name: "Ngân hàng TMCP Đông Nam Á", code: "SEAB", short_name: "SeABank" },
        { name: "Ngân hàng TNHH MTV Shinhan Việt Nam", code: "SHBVN", short_name: "ShinhanBank" },
        { name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam", code: "VBA", short_name: "Agribank" },
        { name: "Ngân hàng TMCP Kỹ thương Việt Nam", code: "TCB", short_name: "Techcombank" },
        { name: "Ngân hàng TMCP Bắc Á", code: "BAB", short_name: "BacABank" },
        { name: "Ngân hàng TMCP An Bình", code: "ABB", short_name: "ABBANK" },
        { name: "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam", code: "EIB", short_name: "Eximbank" },
        { name: "Ngân hàng TNHH MTV Public Việt Nam", code: "PBVN", short_name: "PublicBank" },
        { name: "Ngân hàng TMCP Phương Đông", code: "OCB", short_name: "OCB" },
        { name: "Ngân hàng TMCP Kiên Long", code: "KLB", short_name: "KienLongBank" }
    ];

    // Helper function để lấy thông tin ngân hàng từ code
    const getBankInfoByCode = (code) => {
        return VIETNAM_BANKS.find(bank => bank.code === code) || { name: code, short_name: code };
    };

    // Fetch banks data
    const fetchBanks = async () => {
        try {
            setLoading(true);
            const response = await getBanks({}, token);
            if (response.statusCode === 200) {
                setBanks(response.data.items || []);
            } else {
                setError(response.message || 'Không thể tải danh sách ngân hàng');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi tải dữ liệu');
            console.error('Error fetching banks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
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

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle bank selection change
    const handleBankSelect = (e) => {
        const selectedBankCode = e.target.value;
        setFormData(prev => ({
            ...prev,
            bankName: selectedBankCode
        }));
    };

    // Open add modal
    const handleAdd = () => {
        setEditingBank(null);
        setFormData({ bankName: '', bankNo: '' });
        setShowModal(true);
    };

    // Open edit modal
    const handleEdit = (bank) => {
        setEditingBank(bank);
        setFormData({
            bankName: bank.bankName,
            bankNo: bank.bankNo
        });
        setShowModal(true);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bankName || !formData.bankNo) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setSaving(true);
            let response;

            const submitData = {
                bankName: formData.bankName,
                bankNo: formData.bankNo
            };

            if (editingBank) {
                response = await editBank(editingBank.id, submitData, token);
            } else {
                response = await addBank(submitData, token);
            }

            if (response.statusCode === 200) {
                setSuccess(editingBank ? 'Cập nhật ngân hàng thành công!' : 'Thêm ngân hàng thành công!');
                setShowModal(false);
                fetchBanks();
            } else {
                setError(response.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra');
            console.error('Error saving bank:', err);
        } finally {
            setSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async (bankId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
            try {
                const response = await deleteBank(bankId, token);
                if (response.statusCode === 200) {
                    setSuccess('Xóa ngân hàng thành công!');
                    fetchBanks();
                } else {
                    setError(response.message || 'Không thể xóa ngân hàng');
                }
            } catch (err) {
                setError('Đã có lỗi xảy ra khi xóa');
                console.error('Error deleting bank:', err);
            }
        }
    };

    // Handle set default
    const handleSetDefault = async (bankId) => {
        try {
            const response = await setDefaultBank(bankId, token);
            if (response.statusCode === 200) {
                setSuccess('Đặt ngân hàng mặc định thành công!');
                fetchBanks();
            } else {
                setError(response.message || 'Không thể đặt ngân hàng mặc định');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra');
            console.error('Error setting default bank:', err);
        }
    };

    return (
        <Card className="bank-management-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    <CreditCardFill className="me-2" />
                    Quản lý tài khoản ngân hàng
                </h5>
                <Button variant="primary" size="sm" onClick={handleAdd}>
                    <PlusCircleFill className="me-2" />
                    Thêm ngân hàng
                </Button>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </Spinner>
                    </div>
                ) : (
                    <>
                        {banks.length > 0 ? (
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>Ngân hàng</th>
                                        <th>Số tài khoản</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banks.map((bank) => {
                                        const bankInfo = getBankInfoByCode(bank.bankName);
                                        return (
                                            <tr key={bank.id} className={bank.isUse ? "table-success" : ""}>
                                                <td>
                                                    <div>
                                                        <strong>{bankInfo.short_name}</strong>
                                                        <br />
                                                        <small className="text-muted">{bankInfo.name}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <code>{bank.bankNo}</code>
                                                </td>
                                                <td>
                                                    <Badge bg={bank.isUse ? "success" : "secondary"}>
                                                        <CheckCircleFill
                                                            className="me-1"
                                                            color={bank.isUse ? "#28a745" : "#adb5bd"}
                                                        />
                                                        {bank.isUse ? "Đang sử dụng" : "Thường"}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEdit(bank)}
                                                        >
                                                            <PencilFill size={12} />
                                                        </Button>
                                                        {!bank.isUse && (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => handleSetDefault(bank.id)}
                                                                title="Đặt làm mặc định"
                                                            >
                                                                <CheckCircleFill size={12} />
                                                            </Button>
                                                        )}
                                                        {bank.isUse && (
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                disabled
                                                                style={{ fontWeight: 'bold', borderWidth: 2 }}
                                                                title="Tài khoản đang sử dụng"
                                                            >
                                                                <CheckCircleFill size={12} className="me-1" />
                                                                Đang sử dụng
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(bank.id)}
                                                        >
                                                            <TrashFill size={12} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        ) : (
                            <div className="text-center py-4">
                                <CreditCardFill size={48} className="text-muted mb-3" />
                                <p className="text-muted">Chưa có tài khoản ngân hàng nào</p>
                                <Button variant="primary" onClick={handleAdd}>
                                    Thêm tài khoản đầu tiên
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card.Body>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingBank ? 'Chỉnh sửa' : 'Thêm'} tài khoản ngân hàng
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Chọn ngân hàng *</Form.Label>
                                    <Form.Select
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleBankSelect}
                                        required
                                    >
                                        <option value="">-- Chọn ngân hàng --</option>
                                        {VIETNAM_BANKS.map((bank) => (
                                            <option key={bank.code} value={bank.code}>
                                                {bank.short_name} - {bank.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số tài khoản *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="bankNo"
                                        value={formData.bankNo}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số tài khoản ngân hàng"
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Vui lòng nhập chính xác số tài khoản để nhận thanh toán
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Alert variant="info" className="mt-3">
                            <strong>Lưu ý:</strong> Tài khoản ngân hàng này sẽ được sử dụng để nhận thanh toán từ khách hàng.
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                editingBank ? 'Cập nhật' : 'Thêm mới'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Card>
    );
};

export default BankManagement;