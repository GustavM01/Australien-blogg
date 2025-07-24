import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export default function ImageUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const imagePath = `images/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, imagePath);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      await uploadBytes(fileRef, compressedFile);
      const downloadUrl = await getDownloadURL(fileRef);

      console.log("Bild-URL:", downloadUrl);
      console.log("Image path:", imagePath);

      if (onUpload) onUpload({ url: downloadUrl, path: imagePath });

      alert("Uppladningen lyckades!");
      setFile(null);
    } catch (err) {
      console.error("Fel vid uppladdningen: " + err);
      setError("Något gick fel vid uppladdning.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? "Laddar upp..." : "Ladda upp bild"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
