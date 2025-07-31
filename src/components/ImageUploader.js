import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import "./ImageUploader.css";

export default function ImageUploader({ onUpload }) {
  const [mainFile, setMainFile] = useState(null);
  const [otherFiles, setOtherFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleMainFileChange = (e) => {
    setMainFile(e.target.files[0] || null);
  };

  const handleOtherFilesChange = (e) => {
    setOtherFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!mainFile && otherFiles.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const uploadedImages = [];
      let order = 0;

      const uploadImage = async (file) => {
        const imagePath = `images/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, imagePath);

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        await uploadBytes(fileRef, compressedFile);
        const downloadUrl = await getDownloadURL(fileRef);

        return { url: downloadUrl, path: imagePath, order: order++ };
      };

      if (mainFile) {
        const mainImage = await uploadImage(mainFile);
        uploadedImages.push(mainImage);
      }

      for (const file of otherFiles) {
        const image = await uploadImage(file);
        uploadedImages.push(image);
      }

      if (onUpload) onUpload(uploadedImages);
      setMainFile(null);
      setOtherFiles([]);
    } catch (err) {
      console.error("Fel vid uppladdningen:", err);
      setError("Något gick fel vid uppladdning.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <label>
        Huvudbild:
        <input type="file" accept="image/*" onChange={handleMainFileChange} />
      </label>

      <label>
        Övriga bilder:
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleOtherFilesChange}
        />
      </label>

      <button
        className="upload-img-btn"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Laddar upp..." : "Ladda upp bilder"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
