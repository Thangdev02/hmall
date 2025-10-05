/* eslint-disable no-undef */
import { useParams, Link, useNavigate } from "react-router-dom"
import { Container, Row, Col, Button, Badge, Card, Form, Modal, Toast, ToastContainer } from "react-bootstrap"
import { motion } from "framer-motion"
import { Star, Heart, HeartFill, ChatText } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import { getProductDetail, favoriteProduct } from "../../api/product"
import { addItemToCart } from "../../api/cart"
import { createFastOrder, createQRPayment } from "../../api/oder"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import LoadingSpinner from "../../components/LoadingSpinner"
import ProductFeedback from "../../components/ProductFeedback/ProductFeedback"
import "./ProductDetail.css"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedImage, setSelectedImage] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [cartQuantity, setCartQuantity] = useState(1)

  // State cho feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  // State cho modal mua ngay
  const [showBuyNowModal, setShowBuyNowModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrUrl, setQrUrl] = useState("")
  const [buyNowForm, setBuyNowForm] = useState({
    receiverName: "",
    deliveryAddress: "",
    receiverPhone: "",
    paymentMethod: "Direct",
    note: ""
  })
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  const token = localStorage.getItem("token")

  // Utility functions cho localStorage với error handling tốt hơn
  const FAVORITES_KEY = 'userFavorites'

  const getFavoriteStatus = (productId) => {
    if (!token || !productId) return false
    try {
      const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
      const userFavorites = allFavorites[token] || {}
      return Boolean(userFavorites[productId])
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error)
      return false
    }
  }

  const setFavoriteStatus = (productId, status) => {
    if (!token || !productId) return
    try {
      // Lấy tất cả favorites
      const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')

      // Đảm bảo có object cho user hiện tại
      if (!allFavorites[token]) {
        allFavorites[token] = {}
      }

      // Cập nhật trạng thái
      if (status) {
        allFavorites[token][productId] = true
      } else {
        delete allFavorites[token][productId]
      }

      // Lưu lại
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites))
      console.log('Saved favorite status:', { productId, status, userFavorites: allFavorites[token] })
    } catch (error) {
      console.error('Error saving favorite status to localStorage:', error)
    }
  }

  // Load trạng thái yêu thích ngay khi component mount
  useEffect(() => {
    if (id && token) {
      const savedStatus = getFavoriteStatus(id)
      console.log('Loaded favorite status from localStorage:', { productId: id, status: savedStatus })
      setIsLiked(savedStatus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token])

  useEffect(() => {
    setLoading(true)
    setErrorMessage(null)

    getProductDetail(id)
      .then(res => {
        if (res?.statusCode === 404) {
          throw new Error("Product not found")
        }
        const p = res?.data
        setProduct(p)

        // Kiểm tra trạng thái từ localStorage trước
        const localFavoriteStatus = getFavoriteStatus(id)
        console.log('Product loaded:', {
          productId: id,
          apiFavorite: p?.isFavorite,
          localFavorite: localFavoriteStatus
        })

        // Ưu tiên localStorage nếu có, không thì dùng API
        const finalStatus = localFavoriteStatus !== false ? localFavoriteStatus : (p?.isFavorite || false)
        setIsLiked(finalStatus)

        // Sync với localStorage (đảm bảo consistency)
        setFavoriteStatus(id, finalStatus)

        const allImages = [
          p?.commonImage && (p.commonImage.startsWith("http") ? p.commonImage : `${import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn"}/${p.commonImage}`),
          ...(p?.moreImages?.map(img => img.url.startsWith("http") ? img.url : `${import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn"}/${img.url}`) || [])
        ].filter(Boolean)
        setSelectedImage(allImages[0] || "")
        setProduct(prev => ({ ...prev, allImages }))
      })
      .catch(error => {
        if (error.response?.status === 404 || error.message === "Product not found") {
          setErrorMessage("Sản phẩm đã hết hàng, vui lòng tham khảo sản phẩm khác")
        } else {
          setErrorMessage("Có lỗi xảy ra khi tải sản phẩm")
        }
        setProduct(null)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Debug localStorage khi component mount
  useEffect(() => {
    if (token) {
      try {
        const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
        console.log('All favorites in localStorage:', allFavorites)
        console.log('Current user favorites:', allFavorites[token])
      } catch (error) {
        console.error('Error reading localStorage:', error)
      }
    }
  }, [token])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!product || errorMessage) {
    return (
      <Container style={{ paddingTop: "120px", minHeight: "100vh" }} className="error-section">
        <h2 className="text-center">{errorMessage || "Sản phẩm không tồn tại"}</h2>
        <p className="text-center">Khám phá thêm các sản phẩm thủ công độc đáo khác của chúng tôi!</p>
        <div className="text-center mt-3">
          <Link to="/products">
            <Button variant="primary" className="btn-primary-custom">Quay lại cửa hàng</Button>
          </Link>
        </div>
      </Container>
    )
  }

  // Xử lý yêu thích sản phẩm
  const handleLikeToggle = async () => {
    if (!token) {
      setToastMessage("Vui lòng đăng nhập để yêu thích sản phẩm!")
      setShowToast(true)
      return
    }

    setFavoriteLoading(true)

    // Lưu trạng thái cũ để rollback nếu API thất bại
    const oldStatus = isLiked
    const newStatus = !isLiked

    console.log('Toggling favorite:', { productId: product.id, oldStatus, newStatus })

    // Cập nhật UI và localStorage ngay lập tức (optimistic update)
    setIsLiked(newStatus)
    setFavoriteStatus(product.id, newStatus)

    try {
      const response = await favoriteProduct(product.id, token)
      console.log('API response:', response)

      if (response?.statusCode === 200) {
        // API thành công, giữ nguyên trạng thái đã cập nhật
        setToastMessage(
          newStatus
            ? "Đã thêm vào danh sách yêu thích!"
            : "Đã bỏ khỏi danh sách yêu thích!"
        )
        setShowToast(true)
        console.log('Favorite updated successfully')
      } else {
        // API thất bại, rollback trạng thái
        console.log('API failed, rolling back')
        setIsLiked(oldStatus)
        setFavoriteStatus(product.id, oldStatus)
        setToastMessage(response?.message || "Có lỗi xảy ra!")
        setShowToast(true)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      // API thất bại, rollback trạng thái
      setIsLiked(oldStatus)
      setFavoriteStatus(product.id, oldStatus)
      setToastMessage("Có lỗi xảy ra khi cập nhật yêu thích!")
      setShowToast(true)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product.isActive) {
      setToastMessage("Sản phẩm đã hết hàng!")
      setShowToast(true)
      return
    }

    if (cartQuantity > product.stock) {
      setToastMessage(`Chỉ còn ${product.stock} sản phẩm trong kho!`)
      setShowToast(true)
      return
    }

    if (!token) {
      setToastMessage("Vui lòng đăng nhập để thêm vào giỏ hàng!")
      setShowToast(true)
      return
    }

    try {
      const res = await addItemToCart({ productId: product.id, quantity: cartQuantity }, token)
      if (res && res.statusCode === 200) {
        setToastMessage(`Đã thêm ${cartQuantity} sản phẩm vào giỏ hàng!`)
        setShowToast(true)
        setCartQuantity(1)
        setTimeout(() => {
          navigate('/cart')
        }, 1000)
      } else {
        setToastMessage(res.message || "Thêm vào giỏ hàng thất bại!")
        setShowToast(true)
      }
    } catch {
      setToastMessage("Thêm vào giỏ hàng thất bại!")
      setShowToast(true)
    }
  }

  // Xử lý mở modal mua ngay
  const handleBuyNow = () => {
    if (!product.isActive) {
      setToastMessage("Sản phẩm đã hết hàng!")
      setShowToast(true)
      return
    }

    if (cartQuantity > product.stock) {
      setToastMessage(`Chỉ còn ${product.stock} sản phẩm trong kho!`)
      setShowToast(true)
      return
    }

    if (!token) {
      setToastMessage("Vui lòng đăng nhập để mua hàng!")
      setShowToast(true)
      return
    }

    setBuyNowForm({
      receiverName: "",
      deliveryAddress: "",
      receiverPhone: "",
      paymentMethod: "Direct",
      note: ""
    })
    setShowBuyNowModal(true)
  }

  // Xử lý thay đổi form mua ngay
  const handleBuyNowFormChange = (e) => {
    const { name, value } = e.target
    setBuyNowForm(prev => ({ ...prev, [name]: value }))
  }

  // Xử lý submit mua ngay
  const handleBuyNowSubmit = async () => {
    const { receiverName, deliveryAddress, receiverPhone, paymentMethod, note } = buyNowForm

    if (!receiverName || !deliveryAddress || !receiverPhone) {
      setToastMessage("Vui lòng điền đầy đủ thông tin!")
      setShowToast(true)
      return
    }

    setIsSubmittingOrder(true)

    try {
      const orderData = {
        receiverName,
        deliveryAddress,
        receiverPhone,
        paymentMethod,
        productID: product.id,
        quantity: cartQuantity,
        note
      }

      console.log("Creating fast order with data:", orderData)
      const orderRes = await createFastOrder(orderData, token)
      console.log("Fast order response:", orderRes)

      if (orderRes && orderRes.statusCode === 200) {
        // Lấy orderID trực tiếp từ data (là string UUID)
        const orderID = orderRes.data
        console.log("Extracted orderID:", orderID)

        if (!orderID) {
          console.error("OrderID not found in response:", orderRes)
          setToastMessage("Không thể lấy ID đơn hàng!")
          setShowToast(true)
          return
        }

        if (paymentMethod === "OnlineBanking") {
          // Delay để đảm bảo order đã được lưu vào database
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Tạo QR payment với orderID
          try {
            const qrData = {
              orderID: orderID // orderID là string UUID
            }

            console.log("QR Data being sent:", qrData)
            const qrRes = await createQRPayment(qrData, token)
            console.log("QR Response:", qrRes)

            if (qrRes && qrRes.statusCode === 200) {
              setQrUrl(qrRes.data.qrUrl)
              setShowBuyNowModal(false)
              setShowQRModal(true)
            } else {
              setToastMessage(`Lỗi tạo QR: ${qrRes.message || "Không thể tạo mã QR"}`)
              setShowToast(true)
            }
          } catch (error) {
            console.error("QR creation error:", error)
            setToastMessage("Lỗi khi tạo mã QR thanh toán!")
            setShowToast(true)
          }
        } else {
          // Thanh toán trực tiếp
          setToastMessage("Đặt hàng thành công!")
          setShowToast(true)
          setShowBuyNowModal(false)
          setCartQuantity(1)
        }
      } else {
        setToastMessage(orderRes.message || "Đặt hàng thất bại!")
        setShowToast(true)
      }
    } catch (error) {
      console.error("Order creation error:", error)
      setToastMessage("Đặt hàng thất bại!")
      setShowToast(true)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  // Xử lý khi hoàn thành thanh toán QR
  const handleQRPaymentComplete = async () => {
    setShowQRModal(false)
    setToastMessage("Đặt hàng và thanh toán thành công!")
    setShowToast(true)
    setCartQuantity(1)

    // Chuyển đến trang đơn hàng sau 2 giây
    setTimeout(() => {
      navigate('/orders')
    }, 2000)
  }

  return (
    <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
      {/* Banner */}
      <section className="banner-section product-banner">
        <div className="banner-overlay"></div>
        <Container className="h-100">
          <Row className="h-100 align-items-center justify-content-center text-center">
            <Col>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="display-4 fw-bold mb-3 text-white">
                  {product?.name || "Chi Tiết Sản Phẩm"}
                </h1>
                <p className="lead text-light">
                  Khám phá chi tiết sản phẩm handmade
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container>
        {/* Chi tiết sản phẩm */}
        <Row className="mb-5">
          {/* Hình ảnh */}
          <Col lg={6} className="mb-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <img src={selectedImage} alt={product.name} className="main-product-img" />
            </motion.div>
            <div className="d-flex gap-3 mt-3 flex-wrap">
              {(product.allImages || []).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  className={`thumb-img ${selectedImage === img ? "active" : ""}`}
                  style={{ width: 80, height: 80, objectFit: "cover", cursor: "pointer", border: selectedImage === img ? "2px solid #84B4C8" : "1px solid #eee" }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </Col>

          {/* Thông tin */}
          <Col lg={6}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="fw-bold mb-3">{product.name}</h2>
              <div className="d-flex align-items-center mb-3">
                <Star fill="#ffc107" color="#ffc107" size={20} />
                <span className="ms-2 fw-bold">{product.rating || 5}</span>
                <Badge
                  bg={product.isActive ? "success" : "danger"}
                  className="ms-3"
                  style={{ fontSize: "0.9rem" }}
                >
                  {product.isActive ? "Còn hàng" : "Hết hàng"}
                </Badge>
              </div>
              <h3 className="fw-bold mb-4 text-primary">{product.price?.toLocaleString("vi-VN")}đ</h3>
              <div className="text-muted mb-2" dangerouslySetInnerHTML={{ __html: product.description }} />
              <ul className="text-muted">
                <li>Chất liệu: {product.material}</li>
                <li>Danh mục: {product.category}</li>
                <li>Còn lại: {product.stock} sản phẩm</li>
              </ul>

              {/* Quantity Control */}
              <div className="quantity-control mb-4">
                <span className="me-3 fw-bold">Số lượng:</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setCartQuantity(prev => Math.max(1, prev - 1))}
                  disabled={cartQuantity <= 1 || !product.isActive}
                  className="quantity-btn"
                >
                  −
                </Button>
                <Form.Control
                  type="number"
                  min={1}
                  max={product.stock || 100}
                  value={cartQuantity}
                  onChange={e => setCartQuantity(Math.max(1, Math.min(Number(e.target.value), product.stock || 100)))}
                  className="quantity-input"
                  aria-label="Số lượng sản phẩm"
                  disabled={!product.isActive}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setCartQuantity(prev => Math.min(prev + 1, product.stock || 100))}
                  disabled={cartQuantity >= (product.stock || 100) || !product.isActive}
                  className="quantity-btn"
                >
                  +
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3 mt-4 align-items-center flex-wrap">
                <Button
                  size="lg"
                  className="btn-primary-custom"
                  disabled={!product.isActive}
                  onClick={handleBuyNow}
                >
                  Mua Ngay
                </Button>
                <Button size="lg" variant="outline-secondary" onClick={handleAddToCart} disabled={!product.isActive}>
                  Thêm Vào Giỏ
                </Button>
                <Button
                  variant="light"
                  className="rounded-circle shadow-sm"
                  style={{ width: "50px", height: "50px" }}
                  onClick={handleLikeToggle}
                  disabled={favoriteLoading}
                  title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
                >
                  {favoriteLoading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : isLiked ? (
                    <HeartFill size={20} color="#ff0000" />
                  ) : (
                    <Heart size={20} color="gray" />
                  )}
                </Button>
              </div>


              // eslint-disable-next-line no-undef
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-3 p-2 bg-light small">
                  <strong>Debug:</strong> isLiked: {isLiked.toString()}, productId: {product.id}
                </div>
              )}

              {/* Button đánh giá */}
              <div className="mt-3">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-100"
                >
                  <ChatText className="me-2" size={16} />
                  Xem đánh giá sản phẩm
                </Button>
              </div>
            </motion.div>
          </Col>
        </Row>

        <ToastContainer position="top-end" className="p-3">
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg={toastMessage.includes("thất bại") || toastMessage.includes("đăng nhập") || toastMessage.includes("hết hàng") || toastMessage.includes("Lỗi") || toastMessage.includes("lỗi") ? "danger" : "success"}
          >
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>

      {/* Modal đánh giá sản phẩm */}
      <ProductFeedback
        productID={product?.id}
        show={showFeedbackModal}
        onHide={() => setShowFeedbackModal(false)}
      />

      {/* Modal mua ngay */}
      <Modal show={showBuyNowModal} onHide={() => setShowBuyNowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thông tin đặt hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Thông tin sản phẩm */}
          <div className="mb-4 p-3 border rounded bg-light">
            <div className="d-flex align-items-center">
              <img
                src={selectedImage}
                alt={product.name}
                style={{ width: 60, height: 60, objectFit: "cover" }}
                className="rounded me-3"
              />
              <div>
                <h6 className="mb-1">{product.name}</h6>
                <p className="mb-1 text-muted">Số lượng: {cartQuantity}</p>
                <p className="mb-0 fw-bold text-primary">
                  Tổng tiền: {(product.price * cartQuantity).toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>
          </div>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên người nhận *</Form.Label>
              <Form.Control
                type="text"
                name="receiverName"
                value={buyNowForm.receiverName}
                onChange={handleBuyNowFormChange}
                placeholder="Nhập tên người nhận"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ giao hàng *</Form.Label>
              <Form.Control
                type="text"
                name="deliveryAddress"
                value={buyNowForm.deliveryAddress}
                onChange={handleBuyNowFormChange}
                placeholder="Nhập địa chỉ giao hàng"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại *</Form.Label>
              <Form.Control
                type="text"
                name="receiverPhone"
                value={buyNowForm.receiverPhone}
                onChange={handleBuyNowFormChange}
                placeholder="Nhập số điện thoại"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phương thức thanh toán</Form.Label>
              <Form.Select
                name="paymentMethod"
                value={buyNowForm.paymentMethod}
                onChange={handleBuyNowFormChange}
              >
                <option value="Direct">Thanh toán khi nhận hàng</option>
                <option value="OnlineBanking">Thanh toán online</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="note"
                value={buyNowForm.note}
                onChange={handleBuyNowFormChange}
                placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBuyNowModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleBuyNowSubmit}
            disabled={isSubmittingOrder}
          >
            {isSubmittingOrder ? "Đang xử lý..." : "Đặt hàng"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal QR Payment cho mua ngay */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thanh toán QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-3">
            <h5>Quét mã QR để thanh toán</h5>
            <p>Số tiền: <strong>{(product.price * cartQuantity).toLocaleString("vi-VN")}đ</strong></p>
          </div>
          {qrUrl && (
            <div className="mb-3">
              <img
                src={qrUrl}
                alt="QR Payment Code"
                style={{ maxWidth: "100%", height: "auto", border: "1px solid #ddd", borderRadius: "8px" }}
              />
            </div>
          )}
          <div className="text-muted">
            <small>Sau khi thanh toán thành công, vui lòng nhấn "Hoàn thành"</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQRModal(false)}>
            Hủy
          </Button>
          <Button variant="success" onClick={handleQRPaymentComplete}>
            Hoàn thành
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ProductDetail