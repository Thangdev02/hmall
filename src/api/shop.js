const BASE_URL = import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn";

// Đăng ký shop mới
export async function registerShop(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/shops/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Sửa thông tin shop
export async function editShopInfo(shopId, data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/shops/edit-shop-info/${shopId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Lấy danh sách shop
export async function getShops({ pageNumber = 1, pageSize = 10, search = "", filter = "", IsActive = true } = {}, token) {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);
    if (search) params.append("search", search);
    if (filter) params.append("filter", filter);
    if (IsActive !== undefined) params.append("IsActive", IsActive);

    const res = await fetch(`${BASE_URL}/api/v1/shops/get-shops?${params.toString()}`, {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}

// Xóa shop
export async function deleteShop(shopId, token) {
    const res = await fetch(`${BASE_URL}/api/v1/shops/delete-shop/${shopId}`, {
        method: "DELETE",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}

// Lấy chi tiết shop theo id
export async function getShopDetail(shopId, token) {
    const params = new URLSearchParams();
    if (shopId) params.append("shopId", shopId);

    const res = await fetch(`${BASE_URL}/api/v1/shops/get-shop-detail?${params.toString()}`, {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}

// Lấy shop theo owner (user hiện tại)
export async function getShopByOwner(token) {
    const res = await fetch(`${BASE_URL}/api/v1/shops/get-shop-by-owner`, {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}