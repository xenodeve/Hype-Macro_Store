import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

/**
 * CartItem Type
 * โครงสร้างสินค้าในตะกร้า
 * - id: Product ID (unique)
 * - name: ชื่อสินค้า
 * - price: ราคาต่อชิ้น
 * - image: URL รูปภาพ
 * - qty: จำนวนชิ้น
 */
export type CartItem = {
  id: string
  name: string
  price: number
  image?: string
  qty: number
}

/**
 * CartState Type
 * State ของตะกร้าสินค้า
 * - items: array ของสินค้าทั้งหมดในตะกร้า
 */
type CartState = {
  items: CartItem[]
}

const STORAGE_KEY = 'cart'

/**
 * โหลดข้อมูลตะกร้าจาก localStorage
 * ใช้เมื่อ refresh page เพื่อ restore cart
 */
const load = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

/**
 * บันทึกข้อมูลตะกร้าลง localStorage
 * ทำให้ cart คงอยู่แม้ปิด browser
 */
const save = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

// โหลด cart จาก localStorage (ถ้ามี)
const initialState: CartState = {
  items: load(),
}

/**
 * Cart Slice
 * จัดการ state และ actions ของตะกร้าสินค้า
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * addItem Action
     * เพิ่มสินค้าเข้าตะกร้า
     * - ถ้ามีอยู่แล้ว -> เพิ่ม qty
     * - ถ้ายังไม่มี -> สร้างใหม่
     */
    addItem: (state, action: PayloadAction<Omit<CartItem, 'qty'> & { qty?: number }>) => {
      const { id, name, price, image, qty = 1 } = action.payload
      const existing = state.items.find((it) => it.id === id)
      if (existing) {
        existing.qty += qty
      } else {
        state.items.push({ id, name, price, image, qty })
      }
      save(state.items)
    },
    /**
     * removeItem Action
     * ลบสินค้าออกจากตะกร้า (ทั้งหมด)
     */
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((it) => it.id !== action.payload)
      save(state.items)
    },
    /**
     * updateQty Action
     * อัพเดตจำนวนสินค้า (ขั้นต่ำ = 1)
     */
    updateQty: (state, action: PayloadAction<{ id: string; qty: number }>) => {
      const it = state.items.find((i) => i.id === action.payload.id)
      if (it) {
        it.qty = Math.max(1, action.payload.qty)
        save(state.items)
      }
    },
    /**
     * clearCart Action
     * ล้างตะกร้าทั้งหมด (ใช้หลังชำระเงินสำเร็จ)
     */
    clearCart: (state) => {
      state.items = []
      save(state.items)
    },
  },
})

export const { addItem, removeItem, updateQty, clearCart } = cartSlice.actions

/**
 * Selectors
 * ฟังก์ชันดึงข้อมูลจาก cart state
 */
export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartCount = (state: { cart: CartState }) => state.cart.items.reduce((a, b) => a + b.qty, 0)
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, it) => sum + it.price * it.qty, 0)

export default cartSlice.reducer
