import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  isLoading: false,
  selectedItems: [],
  checkoutItems: [],
  payingItems: [],
  buyNowItems: [],
  buyNowCartData: null,
};

export const fetchPreviewCartItems = createAsyncThunk(
  "cart/fetchPreviewCartItems",
  async ({ userId, items, voucherCode }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/cart/preview",
        { userId, items, voucherCode }
      );
      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/cart/add",
        {
          userId,
          productId,
          quantity,
          size,
          color,
        }
      );

      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async ({ userId, voucherCode, selectedItems }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/cart/get/${userId}`,
        {
          params: { voucherCode, selectedItems }
        }
      );

      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/shop/cart/${userId}/${productId}`,
        {
          params: { size, color },
        }
      );

      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/shop/cart/update-cart",
        {
          userId,
          productId,
          quantity,
          size,
          color,
        }
      );

      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.selectedItems = [];
    },
    toggleSelectItem: (state, action) => {
      const { id } = action.payload;
      if (!state.selectedItems) state.selectedItems = [];
      const index = state.selectedItems.indexOf(id);
      if (index === -1) {
        state.selectedItems.push(id);
      } else {
        state.selectedItems.splice(index, 1);
      }
    },
    selectAllItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
    // New reducers for Checkout snapshot
    setCheckoutItems: (state, action) => {
      state.checkoutItems = action.payload;
      state.payingItems = action.payload; // Initially all items chosen for checkout are checked for payment
    },
    toggleCheckoutSelectItem: (state, action) => {
      const { id } = action.payload;
      const index = (state.checkoutItems || []).indexOf(id);
      if (index > -1) {
        state.checkoutItems.splice(index, 1);
        // Also remove from paying items if present
        const pIndex = (state.payingItems || []).indexOf(id);
        if (pIndex > -1) state.payingItems.splice(pIndex, 1);
      }
    },
    togglePayingItem: (state, action) => {
      const { id } = action.payload;
      if (!state.payingItems) state.payingItems = [];
      const index = state.payingItems.indexOf(id);
      if (index === -1) {
        state.payingItems.push(id);
      } else {
        state.payingItems.splice(index, 1);
      }
    },
    selectAllPayingItems: (state, action) => {
      state.payingItems = action.payload;
    },
    clearCheckoutItems: (state) => {
      state.checkoutItems = [];
      state.payingItems = [];
    },
    setBuyNowItems: (state, action) => {
      state.buyNowItems = action.payload;
    },
    clearBuyNowItems: (state) => {
      state.buyNowItems = [];
      state.buyNowCartData = null;
    },
    updateBuyNowQuantity: (state, action) => {
      const { productId, size, color, quantity } = action.payload;
      if (!state.buyNowItems) return;
      const index = state.buyNowItems.findIndex(item => 
        item.productId === productId && item.size === size && item.color === color
      );
      if (index > -1) {
         state.buyNowItems[index].quantity = quantity;
      }
    },
    removeBuyNowItem: (state, action) => {
      const { productId, size, color } = action.payload;
      if (!state.buyNowItems) return;
      state.buyNowItems = state.buyNowItems.filter(item => 
        !(item.productId === productId && item.size === size && item.color === color)
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        // Don't clear cartItems on rejection
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
        // Don't clear cartItems on rejection
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
        // Don't clear cartItems on rejection
      })
      .addCase(fetchPreviewCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPreviewCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.buyNowCartData = action.payload.data;
      })
      .addCase(fetchPreviewCartItems.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { 
  clearCart, toggleSelectItem, selectAllItems, clearSelectedItems, 
  setCheckoutItems, toggleCheckoutSelectItem, clearCheckoutItems,
  togglePayingItem, selectAllPayingItems,
  setBuyNowItems, clearBuyNowItems, updateBuyNowQuantity, removeBuyNowItem
} = shoppingCartSlice.actions;

export default shoppingCartSlice.reducer;
