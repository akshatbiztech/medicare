const uploadImageToCloudinary = async file => {
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", "");
  uploadData.append("cloud_name", "");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dghvnm1jv/image/upload",
    {
      method: "post",
      body: uploadData,
    }
  );

  const data = await res.json();
  return data;
};

export default uploadImageToCloudinary;
