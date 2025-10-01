const BASE_URL = import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn";

// Tạo blog mới
export async function createBlog(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/blogs/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Chỉnh sửa blog
export async function editBlog(blogId, data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/blogs/edit/${blogId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Xóa blog
export async function deleteBlog(blogId, token) {
    const res = await fetch(`${BASE_URL}/api/v1/blogs/delete/${blogId}`, {
        method: 'DELETE',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}

// Lấy danh sách tất cả blogs
export async function getBlogs(params = {}) {
    const {
        pageNumber = 1,
        pageSize = 10,
        search = '',
        filter = ''
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('pageNumber', pageNumber.toString());
    queryParams.append('pageSize', pageSize.toString());
    
    if (search) queryParams.append('search', search);
    if (filter) queryParams.append('filter', filter);

    const res = await fetch(`${BASE_URL}/api/v1/blogs?${queryParams.toString()}`);
    return res.json();
}

// Lấy danh sách blogs theo tác giả
export async function getBlogsByAuthor(params = {}, token) {
    const {
        pageNumber = 1,
        pageSize = 10,
        search = '',
        filter = ''
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('pageNumber', pageNumber.toString());
    queryParams.append('pageSize', pageSize.toString());
    
    if (search) queryParams.append('search', search);
    if (filter) queryParams.append('filter', filter);

    const res = await fetch(`${BASE_URL}/api/v1/blogs/get-by-author?${queryParams.toString()}`, {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}

// Lấy chi tiết blog
export async function getBlogDetail(blogID) {
    const res = await fetch(`${BASE_URL}/api/v1/blogs/get-detail?blogID=${blogID}`);
    return res.json();
}

// ============= LIKE FUNCTIONS =============

// ...existing code...

// ============= LIKE FUNCTIONS =============

// Like/Dislike blog
export async function likeBlog(blogID, token) {
    const res = await fetch(`${BASE_URL}/api/v1/likes/like-dislike`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ blogID }),
    });
    return res.json();
}

// Check if user liked blog (you may need to add this endpoint to your API)
export async function checkLikeStatus(blogID, token) {
    try {
        const res = await fetch(`${BASE_URL}/api/v1/likes/check?blogID=${blogID}`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        return res.json();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        // If endpoint doesn't exist, return default
        return { statusCode: 404, isLiked: false };
    }
}

// ...existing code...

// ============= COMMENT FUNCTIONS =============

// Tạo comment cho blog
export async function createComment(commentData, token) {
    const res = await fetch(`${BASE_URL}/api/v1/comments/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(commentData),
    });
    return res.json();
}

// Lấy danh sách comments của blog
export async function getComments(params = {}) {
    const {
        blogId,
        pageNumber = 1,
        pageSize = 10,
        repliesPage = 1,
        repliesSize = 10
    } = params;

    const queryParams = new URLSearchParams();
    if (blogId) queryParams.append('blogId', blogId);
    queryParams.append('pageNumber', pageNumber.toString());
    queryParams.append('pageSize', pageSize.toString());
    queryParams.append('repliesPage', repliesPage.toString());
    queryParams.append('repliesSize', repliesSize.toString());

    const res = await fetch(`${BASE_URL}/api/v1/comments/get-comments?${queryParams.toString()}`);
    return res.json();
}

// Chỉnh sửa comment
export async function editComment(commentID, data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/comments/edit/${commentID}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Xóa comment
export async function deleteComment(commentID, token) {
    const res = await fetch(`${BASE_URL}/api/v1/comments/delete/${commentID}`, {
        method: 'DELETE',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return res.json();
}

// Tạo reply cho comment
export async function createReply(replyData, token) {
    const res = await fetch(`${BASE_URL}/api/v1/comments/replies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(replyData),
    });
    return res.json();
}
