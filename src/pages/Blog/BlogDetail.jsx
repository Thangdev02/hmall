import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Alert, Toast, ToastContainer } from "react-bootstrap";
import { motion } from "framer-motion";
import { Calendar, Person, Clock, ArrowLeft, Heart, HeartFill, ChatDots } from "react-bootstrap-icons";
import { getBlogDetail, getBlogs, createComment, getComments, editComment, deleteComment, createReply, likeBlog } from "../../api/blog";
import { getUser } from "../../api/auth";
import CommentSection from "../../components/Comments/CommentSection";
import CommentForm from "../../components/Comments/CommentForm";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  // ✅ Sử dụng localStorage để track like status vì không có API check
  const [currentBlogLiked, setCurrentBlogLiked] = useState(false);

  // ✅ Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Thêm state cho user authentication
  const [currentUserID, setCurrentUserID] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [currentUser, setCurrentUser] = useState(null);

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

  // ✅ LocalStorage helpers cho like status
  const getLikeStatusKey = (blogId) => `blog_liked_${blogId}`;

  const getBlogLikeStatus = (blogId) => {
    if (!isAuthenticated()) return false;
    const key = getLikeStatusKey(blogId);
    return localStorage.getItem(key) === 'true';
  };

  const setBlogLikeStatus = (blogId, isLiked) => {
    if (!isAuthenticated()) return;
    const key = getLikeStatusKey(blogId);
    if (isLiked) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.removeItem(key);
    }
  };

  // Function để lấy thông tin user hiện tại
  const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUserID(null);
      setCurrentUser(null);
      return;
    }

    try {
      const res = await getUser(token);
      if (res && res.statusCode === 200) {
        const userData = res.data;
        setCurrentUser(userData);
        const userId = userData.id || userData.userID || userData.userId || userData.ID;
        setCurrentUserID(userId);
        console.log('Current user data:', userData);
        console.log('Current user ID:', userId);
      } else {
        setCurrentUserID(null);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      setCurrentUserID(null);
      setCurrentUser(null);
    }
  };

  // useEffect để lấy thông tin user khi component mount
  useEffect(() => {
    getCurrentUser();
  }, []);

  // ✅ Load like status từ localStorage khi có blog
  useEffect(() => {
    if (blog && id) {
      const likedStatus = getBlogLikeStatus(id);
      setCurrentBlogLiked(likedStatus);
      console.log('✅ Loaded like status from localStorage:', { blogId: id, isLiked: likedStatus });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog, id]);

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
    }
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

  // Sanitize and format blog content
  const formatBlogContent = (content) => {
    if (!content) return 'Nội dung bài viết đang được cập nhật...';

    if (content.includes('<') && content.includes('>')) {
      return content;
    }

    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim())
      .join('<br /><br />');
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

  // ✅ Handle like/dislike với localStorage tracking - FIXED LOGIC
  const handleLikeBlog = async () => {
    if (!isAuthenticated()) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);

    console.log('=== LIKE ACTION START ===');
    console.log('Current liked status:', currentBlogLiked ? '🔴 LIKED' : '⚪ NOT LIKED');

    // Optimistic update - đảo ngược trạng thái hiện tại
    const oldStatus = currentBlogLiked;
    const newLikedStatus = !currentBlogLiked;
    setCurrentBlogLiked(newLikedStatus);
    setBlogLikeStatus(id, newLikedStatus);

    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Calling likeBlog API...');

      const result = await likeBlog(id, token);
      console.log('🔄 likeBlog API result:', result);

      if (result && result.statusCode === 200) {
        const message = result.message || '';
        let finalLikeStatus;
        let toastMsg;

        // ✅ FIXED: Kiểm tra chính xác message từ API
        if (message.toLowerCase().includes('like') && message.toLowerCase().includes('success') && !message.toLowerCase().includes('dislike')) {
          // API trả về "Like Blog Success" => User vừa like => Button màu đỏ
          finalLikeStatus = true;
          toastMsg = "Đã thích bài viết!";
          console.log('🔴 API SUCCESS: LIKED - Button will be RED');
        } else if (message.toLowerCase().includes('dislike') && message.toLowerCase().includes('success')) {
          // API trả về "Dislike blog success" => User vừa dislike => Button màu xám
          finalLikeStatus = false;
          toastMsg = "Đã bỏ thích bài viết!";
          console.log('⚪ API SUCCESS: DISLIKED - Button will be GRAY');
        } else {
          // Fallback: giữ nguyên optimistic update
          finalLikeStatus = newLikedStatus;
          toastMsg = newLikedStatus ? "Đã thích bài viết!" : "Đã bỏ thích bài viết!";
          console.log('⚠️ FALLBACK - Using optimistic update:', finalLikeStatus ? 'RED' : 'GRAY');
        }

        // Cập nhật state và localStorage cuối cùng
        setCurrentBlogLiked(finalLikeStatus);
        setBlogLikeStatus(id, finalLikeStatus);

        // Hiển thị thông báo
        setToastMessage(toastMsg);
        setToastType("success");
        setShowToast(true);

        // Refresh blog data để cập nhật like count
        try {
          const blogRes = await getBlogDetail(id);
          if (blogRes.statusCode === 200) {
            setBlog(blogRes.data);
          }
        } catch (refreshError) {
          console.log('⚠️ Could not refresh blog data:', refreshError);
        }

        console.log('✅ FINAL STATUS:', finalLikeStatus ? '🔴 LIKED (RED)' : '⚪ NOT LIKED (GRAY)');

      } else {
        // API thất bại - rollback về trạng thái cũ
        setCurrentBlogLiked(oldStatus);
        setBlogLikeStatus(id, oldStatus);
        setToastMessage(result?.message || 'Không thể thực hiện hành động này');
        setToastType("danger");
        setShowToast(true);
        console.log('❌ API FAILED - Rollback to:', oldStatus ? 'RED' : 'GRAY');
      }
    } catch (error) {
      console.error('❌ API ERROR:', error);
      // Rollback về trạng thái cũ
      setCurrentBlogLiked(oldStatus);
      setBlogLikeStatus(id, oldStatus);
      setToastMessage('Có lỗi xảy ra khi thích bài viết');
      setToastType("danger");
      setShowToast(true);
      console.log('❌ ERROR - Rollback to:', oldStatus ? 'RED' : 'GRAY');
    } finally {
      setIsLiking(false);
      console.log('=== LIKE ACTION END ===');
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!isAuthenticated()) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (!commentContent.trim() || commentContent === '<p><br></p>') {
      setToastMessage('Vui lòng nhập nội dung bình luận');
      setToastType("warning");
      setShowToast(true);
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
        setToastMessage('Bình luận thành công!');
        setToastType("success");
        setShowToast(true);
        setCommentContent('');
        setShowCommentModal(false);
        await refreshData();
      } else {
        setToastMessage(result.message || 'Không thể gửi bình luận');
        setToastType("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setToastMessage('Có lỗi xảy ra khi gửi bình luận');
      setToastType("danger");
      setShowToast(true);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId, newContent) => {
    if (!newContent.trim() || newContent === '<p><br></p>') {
      setToastMessage('Vui lòng nhập nội dung bình luận');
      setToastType("warning");
      setShowToast(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const result = await editComment(commentId, { content: newContent }, token);

      if (result.statusCode === 200) {
        setToastMessage('Cập nhật bình luận thành công!');
        setToastType("success");
        setShowToast(true);
        const commentsRes = await getComments({ blogId: id });
        if (commentsRes.statusCode === 200) {
          setComments(commentsRes.data.items || []);
        }
      } else {
        setToastMessage(result.message || 'Không thể cập nhật bình luận');
        setToastType("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      setToastMessage('Có lỗi xảy ra khi cập nhật bình luận');
      setToastType("danger");
      setShowToast(true);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        const token = localStorage.getItem('token');
        const result = await deleteComment(commentId, token);

        if (result.statusCode === 200) {
          setToastMessage('Xóa bình luận thành công!');
          setToastType("success");
          setShowToast(true);
          await refreshData();
        } else {
          setToastMessage(result.message || 'Không thể xóa bình luận');
          setToastType("danger");
          setShowToast(true);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        setToastMessage('Có lỗi xảy ra khi xóa bình luận');
        setToastType("danger");
        setShowToast(true);
      }
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (commentId) => {
    if (!isAuthenticated()) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (!replyContent.trim() || replyContent === '<p><br></p>') {
      setToastMessage('Vui lòng nhập nội dung phản hồi');
      setToastType("warning");
      setShowToast(true);
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
        setToastMessage('Phản hồi thành công!');
        setToastType("success");
        setShowToast(true);
        setReplyingTo(null);
        setReplyContent('');

        const commentsRes = await getComments({ blogId: id });
        if (commentsRes.statusCode === 200) {
          setComments(commentsRes.data.items || []);
        }
      } else {
        setToastMessage(result.message || 'Không thể gửi phản hồi');
        setToastType("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      setToastMessage('Có lỗi xảy ra khi gửi phản hồi');
      setToastType("danger");
      setShowToast(true);
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

  console.log('🎯 RENDER - Button status:', {
    currentBlogLiked: currentBlogLiked ? '🔴 TRUE (RED)' : '⚫ FALSE (GRAY)',
    variant: currentBlogLiked ? "danger" : "secondary"
  });

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
                dangerouslySetInnerHTML={{
                  __html: formatBlogContent(blog.content)
                }}
              />

              {/* ✅ Like Button - Đỏ khi liked, xám khi không liked */}
              <div className="d-flex justify-content-center mt-4 mb-4">
                <Button
                  variant={currentBlogLiked ? "danger" : "secondary"}
                  size="lg"
                  style={{
                    borderRadius: "30px",
                    transition: "all 0.3s ease",
                    fontWeight: "600",
                    padding: "12px 40px",
                    fontSize: "1.1rem"
                  }}
                  onClick={handleLikeBlog}
                  disabled={isLiking}
                >
                  {isLiking ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <>
                      {currentBlogLiked ? <HeartFill className="me-2" /> : <Heart className="me-2" />}
                    </>
                  )}
                  {currentBlogLiked ? 'Đã thích' : 'Thích bài viết'} ({blog.totalLike})
                </Button>
              </div>

              {/* Comments Section */}
              <CommentSection
                comments={comments}
                commentsLoading={commentsLoading}
                onOpenCommentForm={() => {
                  if (!isAuthenticated()) {
                    localStorage.setItem('redirectAfterLogin', window.location.pathname);
                    navigate('/login');
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
                currentUserID={currentUserID}
                isAuthenticated={isAuthenticated}
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
                    <div className="position-relative">
                      <BlogImage
                        src={relatedBlog.image || relatedFallback}
                        alt={relatedBlog.title}
                        style={{ height: "180px", objectFit: "cover", width: "100%" }}
                      />
                    </div>

                    <Link
                      to={`/blog/${relatedBlog.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
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
                        </div>
                        <small className="text-muted">
                          {formatDate(relatedBlog.publishDate)}
                        </small>
                      </Card.Body>
                    </Link>
                  </Card>
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

      {/* Toast notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastType}
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default BlogDetail;