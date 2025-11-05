import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

/**
 * User Type
 * กำหนดโครงสร้างข้อมูลผู้ใช้ที่เก็บใน Redux Store
 * - ข้อมูลพื้นฐาน: id, name, email
 * - ที่อยู่จัดส่ง: phone, address, district, city, province, postalCode
 * - ข้อมูลบัตร: cardName, cardLast4, cardExpiry
 */
type User = {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  district?: string
  city?: string
  province?: string
  postalCode?: string
  cardName?: string
  cardLast4?: string
  cardExpiry?: string
}

/**
 * AuthState Type
 * State ของ Authentication
 * - user: ข้อมูลผู้ใช้ (null = ยังไม่ได้ login)
 * - token: JWT token สำหรับ API calls
 * - status: สถานะการทำงาน (loading, idle, failed)
 * - error: ข้อความ error (ถ้ามี)
 */
type AuthState = {
  user: User | null
  token: string | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

/**
 * โหลดข้อมูล auth จาก localStorage
 * ใช้เมื่อ refresh page เพื่อ restore session
 */
const loadPersisted = (): Pick<AuthState, 'user' | 'token'> => {
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return { user: null, token: null }
    const parsed = JSON.parse(raw)
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
    }
  } catch {
    return { user: null, token: null }
  }
}

/**
 * บันทึกข้อมูล auth ลง localStorage
 * ทำให้ session คงอยู่แม้ปิด browser
 */
const persist = (data: Pick<AuthState, 'user' | 'token'>) => {
  try {
    localStorage.setItem('auth', JSON.stringify(data))
  } catch {
    // ignore persistence errors
  }
}

// โหลด user และ token จาก localStorage (ถ้ามี)
const { user: persistedUser, token: persistedToken } = loadPersisted()

/**
 * Initial State
 * เริ่มต้นด้วยข้อมูลจาก localStorage
 */
const initialState: AuthState = {
  user: persistedUser,
  token: persistedToken,
  status: 'idle',
  error: null,
}

/**
 * Login Async Thunk
 * เรียก API login และรับ user + token กลับมา
 * - pending: กำลังรอ response
 * - fulfilled: login สำเร็จ
 * - rejected: login ล้มเหลว (เก็บ error message)
 */
export const login = createAsyncThunk(
  'auth/login',
  async (
    args: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.login(args)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      )
    }
  }
)

/**
 * Register Async Thunk
 * เรียก API register และรับ user + token กลับมา (login ทันที)
 * - pending: กำลังรอ response
 * - fulfilled: register สำเร็จ
 * - rejected: register ล้มเหลว (เก็บ error message)
 */
export const register = createAsyncThunk(
  'auth/register',
  async (
    args: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.register(args)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

/**
 * Auth Slice
 * จัดการ state และ actions ของ Authentication
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Logout Action
     * ล้างข้อมูล user และ token ทั้งใน Redux และ localStorage
     */
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
      persist({ user: null, token: null })
    },
    /**
     * SetUser Action
     * อัพเดตข้อมูล user (ใช้หลัง update profile)
     */
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      persist({ user: state.user, token: state.token })
    },
    /**
     * ClearError Action
     * ล้าง error message (ใช้เมื่อ user ปิด error modal)
     */
    clearError(state) {
      state.error = null
      state.status = 'idle'
    },
  },
  /**
   * Extra Reducers
   * จัดการ async actions (login, register)
   */
  extraReducers: (builder) => {
    builder
      // Login Cases
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = 'idle'
        state.user = action.payload.user
        state.token = action.payload.token
        persist({ user: state.user, token: state.token })
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Login failed'
      })
      // Register Cases
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.status = 'idle'
          state.user = action.payload.user
          state.token = action.payload.token
          persist({ user: state.user, token: state.token })
        }
      )
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Registration failed'
      })
  },
})

export const { logout, setUser, clearError } = authSlice.actions

export default authSlice.reducer
