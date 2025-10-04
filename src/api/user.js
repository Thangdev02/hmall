const BASE_URL = import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn";

// ...existing code...

// Lấy danh sách users
export async function getUsers({ pageNumber = 1, pageSize = 10, search = "", filter = "" } = {}, token) {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);
    if (search) params.append("search", search);
    if (filter) params.append("filter", filter);

    const res = await fetch(`${BASE_URL}/api/v1/users?${params.toString()}`, {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}

// Block/Unblock user
export async function blockUnblockUser(userID, token) {
    const res = await fetch(`${BASE_URL}/api/v1/users/block-unblock/${userID}`, {
        method: "PATCH",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}

// Block/Unblock shop
export async function blockUnblockShop(shopID, token) {
    const res = await fetch(`${BASE_URL}/api/v1/shops/block-unblock-shop/${shopID}`, {
        method: "PATCH",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}