import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, createFolder, uploadImage, deleteFolder, deleteImage } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [newFolderName, setNewFolderName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [history, setHistory] = useState([]);
  const [openFolders, setOpenFolders] = useState(new Set());
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const parentId = selectedFolder ? selectedFolder.id : 'root';
      dispatch(createFolder({ parentId, name: newFolderName }));
      setNewFolderName('');
    }
  };

  const handleUploadImage = () => {
    if (newImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(uploadImage({ folderId: selectedFolder ? selectedFolder.id : 'root', imageFile: reader.result }));
        setNewImage(null);
      };
      reader.readAsDataURL(newImage);
    }
  };

  const handleFolderClick = (folderId) => {
    const findFolder = (folders) => {
      for (let folder of folders) {
        if (folder.id === folderId) return folder;
        if (folder.folders) {
          const found = findFolder(folder.folders);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedFolderObject = findFolder(currentUser.folders);
    if (selectedFolderObject) {
      setHistory([...history, selectedFolder]);
      setSelectedFolder(selectedFolderObject);
      setOpenFolders(new Set([...openFolders, folderId]));
    }
  };

  const handleBackClick = () => {
    const previousFolder = history.pop();
    setHistory([...history]);
    setSelectedFolder(previousFolder || null);
    if (history.length === 0) {
      setOpenFolders(new Set());
    } else {
      setOpenFolders(new Set([...openFolders].filter(id => id !== selectedFolder.id)));
    }
  };

  const handleDeleteFolder = (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      dispatch(deleteFolder(folderId));
      if (selectedFolder && selectedFolder.id === folderId) {
        setSelectedFolder(null);
        setHistory([]);
        setOpenFolders(new Set());
      }
    }
  };

  const handleDeleteImage = (imageUrl) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      let folderId = selectedFolder ? selectedFolder.id : 'root';
      dispatch(deleteImage({ folderId, imageUrl }));
    }
  };

  const renderFolders = (folders) => (
    <ul className="list-disc pl-4 space-y-2">
      {folders.map(folder => (
        <li key={folder.id} className="flex items-center space-x-2 px-10 py-2 border border-b rounded-md justify-between hover:bg-slate-100 ">
          <div className='flex '>
            <FolderIcon />
            <button
              onClick={() => handleFolderClick(folder.id)}
              className="text-lg ml-8 text-slate-600 font-medium hover:text-blue-800 transition-colors"
            >
              {folder.name}
            </button>
          </div>
          <div className='px-6 py-2 bg-red-600 rounded-md'>
            <button
              onClick={() => handleDeleteFolder(folder.id)}
              className="text-lg  text-white hover:text-red-800 transition-colors flex gap-2 items-center"
            >
              Delete <DeleteIcon />
            </button >
            
          </div>
          {folder.folders && folder.folders.length > 0 && openFolders.has(folder.id) && (
            <div className="ml-4">
              {renderFolders(folder.folders)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const getCurrentFolder = () => {
    if (!selectedFolder) {
      return { folders: currentUser.folders, images: currentUser.images };
    } else {
      const findFolder = (folders) => {
        for (let folder of folders) {
          if (folder.id === selectedFolder.id) return folder;
          if (folder.folders) {
            const found = findFolder(folder.folders);
            if (found) return found;
          }
        }
        return null;
      };
      return findFolder(currentUser.folders);
    }
  };

  const currentFolder = getCurrentFolder();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <nav className="bg-gray-800 p-4 text-white flex justify-between items-center shadow-md">
        <div className="text-lg font-semibold">
          Welcome, {currentUser?.name || 'User'}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
        >
          Logout
        </button>
      </nav>
      <div className="flex flex-1 flex-col p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="New Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg shadow-sm w-full sm:w-64"
            />
            <button
              onClick={handleCreateFolder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
            >
              Create Folder
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={(e) => setNewImage(e.target.files[0])}
              className="border border-gray-300 rounded-lg p-2 w-full sm:w-64"
            />
            <button
              onClick={handleUploadImage}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
            >
              Upload Image
            </button>
          </div>
        </div>
        {selectedFolder && (
          <button
            onClick={handleBackClick}
            className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg shadow transition-colors mb-4 w-1/12"
          >
            Back
          </button>
        )}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-2xl font-bold mb-4">Folders</h2>
          {currentFolder && renderFolders(currentFolder.folders)}
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <h2 className="text-2xl font-bold mb-4">Images</h2>
          {currentFolder && currentFolder.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-4 mb-2 border-b border-gray-200 pb-2">
              <img
                src={image}
                alt={`Uploaded ${index}`}
                className="border border-gray-300 rounded-lg"
                style={{ maxWidth: '200px' }}
              />
              <button
                onClick={() => handleDeleteImage(image)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



function FolderIcon (){
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#475569" className="size-6">
  <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
</svg>
}

function DeleteIcon(){
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
</svg>

}