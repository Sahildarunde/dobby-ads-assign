import React, { useState } from 'react';

const Modal = ({ onClose }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [folderStructure, setFolderStructure] = useState([]);

  const handleCreateFolder = () => {
    setFolderStructure([
      ...folderStructure,
      { name: folderName, children: [] }
    ]);
    setFolderName('');
  };

  const handleImageUpload = () => {
    if (selectedImage) {
      console.log("Image uploaded:", selectedImage);
    }
    setSelectedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create Folder / Upload Image</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <button
            onClick={handleCreateFolder}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            Create Folder
          </button>
        </div>
        <div className="mb-4">
          <input
            type="file"
            onChange={(e) => setSelectedImage(e.target.files[0])}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <button
            onClick={handleImageUpload}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            Upload Image
          </button>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
