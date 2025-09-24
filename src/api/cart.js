const BASE_URL = import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn";

// Thêm sản phẩm vào giỏ hàng
export async function addItemToCart({ productId, quantity }, token) {
  const res = await fetch(`${BASE_URL}/api/v1/carts/add-item`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ productId, quantity }),
  });
  return res.json();
}

// Xóa sản phẩm khỏi giỏ hàng
export async function deleteCartItem(cartItemId, token) {
  const res = await fetch(`${BASE_URL}/api/v1/carts/delete-item/${cartItemId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return res.json();
}

// Sửa số lượng sản phẩm trong giỏ hàng
export async function editCartItemQuantity({ cartItemID, quantity }, token) {
  const res = await fetch(`${BASE_URL}/api/v1/carts/edit-item-quantity`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ cartItemID, quantity }),
  });
  return res.json();
}

// Lấy danh sách sản phẩm trong giỏ hàng (có phân trang)
export async function getCartItems({ pageNumber = 1, pageSize = 10 } = {}, token) {
  const params = new URLSearchParams();
  params.append("pageNumber", pageNumber);
  params.append("pageSize", pageSize);

  const res = await fetch(`${BASE_URL}/api/v1/carts/get-items?${params.toString()}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return res.json();
}