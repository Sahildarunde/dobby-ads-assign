import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';

const inMemoryDb = {
  users: [
    {
      name: 'User',
      email: 'user@example.com',
      password: 'password',
      folders: [],
      images: [],
    },
  ],
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {

    const user = inMemoryDb.users.find((user) => user.email === email && user.password === password);
    if (user) {
      return user;
    } else {
      throw new Error('Invalid email or password');
    }
  }
);

const findFolderById = (folders, folderId) => {
  for (const folder of folders) {
    if (folder.id === folderId) return folder;
    if (folder.folders) {
      const found = findFolderById(folder.folders, folderId);
      if (found) return found;
    }
  }
  console.log("nahi mila null")
  return null;
};

const addFolderToParent = (folders, parentId, newFolder) => {
  return folders.map(folder => {
    if (folder.id === parentId) {
      return {
        ...folder,
        folders: [newFolder, ...folder.folders], 
      };
    } else if (folder.folders) {
      return {
        ...folder,
        folders: addFolderToParent(folder.folders, parentId, newFolder),
      };
    }
    return folder;
  });
};


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: null,
    error: null,
  },
  reducers: {
    signup: (state, action) => {
      const { name, email, password } = action.payload;
      if (inMemoryDb.users.find((user) => user.email === email)) {
        state.error = 'Email already in use';
      } else {
        const newUser = { name, email, password, folders: [], images: [] };
        inMemoryDb.users.push(newUser);
        state.currentUser = newUser;
        
        state.error = null;
      }
    },
    login: (state, action) => {
      const { email, password } = action.payload;
      const user = inMemoryDb.users.find((user) => user.email === email && user.password === password);
      if (user) {
        state.currentUser = user;
        state.error = null;
      } else {
        state.error = 'Invalid email or password';
      }
    },
    logout: (state) => {
      
    },

  

    createFolder(state, action) {
      const { parentId, name } = action.payload;
      const newFolder = {
        id: Date.now().toString(),
        name,
        folders: [],
        images: [],
      };
      if (parentId === 'root') {
        state.currentUser.folders.unshift(newFolder); 
        console.log("added in parent")
      } else {
        console.log(state.currentUser.name);
        const parentFolder = findFolderById(state.currentUser.folders, parentId);
        if (parentFolder) {
          parentFolder.folders.unshift(newFolder); 
          console.log(parentFolder.name)
          console.log(newFolder);
        }
      }
    },
    uploadImage(state, action) {
      const { folderId, imageFile } = action.payload;
      const folder = findFolderById(state.currentUser.folders, folderId);
      if (folder) {
        folder.images.unshift(imageFile); 
      } else {
        state.currentUser.images.unshift(imageFile); 
      }
    },

    deleteImage(state, action) {
      const { folderId, imageUrl } = action.payload;
    
      console.log('Folder ID:', folderId);
      console.log('Image URL:', imageUrl);
    
      
      const removeImageByUrl = (folders, folderId, imageUrl) => {
        for (let folder of folders) {
          if (folder.id === folderId) {
            folder.images = folder.images.filter(image => image !== imageUrl);
            return true; 
          }
          if (folder.folders) {
            const found = removeImageByUrl(folder.folders, folderId, imageUrl);
            if (found) return true; 
          }
        }
        return false;
      };
    
      
      const removedFromFolder = removeImageByUrl(state.currentUser.folders, folderId, imageUrl);
    
      
      if (!removedFromFolder) {
        state.currentUser.images = state.currentUser.images.filter(image => image !== imageUrl);
      }
    },    

    deleteFolder(state, action) {
      const deleteFolderRecursively = (folders, folderId) => {
        return folders.filter(folder => {
          if (folder.id === folderId) return false;
          folder.folders = deleteFolderRecursively(folder.folders, folderId);
          return true;
        });
      };
      state.currentUser.folders = deleteFolderRecursively(state.currentUser.folders, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { signup,  logout, createFolder, deleteFolder, uploadImage, deleteImage } = authSlice.actions;
export default authSlice.reducer;
