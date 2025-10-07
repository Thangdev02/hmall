import React from "react";
import { Link, useNavigate } from "react-router-dom";

const styles = {
    navbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#84B4C8",
        padding: "16px 40px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },
    logo: {
        color: "#fff",
        fontSize: "1.5rem",
        fontWeight: "bold",
        textDecoration: "none",
        letterSpacing: "2px",
    },
    links: {
        display: "flex",
        gap: "28px",
        listStyle: "none",
        margin: 0,
        padding: 0,
    },
    link: {
        color: "#fff",
        fontSize: "1.05rem",
        textDecoration: "none",
        fontWeight: 500,
        transition: "color 0.2s",
    },
    logoutBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        marginLeft: "18px",
        display: "flex",
        alignItems: "center",
        color: "#fff",
        fontSize: "1.1rem",
    },
    logoutIcon: {
        width: "22px",
        height: "22px",
        marginLeft: "4px",
        verticalAlign: "middle",
    },
};

const ShopNavBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear(); // Xóa tất cả, bao gồm token và role
        navigate("/login");
    };

    return (
        <nav style={styles.navbar}>
            <div>
                <Link to="/shop/dashboard" style={styles.logo}>Shop HMall</Link>
            </div>
            <ul style={styles.links}>

                <li><Link to="/shop/orders" style={styles.link}>Đơn hàng</Link></li>
                <li><Link to="/shop/products" style={styles.link}>Sản phẩm</Link></li>
                <li><Link to="/shop/profile" style={styles.link}>Tài khoản</Link></li>
                <li><Link to="/shop/blog" style={styles.link}>Blog</Link></li>

            </ul>
            <button style={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">
                Đăng xuất
                <svg style={styles.logoutIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                    />
                </svg>
            </button>
        </nav>
    );
};

export default ShopNavBar;