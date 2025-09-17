import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

// Import components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop"
import PageTransition from "./components/PageTransition"

// Import pages
import Home from "./pages/Home"
import Products from "./pages/Products"
import Contact from "./pages/Contact"
import AboutUs from "./pages/AboutUs"
import Blog from "./pages/Blog"
import ProductDetail from "./pages/ProductDetail"
import BlogDetail from "./pages/BlogDetail"

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />
            <Route
              path="/products"
              element={
                <PageTransition>
                  <Products />
                </PageTransition>
              }
            />
            <Route path="/products/:id" element={<ProductDetail />} />

            <Route
              path="/contact"
              element={
                <PageTransition>
                  <Contact />
                </PageTransition>
              }
            />
            <Route
              path="/about"
              element={
                <PageTransition>
                  <AboutUs />
                </PageTransition>
              }
            />
            <Route
              path="/blog"
              element={
                <PageTransition>
                  <Blog />
                </PageTransition>
              }
            />
          <Route path="/blog/:id" element={<BlogDetail />} />

          </Routes>

        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  )
}

export default App
