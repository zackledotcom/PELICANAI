import React from "react";

export const FileUploadPanel = ({ onUpload }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="upload-panel">
      <label htmlFor="file-upload" className="upload-label">
        Upload Media
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};
