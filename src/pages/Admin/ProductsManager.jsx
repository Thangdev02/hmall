import { useEffect, useState } from "react";
import { Table, Alert, Spinner, Badge, Image } from "react-bootstrap";
import { getProducts } from "../../api/product";
import PaginationSection from "../../components/Admin/PaginationSection";

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const totalItems = products.length;

  // Gọi API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({ pageNumber: 1, pageSize: 1000 });
      setProducts(res?.data?.items || []);
    } catch (err) {
      setError("Không thể tải sản phẩm");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cắt sản phẩm theo trang
  const paginatedProducts = products.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="mb-4">Quản lý sản phẩm</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>ID</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Chất liệu</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? paginatedProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Image
                      src={p.commonImage}
                      alt={p.name}
                      width="50"
                      height="50"
                      rounded
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/50x50?text=IMG";
                      }}
                    />
                  </td>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price?.toLocaleString("vi-VN")}đ</td>
                  <td>{p.category}</td>
                  <td>{p.material}</td>
                  <td>{p.stock}</td>
                  <td>
                    <Badge bg={p.isActive ? "success" : "danger"}>
                      {p.isActive ? "Hoạt động" : "Ngừng bán"}
                    </Badge>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    Không có dữ liệu sản phẩm
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Phân trang */}
          <PaginationSection
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => setPageNumber(newPage)}
          />
        </>
      )}
    </div>
  );
};

export default ProductsManager;