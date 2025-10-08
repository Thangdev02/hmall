import React, { useState, useEffect, useRef, memo } from "react";
import { Button, Form, Dropdown } from "react-bootstrap";
import { ChatDots, ThreeDotsVertical, Pencil, Trash } from "react-bootstrap-icons";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CommentItem = memo(({
    comment,
    onEdit,
    onDelete,
    onReply,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    formatRelativeTime,
    quillModules,
    quillFormats,
    currentUserID,
    isAuthenticated
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [editingComment, setEditingComment] = useState(null);
    const quillReplyRef = useRef(null);
    const quillEditRef = useRef(null);

    const avatarFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%2384B4C8'/%3E%3Ctext x='20' y='26' font-family='Arial, sans-serif' font-size='16' fill='white' text-anchor='middle'%3EU%3C/text%3E%3C/svg%3E";

    // Thêm validation cho isAuthenticated prop
    const checkIsAuthenticated = () => {
        if (typeof isAuthenticated === 'function') {
            return isAuthenticated();
        }
        return !!localStorage.getItem('token');
    };

    // Kiểm tra xem có phải comment của user hiện tại không
    const isMyComment = () => {
        return currentUserID && comment.userID && comment.userID === currentUserID;
    };

    // Kiểm tra xem có phải reply của user hiện tại không  
    const isMyReply = (reply) => {
        return currentUserID && reply.userID && reply.userID === currentUserID;
    };

    // Maintain focus for reply editor
    useEffect(() => {
        if (replyingTo === comment.id && quillReplyRef.current) {
            quillReplyRef.current.focus();
        }
    }, [replyingTo, comment.id]);

    // Maintain focus for edit editor
    useEffect(() => {
        if (isEditing && editingComment === comment.id && quillEditRef.current) {
            quillEditRef.current.focus();
        }
    }, [isEditing, editingComment, comment.id]);

    const handleEditSave = () => {
        if (!editContent.trim() || editContent === '<p><br></p>') {
            alert('Vui lòng nhập nội dung bình luận');
            return;
        }
        onEdit(comment.id, editContent);
        setIsEditing(false);
        setEditingComment(null);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setEditContent(comment.content);
        setEditingComment(null);
    };

    const handleReplySubmit = () => {
        onReply(comment.id);
    };

    const handleReplyCancel = () => {
        setReplyingTo(null);
        setReplyContent('');
    };

    // Không xác nhận ở đây, chỉ gọi onDelete lên cha với type
    const handleDeleteComment = () => {
        onDelete(comment.id, "comment");
    };

    const handleDeleteReply = (replyId) => {
        onDelete(replyId, "reply");
    };

    return (
        <div className="border-bottom pb-3 mb-3">
            <div className="d-flex align-items-start">
                <img
                    src={comment.avatar || avatarFallback}
                    alt="Avatar"
                    className="rounded-circle me-3"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    onError={(e) => {
                        e.target.src = avatarFallback;
                    }}
                />
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <strong>{comment.displayName || 'Người dùng'}</strong>
                            <small className="text-muted ms-2">
                                {formatRelativeTime(comment.createdDate)}
                            </small>
                        </div>
                        {checkIsAuthenticated() && isMyComment() && (
                            <Dropdown>
                                <Dropdown.Toggle variant="link" className="text-muted border-0 p-0">
                                    <ThreeDotsVertical size={16} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => {
                                        setIsEditing(true);
                                        setEditingComment(comment.id);
                                    }}>
                                        <Pencil size={14} className="me-2" />
                                        Chỉnh sửa
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={handleDeleteComment}
                                        className="text-danger"
                                    >
                                        <Trash size={14} className="me-2" />
                                        Xóa
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </div>

                    {isEditing && editingComment === comment.id ? (
                        <div className="mt-2">
                            <ReactQuill
                                ref={quillEditRef}
                                value={editContent}
                                onChange={setEditContent}
                                modules={quillModules}
                                formats={quillFormats}
                                className="mb-2"
                                style={{ minHeight: '100px' }}
                            />
                            <div className="d-flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleEditSave}
                                    style={{
                                        background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                                        border: "none",
                                        borderRadius: "15px"
                                    }}
                                >
                                    Lưu
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={handleEditCancel}
                                    style={{ borderRadius: "15px" }}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                className="mt-2 mb-2"
                                dangerouslySetInnerHTML={{ __html: comment.content }}
                            />
                            <div className="d-flex align-items-center gap-3">
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-muted p-0"
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                >
                                    <ChatDots size={14} className="me-1" />
                                    Phản hồi
                                </Button>
                                {comment.totalReplies > 0 && (
                                    <small className="text-muted">
                                        {comment.totalReplies} phản hồi
                                    </small>
                                )}
                            </div>

                            {replyingTo === comment.id && (
                                <div className="mt-3">
                                    <ReactQuill
                                        ref={quillReplyRef}
                                        value={replyContent}
                                        onChange={setReplyContent}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Viết phản hồi..."
                                        className="mb-2"
                                        style={{ minHeight: '100px' }}
                                    />
                                    <div className="d-flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleReplySubmit}
                                            style={{
                                                background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                                                border: "none",
                                                borderRadius: "15px"
                                            }}
                                        >
                                            Gửi
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            onClick={handleReplyCancel}
                                            style={{ borderRadius: "15px" }}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ms-4">
                            {comment.replies.map((reply) => (
                                <div key={reply.id} className="border-bottom pb-2 mb-2">
                                    <div className="d-flex align-items-start">
                                        <img
                                            src={reply.avatar || avatarFallback}
                                            alt="Avatar"
                                            className="rounded-circle me-2"
                                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = avatarFallback;
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <strong style={{ fontSize: "0.9rem" }}>{reply.displayName || 'Người dùng'}</strong>
                                                    <small className="text-muted ms-2">
                                                        {formatRelativeTime(reply.createdDate)}
                                                    </small>
                                                </div>
                                                {checkIsAuthenticated() && isMyReply(reply) && (
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="link" className="text-muted border-0 p-0">
                                                            <ThreeDotsVertical size={14} />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => {
                                                                // Logic cho edit reply - có thể implement sau
                                                                console.log('Edit reply:', reply.id);
                                                            }}>
                                                                <Pencil size={12} className="me-2" />
                                                                Chỉnh sửa
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={() => handleDeleteReply(reply.id)}
                                                                className="text-danger"
                                                            >
                                                                <Trash size={12} className="me-2" />
                                                                Xóa
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                )}
                                            </div>
                                            <div
                                                className="mt-1"
                                                dangerouslySetInnerHTML={{ __html: reply.content }}
                                                style={{ fontSize: "0.9rem" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default CommentItem;