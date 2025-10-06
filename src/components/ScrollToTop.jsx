"use client"

import { useState, useEffect } from "react"
import { Button } from "react-bootstrap"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "react-bootstrap-icons"

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 1000,
          }}
        >
          <Button
            onClick={scrollToTop}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#B8D6E0", // 💠 màu nhạt hơn #84B4C8
              border: "none",
              boxShadow: "0 4px 12px rgba(132, 180, 200, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
            className="scroll-to-top-btn"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A0C6D4")} // hover nhạt hơn chút
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#B8D6E0")}
          >
            <ArrowUp size={102} color="#ffffff" /> {/* 🔼 icon to và sáng hơn */}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTop
