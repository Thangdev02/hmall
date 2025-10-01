import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import { Calendar, Person, Clock, ArrowLeft, Heart, HeartFill, ChatDots } from "react-bootstrap-icons";
import { getBlogDetail, getBlogs, createComment, getComments, editComment, deleteComment, createReply, likeBlog, checkLikeStatus } from "../../api/blog";
import CommentSection from "../../components/Comments/CommentSection";
import CommentForm from "../../components/Comments/CommentForm";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeChecked, setLikeChecked] = useState(false);

  // React Quill modules and formats
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['link'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline',
    'link',
    'list', 'bullet',
  ];

  // Check if user is logged in
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // Check like status from localStorage or API
  const checkUserLikeStatus = async () => {
    if (!isAuthenticated()) {
      setLikeChecked(true);
      return;
    }

    try {
      // First check localStorage for cached status
      const cachedLikeStatus = localStorage.getItem(`blog_like_${id}`);
      if (cachedLikeStatus !== null) {
        setIsLiked(cachedLikeStatus === 'true');
        setLikeChecked(true);
        return;
      }

      // If no cache, try API call (if endpoint exists)
      const token = localStorage.getItem('token');
      const result = await checkLikeStatus(id, token);

      if (result.statusCode === 200) {
        setIsLiked(result.isLiked || false);
        // Cache the result
        localStorage.setItem(`blog_like_${id}`, result.isLiked ? 'true' : 'false');
      }
    } catch (error) {
      console.log('Could not check like status:', error);
    } finally {
      setLikeChecked(true);
    }
  };

  // Fetch blog details from API
  useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getBlogDetail(id);

        if (res.statusCode === 200) {
          setBlog(res.data);

          const relatedRes = await getBlogs({ pageSize: 4 });
          if (relatedRes.statusCode === 200) {
            const filtered = relatedRes.data.items
              .filter(item => item.id !== id)
              .slice(0, 3);
            setRelatedBlogs(filtered);
          }
        } else {
          setError(res.message || 'Không thể tải bài viết');
        }
      } catch (error) {
        console.error('Error fetching blog detail:', error);
        setError('Không thể tải bài viết. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetail();
      checkUserLikeStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (id) {
        setCommentsLoading(true);
        try {
          const res = await getComments({ blogId: id });
          if (res.statusCode === 200) {
            setComments(res.data.items || []);
          }
        } catch (error) {
          console.error('Error fetching comments:', error);
        } finally {
          setCommentsLoading(false);
        }
      }
    };

    fetchComments();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return formatDate(dateString);
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content ? content.split(' ').length : 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes < 1 ? '1 phút đọc' : `${minutes} phút đọc`;
  };

  // Refresh comments and blog data
  const refreshData = async () => {
    const [commentsRes, blogRes] = await Promise.all([
      getComments({ blogId: id }),
      getBlogDetail(id)
    ]);

    if (commentsRes.statusCode === 200) {
      setComments(commentsRes.data.items || []);
    }
    if (blogRes.statusCode === 200) {
      setBlog(blogRes.data);
    }
  };

  // Handle like/dislike
  const handleLikeBlog = async () => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để thích bài viết');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const token = localStorage.getItem('token');
      const result = await likeBlog(id, token);

      if (result.statusCode === 200) {
        // Toggle like state
        const newLikeStatus = !isLiked;
        setIsLiked(newLikeStatus);

        // Cache the new status
        localStorage.setItem(`blog_like_${id}`, newLikeStatus ? 'true' : 'false');

        // Update blog data to reflect new like count
        const blogRes = await getBlogDetail(id);
        if (blogRes.statusCode === 200) {
          setBlog(blogRes.data);
        }

        console.log(result.message || 'Đã cập nhật trạng thái thích');
      } else {
        alert(result.message || 'Không thể thực hiện hành động này');
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      alert('Có lỗi xảy ra khi thích bài viết');
    } finally {
      setIsLiking(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!commentContent.trim() || commentContent === '<p><br></p>') {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const commentData = {
        content: commentContent.trim(),
        blogID: id
      };

      const token = localStorage.getItem('token');
      const result = await createComment(commentData, token);

      if (result.statusCode === 200) {
        alert('Bình luận thành công!');
        setCommentContent('');
        setShowCommentModal(false);
        await refreshData();
      } else {
        alert(result.message || 'Không thể gửi bình luận');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Có lỗi xảy ra khi gửi bình luận');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId, newContent) => {
    if (!newContent.trim() || newContent === '<p><br></p>') {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const result = await editComment(commentId, { content: newContent }, token);

      if (result.statusCode === 200) {
        alert('Cập nhật bình luận thành công!');
        const commentsRes = await getComments({ blogId: id });
        if (commentsRes.statusCode === 200) {
          setComments(commentsRes.data.items || []);
        }
      } else {
        alert(result.message || 'Không thể cập nhật bình luận');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Có lỗi xảy ra khi cập nhật bình luận');
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        const token = localStorage.getItem('token');
        const result = await deleteComment(commentId, token);

        if (result.statusCode === 200) {
          alert('Xóa bình luận thành công!');
          await refreshData();
        } else {
          alert(result.message || 'Không thể xóa bình luận');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Có lỗi xảy ra khi xóa bình luận');
      }
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (commentId) => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để phản hồi');
      return;
    }

    if (!replyContent.trim() || replyContent === '<p><br></p>') {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const replyData = {
        content: replyContent.trim(),
        commentID: commentId
      };

      const result = await createReply(replyData, token);

      if (result.statusCode === 200) {
        alert('Phản hồi thành công!');
        setReplyingTo(null);
        setReplyContent('');

        const commentsRes = await getComments({ blogId: id });
        if (commentsRes.statusCode === 200) {
          setComments(commentsRes.data.items || []);
        }
      } else {
        alert(result.message || 'Không thể gửi phản hồi');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Có lỗi xảy ra khi gửi phản hồi');
    }
  };

  // BlogImage Component with fallback
  const BlogImage = ({ src, alt, className, style }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%2384B4C8'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='24' fill='white' text-anchor='middle' dy='0.3em'%3EBlog Image%3C/text%3E%3C/svg%3E";

    useEffect(() => {
      setImageSrc(src);
      setHasError(false);
    }, [src]);

    const handleError = () => {
      if (!hasError) {
        setHasError(true);
        setImageSrc(fallbackImage);
      }
    };

    return (
      <img
        src={imageSrc || fallbackImage}
        alt={alt}
        className={className}
        style={style}
        onError={handleError}
      />
    );
  };

  if (loading) {
    return (
      <div style={{ paddingTop: "120px", minHeight: "100vh" }}>
        <Container>
          <Row className="justify-content-center">
            <Col className="text-center py-5">
              <Spinner animation="border" role="status" style={{ color: "#84B4C8" }}>
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
              <h4 className="mt-3">Đang tải bài viết...</h4>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <Container style={{ paddingTop: "120px", minHeight: "100vh" }}>
        <Row className="justify-content-center">
          <Col lg={6} className="text-center">
            <Alert variant="danger">
              <h4>Không tìm thấy bài viết</h4>
              <p>{error || 'Bài viết không tồn tại hoặc đã bị xóa.'}</p>
            </Alert>
            <Link to="/blog" style={{ textDecoration: 'none' }}>
              <Button style={{
                background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
                border: "none",
                borderRadius: "25px",
                padding: "12px 30px",
                fontWeight: "600",
                color: "white"
              }}>
                <ArrowLeft className="me-2" /> Quay lại Blog
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    );
  }

  const blogFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%2384B4C8'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='32' fill='white' text-anchor='middle' dy='0.3em'%3EBlog Image%3C/text%3E%3C/svg%3E";

  const relatedFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='180' viewBox='0 0 400 180'%3E%3Crect width='400' height='180' fill='%2384B4C8'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='16' fill='white' text-anchor='middle' dy='0.3em'%3EBlog Image%3C/text%3E%3C/svg%3E";

  return (
    <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
      {/* Banner Section */}
      <section
        className="banner-section blog-banner"
        style={{
          height: "400px",
          background: "linear-gradient(135deg, #84B4C8 0%, #B2D9EA 100%)",
          position: "relative",
          marginBottom: "3rem",
          display: "flex",
          alignItems: "center",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          className="banner-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.3)",
          }}
        ></div>
        <Container className="h-100">
          <Row className="h-100 align-items-center justify-content-center text-center">
            <Col lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ position: "relative", zIndex: 1 }}
              >
                <h1 className="display-4 fw-bold mb-3 text-white">
                  {blog.title}
                </h1>
                <div className="d-flex align-items-center justify-content-center text-light mb-3">
                  <Person size={16} className="me-2" />
                  <span className="me-4">{blog.author}</span>
                  <Calendar size={16} className="me-2" />
                  <span className="me-4">{formatDate(blog.publishDate)}</span>
                  <Clock size={16} className="me-2" />
                  <span>{calculateReadTime(blog.content)}</span>
                </div>
                <div className="d-flex align-items-center justify-content-center gap-3 text-light">
                  <div className="d-flex align-items-center">
                    <Heart size={16} className="me-2" />
                    <span>{blog.totalLike} lượt thích</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <ChatDots size={16} className="me-2" />
                    <span>{blog.totalComment} bình luận</span>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Navigation */}
              <div className="mb-4">
                <Link to="/blog" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outline-secondary"
                    style={{ borderRadius: "25px" }}
                  >
                    <ArrowLeft className="me-2" /> Quay lại Blog
                  </Button>
                </Link>
              </div>

              {/* Article Info */}
              <div className="mb-4 p-3 border-start border-primary border-4">
                <h2 className="h4 fw-bold mb-2" style={{ color: "#2c3e50" }}>
                  {blog.title}
                </h2>
                <div className="d-flex align-items-center text-muted">
                  <Person size={16} className="me-2" />
                  <span className="fw-semibold">Tác giả: {blog.author}</span>
                </div>
              </div>

              {/* Main Image */}
              <BlogImage
                src={blog.image || blogFallback}
                alt={blog.title}
                className="img-fluid rounded mb-4"
                style={{
                  maxHeight: "450px",
                  objectFit: "cover",
                  width: "100%",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                }}
              />

              {/* Content */}
              <div
                className="blog-content"
                style={{
                  lineHeight: "1.8",
                  fontSize: "1.1rem",
                  color: "#34495e",
                  padding: "2rem"
                }}
              >
                {blog.content ? blog.content.split("\n").map((para, idx) => (
                  para.trim() && (
                    <p key={idx} className="mb-3">
                      {para.trim()}
                    </p>
                  )
                )) : (
                  <p>Nội dung bài viết đang được cập nhật...</p>
                )}
              </div>

              {/* Like Button Only */}
              <div className="d-flex justify-content-center mt-4 mb-4">
                <Button
                  variant={isLiked ? "danger" : "outline-danger"}
                  size="lg"
                  style={{
                    borderRadius: "30px",
                    transition: "all 0.3s ease",
                    fontWeight: "600",
                    padding: "12px 40px",
                    fontSize: "1.1rem"
                  }}
                  onClick={handleLikeBlog}
                  disabled={isLiking || !likeChecked}
                >
                  {isLiking ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <>
                      {isLiked ? <HeartFill className="me-2" /> : <Heart className="me-2" />}
                    </>
                  )}
                  {isLiked ? 'Đã thích' : 'Thích bài viết'} ({blog.totalLike})
                </Button>
              </div>

              {/* Comments Section */}
              <CommentSection
                comments={comments}
                commentsLoading={commentsLoading}
                onOpenCommentForm={() => {
                  if (!isAuthenticated()) {
                    alert('Vui lòng đăng nhập để bình luận');
                    return;
                  }
                  setShowCommentModal(true);
                }}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onSubmitReply={handleSubmitReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                formatRelativeTime={formatRelativeTime}
                quillModules={quillModules}
                quillFormats={quillFormats}
              />

              {/* Updated/Published Info */}
              <div className="mt-4 p-3 border rounded" style={{ backgroundColor: "#f8f9fa" }}>
                <small className="text-muted">
                  <strong>Xuất bản:</strong> {formatDate(blog.publishDate)}
                  {blog.modifyDate && (
                    <>
                      <br />
                      <strong>Cập nhật:</strong> {formatDate(blog.modifyDate)}
                    </>
                  )}
                </small>
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <motion.section
            className="mt-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="fw-bold mb-4 text-center">Bài viết liên quan</h4>
            <Row>
              {relatedBlogs.map((relatedBlog) => (
                <Col lg={4} md={6} className="mb-4" key={relatedBlog.id}>
                  <Link
                    to={`/blog/${relatedBlog.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Card
                      className="h-100"
                      style={{
                        borderRadius: "15px",
                        overflow: "hidden",
                        border: "none",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.08)";
                      }}
                    >
                      <BlogImage
                        src={relatedBlog.image || relatedFallback}
                        alt={relatedBlog.title}
                        style={{ height: "180px", objectFit: "cover" }}
                      />
                      <Card.Body className="p-3">
                        <Card.Title
                          className="fw-bold mb-2"
                          style={{
                            fontSize: "1rem",
                            color: "#2c3e50",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {relatedBlog.title}
                        </Card.Title>
                        <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: "0.8rem" }}>
                          <span>
                            <Person size={12} className="me-1" />
                            {relatedBlog.author}
                          </span>
                          <div className="d-flex gap-2">
                            <span>
                              <Heart size={12} className="me-1" />
                              {relatedBlog.totalLike}
                            </span>
                            <span>
                              <ChatDots size={12} className="me-1" />
                              {relatedBlog.totalComment}
                            </span>
                          </div>
                        </div>
                        <small className="text-muted">
                          {formatDate(relatedBlog.publishDate)}
                        </small>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </motion.section>
        )}
      </Container>

      {/* Comment Form Modal */}
      <CommentForm
        show={showCommentModal}
        onHide={() => setShowCommentModal(false)}
        commentContent={commentContent}
        setCommentContent={setCommentContent}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmittingComment}
        quillModules={quillModules}
        quillFormats={quillFormats}
      />
    </div>
  );
};

export default BlogDetail;