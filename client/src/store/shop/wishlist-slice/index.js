import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  wishlist: [],
  isLoading: false,
};

export const addToWishlist = createAsyncThunk(
  "/wishlist/addToWishlist",
  async ({ userId, productId }) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/shop/wishlist/add`,
      {
        userId,
        productId,
      }
    );
    return response.data;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "/wishlist/removeFromWishlist",
  async ({ userId, productId }) => {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/shop/wishlist/remove`,
      {
        data: { userId, productId },
      }
    );
    return response.data;
  }
);

export const fetchWishlist = createAsyncThunk(
  "/wishlist/fetchWishlist",
  async (userId) => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shop/wishlist/get/${userId}`
    );
    return response.data;
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optionally update state if needed
      })
      .addCase(addToWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optionally update state if needed
      })
      .addCase(removeFromWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload.data;
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.isLoading = false;
        state.wishlist = [];
      });
  },
});

export default wishlistSlice.reducer;