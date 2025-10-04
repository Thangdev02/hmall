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
export async function getOrdersByShop({ pageNumber = 1, pageSize = "", filter = "" }, token) {
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

// Tạo QR payment cho đơn hàng
export async function createQRPayment(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/orders/create-qr-payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    return await res.json();
}

// Cập nhật trạng thái đơn hàng
export async function editOrderStatus(orderID, status, token) {
    const formData = new FormData();
    formData.append("status", status);

    const res = await fetch(`${BASE_URL}/api/v1/orders/edit-order-status/${orderID}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return await res.json();
}
// Tạo đơn hàng nhanh (fast order)
export async function createFastOrder(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/orders/fast-order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    return await res.json();
}
// Hủy đơn hàng
export async function cancelOrder(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/orders/cancel-order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    return await res.json();
}
