const BASE_URL = "https://hmstoresapi.eposh.io.vn";

// Tạo đơn hàng
export async function createOrder(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/orders/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    return await res.json();
}

// ...existing code...

// Lấy danh sách đơn hàng của user
export async function getOrdersByUser({ pageNumber = 1, pageSize = 10, filter = "" }, token) {
    const params = new URLSearchParams({
        pageNumber,
        pageSize,
    });
    if (filter) params.append("filter", filter);

    const res = await fetch(`${BASE_URL}/api/v1/orders/get-by-user?${params.toString()}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return await res.json();
}

// Lấy chi tiết đơn hàng
export async function getOrderDetails(orderId, pageNumber = 1, pageSize = 9999, token) {
    const params = new URLSearchParams({
        orderId,
        pageNumber,
        pageSize,
    });

    const res = await fetch(`${BASE_URL}/api/v1/orders/get-details?${params.toString()}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return await res.json();
}

// Lấy danh sách đơn hàng của shop
export async function getOrdersByShop({ pageNumber = 1, pageSize = 999, filter = "" }, token) {
    const params = new URLSearchParams({
        pageNumber,
        pageSize,
    });
    if (filter) params.append("filter", filter);

    const res = await fetch(`${BASE_URL}/api/v1/orders/get-by-shop?${params.toString()}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return await res.json();
}