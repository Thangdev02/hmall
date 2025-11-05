"use client"

import { Container, Row, Col, Card } from "react-bootstrap"
import { motion } from "framer-motion"
import { Heart, Award, People, Lightbulb } from "react-bootstrap-icons"

const AboutUs = () => {
    const teamMembers = [
        {
            name: "Hoàng Nguyễn Hoài Vi",
            role: "Founder & Leader",
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww",
            description: "Với kinh nghiệm trong lĩnh vực handmade, Vi là người sáng lập và dẫn dắt đội ngũ.",
        },
        {
            name: "Nguyễn Lệ Hân",
            role: "Member",
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww",
            description: "Chuyên gia về đồ gỗ thủ công với kỹ thuật truyền thống được truyền từ đời này sang đời khác.",
        },
        {
            name: "Dương Hồ Kiều Oanh",
            role: "Member",
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww",
            description: "Nghệ nhân dệt may tài năng, chuyên tạo ra những sản phẩm vải độc đáo và tinh xảo.",
        },
        {
            name: "Trần Minh Bảo",
            role: "Member",
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww",

        },
        {
            name: "Nguyễn Lê Hữu Huy",
            role: "Member",
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww",

        },
        {
            name: "Nguyễn Trọng Tín",
            role: "Member",
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww",
        }
    ]

    const values = [
        {
            icon: Heart,
            title: "Tình Yêu Thủ Công",
            description: "Chúng tôi đặt tình yêu và sự tận tâm vào từng sản phẩm, tạo ra những món đồ mang giá trị cảm xúc.",
        },
        {
            icon: Award,
            title: "Chất Lượng Cao",
            description: "Cam kết sử dụng nguyên liệu tốt nhất và áp dụng quy trình sản xuất nghiêm ngặt.",
        },
        {
            icon: People,
            title: "Cộng Đồng",
            description: "Xây dựng cộng đồng những người yêu thích handmade và hỗ trợ các nghệ nhân địa phương.",
        },
        {
            icon: Lightbulb,
            title: "Sáng Tạo",
            description: "Không ngừng đổi mới và sáng tạo để mang đến những sản phẩm độc đáo và ý nghĩa.",
        },
    ]

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <Container>
                {/* Page Header */}
                <section className="banner-section about-banner">
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
                                        Về Chúng Tôi
                                    </h1>
                                    <p className="lead text-light">
                                        Câu chuyện về hành trình tạo ra những sản phẩm handmade đầy ý nghĩa
                                    </p>
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                </section>


                {/* Our Story Section */}
                <Row className="mb-5 align-items-center">
                    <Col lg={6}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="fw-bold mb-4" style={{ color: "#2c3e50" }}>
                                Câu Chuyện Của Chúng Tôi
                            </h2>
                            <p className="text-muted mb-4" style={{ lineHeight: "1.8" }}>
                                Được thành lập vào năm 2025, HMall ra đời với mong muốn gìn giữ và phát triển các làng nghề thủ công truyền thống Việt Nam. Chúng tôi tin rằng, mỗi sản phẩm thủ công không chỉ là một món đồ, mà còn là kết tinh của tâm huyết, sự sáng tạo và bản sắc văn hóa dân tộc.
                            </p>
                            <p className="text-muted mb-4" style={{ lineHeight: "1.8" }}>
                                Với sứ mệnh mang đến những sản phẩm chất lượng, độc đáo và đầy ý nghĩa, HMall không chỉ kết nối người làm và người dùng, mà còn góp phần lan tỏa những giá trị bền vững của nghề thủ công Việt Nam đến gần hơn với cuộc sống hiện đại.
                            </p>

                        </motion.div>
                    </Col>
                    <Col lg={6}>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <img
                                src="/images/br2.jpg"
                                alt="Our Workshop"
                                className="img-fluid rounded-3"
                                style={{ boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}
                            />
                        </motion.div>
                    </Col>
                </Row>

                {/* Values Section */}
                <section className="mb-5" style={{ backgroundColor: "#f8f9fa", margin: "0 -15px", padding: "80px 15px" }}>
                    <Container>
                        <Row className="text-center mb-5">
                            <Col>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                        Giá Trị Cốt Lõi
                                    </h2>
                                    <p className="lead text-muted">Những nguyên tắc định hướng mọi hoạt động của chúng tôi</p>
                                </motion.div>
                            </Col>
                        </Row>

                        <Row>
                            {values.map((value, index) => (
                                <Col lg={3} md={6} className="mb-4" key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="text-center h-100"
                                    >
                                        <Card className="h-100" style={{ border: "none", backgroundColor: "white" }}>
                                            <Card.Body className="p-4">
                                                <div
                                                    className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                                                    style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        backgroundColor: index % 2 === 0 ? "#B2D9EA" : "#84B4C8",
                                                        margin: "0 auto 12px", // center the circle horizontally
                                                    }}
                                                >
                                                    <value.icon size={32} color="white" style={{ display: "block", lineHeight: 0 }} />
                                                </div>
                                                <h5 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                                    {value.title}
                                                </h5>
                                                <p className="text-muted" style={{ lineHeight: "1.6" }}>
                                                    {value.description}
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>

                {/* Team Section */}
                {/* Team Section */}
                <Row className="mb-5">
                    <Col>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-5"
                        >
                            <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                Đội Ngũ Của Chúng Tôi
                            </h2>
                            <p className="lead text-muted">Những nghệ nhân tài năng đứng sau mỗi sản phẩm</p>
                        </motion.div>
                    </Col>
                </Row>

                <div className="team-slider d-flex justify-content-center flex-wrap">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            className="team-card text-center mx-3 mb-4"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="team-img-wrapper">
                                <img src={member.image} alt={member.name} className="team-img" />
                            </div>
                            <h5 className="fw-bold mt-3">{member.name}</h5>
                            <p className="text-primary fw-semibold">{member.role}</p>

                        </motion.div>
                    ))}
                </div>


                {/* Statistics Section */}

            </Container>
        </div>
    )
}

export default AboutUs
