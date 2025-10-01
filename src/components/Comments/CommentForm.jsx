import React, { useRef } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CommentForm = ({
    show,
    onHide,
    commentContent,
    setCommentContent,
    onSubmit,
    isSubmitting,
    quillModules,
    quillFormats
}) => {
    const quillRef = useRef(null);

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Viết bình luận</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Nội dung bình luận</Form.Label>
                    <ReactQuill
                        ref={quillRef}
                        value={commentContent}
                        onChange={setCommentContent}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Nhập bình luận của bạn..."
                        style={{ minHeight: '150px' }}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onHide}
                    style={{ borderRadius: "20px" }}
                >
                    Hủy
                </Button>
                <Button
                    style={{
                        background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                        border: "none",
                        borderRadius: "20px",
                        padding: "8px 20px",
                        fontWeight: "600",
                        color: "white"
                    }}
                    onClick={onSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang gửi...
                        </>
                    ) : (
                        'Gửi bình luận'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CommentForm;