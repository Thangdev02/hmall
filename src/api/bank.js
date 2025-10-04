const BASE_URL = import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn";

// ============= BANK SETTINGS FUNCTIONS =============

// Thêm ngân hàng mới
export async function addBank(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/bank-settings/add-bank`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Xóa ngân hàng
export async function deleteBank(bankID, token) {
    const res = await fetch(`${BASE_URL}/api/v1/bank-settings/detele/${bankID}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.json();
}

// Chỉnh sửa thông tin ngân hàng
export async function editBank(bankID, data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/bank-settings/edit/${bankID}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Đặt ngân hàng làm mặc định
export async function setDefaultBank(bankID, token) {
    const res = await fetch(`${BASE_URL}/api/v1/bank-settings/set-use/${bankID}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.json();
}

// Lấy danh sách ngân hàng
export async function getBanks({ pageNumber = 1, pageSize = 10, search = "", filter = "" } = {}, token) {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);
    if (search) params.append("search", search);
    if (filter) params.append("filter", filter);

    const res = await fetch(`${BASE_URL}/api/v1/bank-settings/get-banks?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.json();
}