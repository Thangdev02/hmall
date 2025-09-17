"use client"

import { motion } from "framer-motion"

const LoadingSpinner = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #e9ecef",
          borderTop: "3px solid #84B4C8",
          borderRadius: "50%",
        }}
      />
    </div>
  )
}

export default LoadingSpinner
