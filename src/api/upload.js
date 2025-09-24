const BASE_URL = import.meta.env.VITE_API_URL?.replace("/swagger/index.html", "") || "https://hmstoresapi.eposh.io.vn";

// Upload nhiều file
export async function uploadMultipleFiles({ files, customeFolder }, token) {
  const formData = new FormData();
  if (files && files.length > 0) {
    for (let file of files) {
      formData.append("Files", file);
    }
  }
  // Folder phải là "ImageProduc" theo yêu cầu
  formData.append("Folder", "ImageProduct");
  if (customeFolder) formData.append("CustomeFolder", customeFolder);

  const res = await fetch(`${BASE_URL}/api/v1/uploads/upload-multiple`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Không set Content-Type, để browser tự set multipart/form-data boundary
    },
    body: formData,
  });
  return res.json();
}
export async function uploadMultipleFilesUser({ files, customeFolder }, token) {
  const formData = new FormData();
  if (files && files.length > 0) {
    for (let file of files) {
      formData.append("Files", file);
    }
  }
  // Folder phải là "ImageUser" theo swagger
  formData.append("Folder", "ImageUser");
  if (customeFolder) formData.append("CustomeFolder", customeFolder);

  const res = await fetch(`${BASE_URL}/api/v1/uploads/upload-multiple`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Không set Content-Type, để browser tự set multipart/form-data boundary
    },
    body: formData,
  });
  return res.json();
}