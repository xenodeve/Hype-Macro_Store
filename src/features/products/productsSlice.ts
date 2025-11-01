import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { productService, type Product } from '../../services/productService'
import type { RootState } from '../../store/store'

type ProductsState = {
  items: Product[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const products = await productService.getAll()
      return products
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      )
    }
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'idle'
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Failed to load products'
      })
  },
})

export const selectProducts = (state: RootState) => state.products.items
export const selectProductsStatus = (state: RootState) => state.products.status

export default productsSlice.reducer
