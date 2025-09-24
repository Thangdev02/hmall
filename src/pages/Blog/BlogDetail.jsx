"use client"

import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Badge, Card, Button } from "react-bootstrap"
import { motion } from "framer-motion"
import { Calendar, Person, Clock, ArrowLeft } from "react-bootstrap-icons"
import { blogPosts } from "../../data/blog"

const BlogDetail = () => {
  const { id } = useParams()
  const post = blogPosts.find((p) => p.id === parseInt(id))

  if (!post) {
    return (
      <Container style={{ paddingTop: "120px", minHeight: "100vh" }}>
        <h3 className="text-center text-muted">Không tìm thấy bài viết</h3>
        <div className="text-center mt-3">
          <Link to="/blog" className="btn btn-primary-custom">
            <ArrowLeft className="me-2" /> Quay lại Blog
          </Link>
        </div>
      </Container>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Gợi ý bài viết liên quan (cùng category, khác id)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3)

  return (
    <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
      <section className="banner-section blog-banner">
        <div className="banner-overlay"></div>
        <Container className="h-100">
          <Row className="h-100 align-items-center justify-content-center text-center">
            <Col>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="display-4 fw-bold mb-3 text-white">{post.title}</h1>
                <p className="lead text-light">{post.excerpt}</p>
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
              transition={{ duration: 0.6 }}
            >
              <div className="d-flex align-items-center mb-4 text-muted">
                <Person size={16} className="me-2" />
                <span className="me-3">{post.author}</span>
                <Calendar size={16} className="me-2" />
                <span className="me-3">{formatDate(post.date)}</span>
                <Clock size={16} className="me-2" />
                <span>{post.readTime}</span>
              </div>

              <img
                src={post.image}
                alt={post.title}
                className="img-fluid rounded mb-4"
                style={{ maxHeight: "450px", objectFit: "cover", width: "100%" }}
              />

              <div
                className="blog-content"
                style={{ lineHeight: "1.8", fontSize: "1rem", color: "#34495e" }}
              >
                {post.content.split("\n").map((para, idx) => (
                  <p key={idx} className="mb-3">
                    {para.trim()}
                  </p>
                ))}
              </div>

              <div className="mt-5">
                <Link to="/blog" className="btn btn-primary-custom">
                  <ArrowLeft className="me-2" /> Quay lại Blog
                </Link>
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-5">
            <h4 className="fw-bold mb-4">Bài viết liên quan</h4>
            <Row>
              {relatedPosts.map((rp) => (
                <Col lg={4} md={6} className="mb-4" key={rp.id}>
                  <Card
                    className="h-100 shadow-sm"
                    style={{ borderRadius: "12px", overflow: "hidden" }}
                  >
                    <Card.Img
                      src={rp.image}
                      alt={rp.title}
                      style={{ height: "180px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <Badge bg="light" text="dark" className="mb-2">
                        {rp.category}
                      </Badge>
                      <Card.Title className="fw-bold" style={{ fontSize: "1rem" }}>
                        {rp.title}
                      </Card.Title>
                      <Card.Text className="text-muted" style={{ fontSize: "0.9rem" }}>
                        {rp.excerpt}
                      </Card.Text>
                      <Link to={`/blog/${rp.id}`} className="btn btn-sm btn-outline-primary">
                        Đọc tiếp
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
        )}
      </Container>
    </div>
  )
}

export default BlogDetail
