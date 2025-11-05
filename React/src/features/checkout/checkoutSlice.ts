import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type Address = {
  id: string
  fullName: string
  phone: string
  address1: string
  address2?: string
  province: string
  district: string
  postcode: string
}

export type PaymentMethod = 'card' | 'qr'

type CheckoutState = {
  shippingAddress: Address | null
  savedAddresses: Address[]
  paymentMethod: PaymentMethod | null
}

const STORAGE_KEY = 'checkout'

const load = (): CheckoutState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { shippingAddress: null, savedAddresses: [], paymentMethod: null }
}

const save = (state: CheckoutState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

const initialState: CheckoutState = load()

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setShippingAddress(state, action: PayloadAction<Address>) {
      state.shippingAddress = action.payload
      // Save to savedAddresses if new
      const exists = state.savedAddresses.find((a) => a.id === action.payload.id)
      if (!exists) state.savedAddresses.push(action.payload)
      save(state)
    },
    addSavedAddress(state, action: PayloadAction<Address>) {
      state.savedAddresses.push(action.payload)
      save(state)
    },
    setPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      state.paymentMethod = action.payload
      save(state)
    },
    clearCheckout(state) {
      state.shippingAddress = null
      state.paymentMethod = null
      save(state)
    },
  },
})

export const { setShippingAddress, addSavedAddress, setPaymentMethod, clearCheckout } = checkoutSlice.actions

export default checkoutSlice.reducer
