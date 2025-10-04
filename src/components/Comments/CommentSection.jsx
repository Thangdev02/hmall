import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { ChatDots } from "react-bootstrap-icons";
import CommentItem from "./CommentItem";

const CommentSection = ({
    comments,
    commentsLoading,
    onOpenCommentForm,
    onEditComment,
    onDeleteComment,
    onSubmitReply,
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
    return (
        <div className="mt-5">
            <h5 className="fw-bold mb-4">
                Bình luận ({comments.length})
            </h5>

            {commentsLoading ? (
                <div className="text-center py-4">
                    <Spinner animation="border" size="sm" style={{ color: "#84B4C8" }} />
                </div>
            ) : comments.length > 0 ? (
                <div>
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onEdit={onEditComment}
                            onDelete={onDeleteComment}
                            onReply={onSubmitReply}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            formatRelativeTime={formatRelativeTime}
                            quillModules={quillModules}
                            quillFormats={quillFormats}
                            currentUserID={currentUserID}
                            isAuthenticated={isAuthenticated} // Đảm bảo truyền prop này
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-muted">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
            )}

            <div className="mt-4">
                <Button
                    style={{
                        background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                        border: "none",
                        borderRadius: "25px",
                        padding: "12px 30px",
                        fontWeight: "600",
                        color: "white"
                    }}
                    onClick={onOpenCommentForm}
                >
                    <ChatDots className="me-2" />
                    Viết bình luận
                </Button>
            </div>
        </div>
    );
};

export default CommentSection;