import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/cart/cartSlice'
import checkoutReducer from '../features/checkout/checkoutSlice'
import productsReducer from '../features/products/productsSlice'

/**
 * Redux Store Configuration
 * รวม reducers ทั้งหมดของ application:
 * - auth: จัดการ login, register, user profile
 * - cart: จัดการตะกร้าสินค้า (add, remove, update qty)
 * - checkout: จัดการข้อมูล shipping address และ payment method
 * - products: จัดการรายการสินค้า (fetch from API)
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    products: productsReducer,
  },
})

/**
 * RootState Type
 * Type ของ state ทั้งหมดใน Redux Store
 * ใช้ใน useSelector hooks
 */
export type RootState = ReturnType<typeof store.getState>

/**
 * AppDispatch Type
 * Type ของ dispatch function
 * ใช้ใน useDispatch hooks สำหรับ async actions
 */
export type AppDispatch = typeof store.dispatch
