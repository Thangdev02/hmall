const BASE_URL = import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn";

/** Normalize items: ensure numeric stock, boolean isInStock, availability text, and boolean isActive */
function normalizeItems(items = []) {
    return items.map(item => {
        const stock = Number(item.stock) || 0;
        return {
            ...item,
            stock,
            isInStock: stock > 0,
            availability: stock > 0 ? "Còn hàng" : "Hết hàng",
            isActive: Boolean(item.isActive),
        };
    });
}

// Lấy danh sách sản phẩm (public/general)
// default isActive = true to "get only active" unless caller overrides
export async function getProducts({ pageNumber = 1, pageSize = 20, search = "", filter = "", isActive = true, ShopID } = {}, token) {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);
    if (search) params.append("search", search);
    if (filter) params.append("filter", filter);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (ShopID) params.append("ShopID", ShopID);

    const url = `${BASE_URL}/api/v1/products/get-products?${params.toString()}`;

    try {
        const res = await fetch(url, {
            headers: {
                accept: '*/*',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const json = await res.json();

        if (json?.data?.items && Array.isArray(json.data.items)) {
            json.data.items = normalizeItems(json.data.items);
        }

        return json;
    } catch (err) {
        console.error("getProducts error:", err);
        return { statusCode: 500, message: "Network error", data: null };
    }
}

// Legacy / alternate: lấy theo shop bằng endpoint get-products (kept for compatibility)
export async function getProductsByShopID({ pageNumber = 1, pageSize = 20, search = "", filter = "", isActive = true, ShopID } = {}, token) {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);
    if (search) params.append("search", search);
    if (filter) params.append("filter", filter);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (ShopID) params.append("ShopID", ShopID);

    const url = `${BASE_URL}/api/v1/products/get-products?${params.toString()}`;

    try {
        const res = await fetch(url, {
            headers: {
                accept: '*/*',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const json = await res.json();
        if (json?.data?.items && Array.isArray(json.data.items)) {
            json.data.items = normalizeItems(json.data.items);
        }
        return json;
    } catch (err) {
        console.error("getProductsByShopID error:", err);
        return { statusCode: 500, message: "Network error", data: null };
    }
}

// Lấy danh sách sản phẩm theo shop (đúng endpoint)
export async function getProductsByShop({ pageNumber = 1, pageSize = 10, search = "", filter = "", isActive = true, ShopID } = {}, token) {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);
    if (search) params.append("search", search);
    if (filter) params.append("filter", filter);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (ShopID) params.append("ShopID", ShopID);

    const url = `${BASE_URL}/api/v1/products/get-products-by-shop?${params.toString()}`;

    try {
        const res = await fetch(url, {
            headers: {
                accept: '*/*',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const json = await res.json();
        if (json?.data?.items && Array.isArray(json.data.items)) {
            json.data.items = normalizeItems(json.data.items);
        }
        return json;
    } catch (err) {
        console.error("getProductsByShop error:", err);
        return { statusCode: 500, message: "Network error", data: null };
    }
}

export async function getProductDetail(productId) {
    const params = new URLSearchParams();
    params.append("productId", productId);

    try {
        const res = await fetch(`${BASE_URL}/api/v1/products/get-detail?${params.toString()}`);
        return await res.json();
    } catch (err) {
        console.error("getProductDetail error:", err);
        return { statusCode: 500, message: "Network error", data: null };
    }
}

// Tạo sản phẩm mới
export async function createProduct(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/products/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Cập nhật sản phẩm
export async function updateProduct(productId, data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/products/update/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Xóa sản phẩm
export async function deleteProduct(productId, token) {
    const res = await fetch(`${BASE_URL}/api/v1/products/delete/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.json();
}

// ============= FAVORITE FUNCTIONS =============

// Favorite/Disfavorite sản phẩm
export async function favoriteProduct(productID, token) {
    const res = await fetch(`${BASE_URL}/api/v1/products/favorite-disfavorite`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productID }),
    });
    return res.json();
}

// Lấy danh sách sản phẩm yêu thích
export async function getFavoriteProducts({ pageNumber = 1, pageSize = 10 } = {}, token) {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);

    const url = `${BASE_URL}/api/v1/products/get-favorite-product?${params.toString()}`;
    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.json();
    } catch (err) {
        console.error("getFavoriteProducts error:", err);
        return { statusCode: 500, message: "Network error", data: null };
    }
}

// ============= PRODUCT FEEDBACK FUNCTIONS =============

// Tạo feedback cho sản phẩm
export async function createProductFeedback(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/product-feedbacks/feedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Chỉnh sửa feedback
export async function editProductFeedback(feedbackID, data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/product-feedbacks/edit/${feedbackID}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Lấy danh sách feedback của sản phẩm
export async function getProductFeedbacks({ productID, pageNumber = 1, pageSize = 10, ratingFilter = 0 } = {}) {
    const params = new URLSearchParams();
    if (productID) params.append("productID", productID);
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);
    params.append("ratingFilter", ratingFilter);

    try {
        const res = await fetch(`${BASE_URL}/api/v1/product-feedbacks/get-feedbacks?${params.toString()}`);
        return res.json();
    } catch (err) {
        console.error("getProductFeedbacks error:", err);
        return { statusCode: 500, message: "Network error", data: null };
    }
}

export async function deleteFeedback(feedbackID, token) {
    try {
        const res = await fetch(`${BASE_URL}/api/v1/product-feedbacks/delete/${feedbackID}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return await res.json();
    } catch (err) {
        console.error("deleteFeedback error:", err);
        return { statusCode: 500, message: "Network error", data: null };
    }
}