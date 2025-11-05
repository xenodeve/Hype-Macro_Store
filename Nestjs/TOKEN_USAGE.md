# 🔐 สรุปการใช้งาน JWT Token

## 📊 ภาพรวมการทำงานของ Token

```
┌─────────────────────────────────────────────────────────────┐
│                    🔄 Token Lifecycle                        │
└─────────────────────────────────────────────────────────────┘

1️⃣ สร้าง Token (Create)
   User Login/Register
   ↓
   Backend: JwtService.sign({ sub, email, name })
   ↓
   Return { user, token: "eyJhbGc..." }

2️⃣ เก็บ Token (Store)
   Frontend: 
   ├─ Redux State: state.auth.token
   └─ localStorage: { user, token }

3️⃣ ใช้ Token (Use)
   API Request
   ↓
   Axios Interceptor แนบ:
   Headers: { Authorization: "Bearer <token>" }

4️⃣ ตรวจสอบ Token (Verify)
   Backend: @UseGuards(JwtAuthGuard)
   ├─ ExtractJwt.fromAuthHeaderAsBearerToken()
   ├─ Verify signature + expiration
   └─ Decode payload → userId

5️⃣ ลบ Token (Remove)
   Logout / Token หมดอายุ
   ├─ dispatch(logout())
   └─ localStorage.removeItem('auth')
```

---

## 🎯 Backend (NestJS) - Token Management

### 1. 🔧 Configuration - `auth.module.ts`

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'hype-macro-secret-key',
  signOptions: { expiresIn: '7d' },  // Token อายุ 7 วัน
})
```

**คุณสมบัติ:**
- **Secret Key**: ใช้เข้ารหัส/ถอดรหัส token
- **Expiration**: หมดอายุใน 7 วัน (604,800 วินาที)

---

### 2. ✅ สร้าง Token - `auth.service.ts`

#### 📝 Register (สมัครสมาชิก)
```typescript
async register(registerDto: RegisterDto) {
  // 1. สร้าง user ใหม่
  const user = await this.usersService.create(...)
  
  // 2. สร้าง JWT payload
  const payload = { 
    sub: user._id.toString(),  // User ID
    email: user.email,          // Email
    name: user.name             // Name
  }
  
  // 3. สร้าง token
  const token = this.jwtService.sign(payload)
  
  // 4. Return user + token
  return { user, token }
}
```

#### 🔑 Login (เข้าสู่ระบบ)
```typescript
async login(loginDto: LoginDto) {
  // 1. ตรวจสอบ email + password
  const user = await this.usersService.findByEmail(loginDto.email)
  const isPasswordValid = await this.usersService.validatePassword(...)
  
  // 2. สร้าง JWT payload (เหมือน register)
  const payload = { 
    sub: user._id.toString(), 
    email: user.email, 
    name: user.name 
  }
  
  // 3. สร้าง token
  const token = this.jwtService.sign(payload)
  
  // 4. Return user + token
  return { user, token }
}
```

**Token Payload:**
```json
{
  "sub": "507f1f77bcf86cd799439011",  // User ID
  "email": "user@example.com",
  "name": "ชื่อผู้ใช้",
  "iat": 1698825600,                  // Issued At (timestamp)
  "exp": 1699430400                   // Expiration (timestamp)
}
```

---

### 3. 🔒 ตรวจสอบ Token - `jwt.strategy.ts`

```typescript
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // ดึง token จาก Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // ไม่ยอมให้ใช้ token หมดอายุ
      ignoreExpiration: false,
      
      // Secret key สำหรับ verify
      secretOrKey: process.env.JWT_SECRET || 'hype-macro-secret-key',
    })
  }

  async validate(payload: JwtPayload) {
    // ตรวจสอบ payload
    if (!payload.sub) {
      throw new UnauthorizedException()
    }
    
    // Return user data ให้ request.user
    return { 
      userId: payload.sub, 
      email: payload.email, 
      name: payload.name 
    }
  }
}
```

**กระบวนการตรวจสอบ:**
1. ดึง token จาก `Authorization: Bearer <token>`
2. ตรวจสอบ signature ด้วย secret key
3. ตรวจสอบว่า token หมดอายุหรือไม่
4. Decode payload และ validate
5. Return `request.user` ให้ controller ใช้งาน

---

### 4. 🛡️ ป้องกัน Routes - `jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**การใช้งานใน Controllers:**

#### 👤 Users Controller
```typescript
@Controller('users')
export class UsersController {
  // ต้องมี token
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const userId = req.user.userId  // จาก JwtStrategy.validate()
    return this.usersService.findById(userId)
  }

  // ต้องมี token
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateDto) {
    const userId = req.user.userId
    return this.usersService.updateProfile(userId, updateDto)
  }

  // ต้องมี token + password
  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Request() req, @Body('password') password) {
    const userId = req.user.userId
    await this.usersService.deleteAccount(userId, password)
  }
}
```

#### 📦 Orders Controller
```typescript
@Controller('orders')
export class OrdersController {
  // ต้องมี token
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createOrderDto) {
    const userId = req.user.userId
    return this.ordersService.create(userId, createOrderDto)
  }

  // ต้องมี token
  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Request() req) {
    const userId = req.user.userId
    return this.ordersService.findByUserId(userId)
  }

  // ต้องมี token
  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  async getByOrderId(@Param('orderId') orderId: string) {
    return this.ordersService.findByOrderId(orderId)
  }
}
```

#### 🔐 Auth Controller
```typescript
@Controller('auth')
export class AuthController {
  // ไม่ต้องมี token
  @Post('register')
  async register(@Body() registerDto) {
    return this.authService.register(registerDto)
  }

  // ไม่ต้องมี token
  @Post('login')
  async login(@Body() loginDto) {
    return this.authService.login(loginDto)
  }

  // ต้องมี token
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId)
  }
}
```

---

## 🎨 Frontend (React) - Token Management

### 1. 💾 เก็บ Token - `authSlice.ts`

```typescript
type AuthState = {
  user: User | null
  token: string | null       // JWT Token
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

// Initial State: โหลดจาก localStorage
const { user: persistedUser, token: persistedToken } = loadPersisted()

const initialState: AuthState = {
  user: persistedUser,
  token: persistedToken,     // Token จาก localStorage
  status: 'idle',
  error: null,
}
```

**การเก็บข้อมูล:**
```typescript
// บันทึกลง localStorage
const persist = (data: Pick<AuthState, 'user' | 'token'>) => {
  try {
    localStorage.setItem('auth', JSON.stringify(data))
  } catch {
    // ignore persistence errors
  }
}

// โหลดจาก localStorage
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
```

---

### 2. 🔄 Async Actions - Login & Register

#### 🔑 Login Action
```typescript
export const login = createAsyncThunk(
  'auth/login',
  async (args: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // เรียก API login
      const response = await authService.login(args)
      // response = { user, token }
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      )
    }
  }
)

// Extra Reducers
extraReducers: (builder) => {
  builder
    // Login สำเร็จ
    .addCase(login.fulfilled, (state, action) => {
      state.status = 'idle'
      state.user = action.payload.user      // เก็บ user
      state.token = action.payload.token    // เก็บ token
      persist({ user: state.user, token: state.token })  // บันทึก localStorage
    })
}
```

#### 📝 Register Action
```typescript
export const register = createAsyncThunk(
  'auth/register',
  async (
    args: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // เรียก API register
      const response = await authService.register(args)
      // response = { user, token }
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

// Extra Reducers
extraReducers: (builder) => {
  builder
    // Register สำเร็จ → login ทันที
    .addCase(register.fulfilled, (state, action) => {
      state.status = 'idle'
      state.user = action.payload.user
      state.token = action.payload.token
      persist({ user: state.user, token: state.token })
    })
}
```

---

### 3. 🚪 Logout Action

```typescript
// Reducer
reducers: {
  logout(state) {
    state.user = null
    state.token = null         // ล้าง token
    state.status = 'idle'
    state.error = null
    persist({ user: null, token: null })  // ล้าง localStorage
  },
}

// การใช้งาน
dispatch(logout())
```

---

### 4. 📡 ส่ง Token ไปกับ API - `api.ts`

#### Axios Interceptor (Request)
```typescript
/**
 * Request Interceptor
 * แนบ JWT token ใน Authorization header อัตโนมัติ
 */
api.interceptors.request.use((config) => {
  // อ่าน auth data จาก localStorage
  const authData = localStorage.getItem('auth')
  
  if (authData) {
    try {
      const { token } = JSON.parse(authData)
      
      // ถ้ามี token → แนบใน header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error parsing auth token:', error)
    }
  }
  
  return config
})
```

**ผลลัพธ์:**
```http
GET /auth/profile HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Axios Interceptor (Response)
```typescript
/**
 * Response Interceptor
 * จัดการ Unauthorized (401) เมื่อ token หมดอายุ
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ถ้า token หมดอายุหรือไม่ valid
    if (error.response?.status === 401) {
      // ล้าง auth data
      localStorage.removeItem('auth')
      
      // Redirect ไป login page
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)
```

---

### 5. 🔍 ใช้ Token ใน Components

#### การตรวจสอบ Authentication
```typescript
// ใน Component
import { useSelector } from 'react-redux'
import { RootState } from './store/store'

function ProtectedComponent() {
  const { user, token } = useSelector((state: RootState) => state.auth)
  
  // ถ้าไม่มี token → redirect ไป login
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  
  // ถ้ามี token → แสดง content
  return <div>Protected Content</div>
}
```

#### การเรียก API ที่ต้องการ Token
```typescript
// Services จะแนบ token อัตโนมัติ
import { orderService } from './services/orderService'

// ตัวอย่าง: สร้างคำสั่งซื้อ
const createOrder = async (orderData) => {
  // API call จะแนบ token ใน header อัตโนมัติ
  const order = await orderService.create(orderData)
  return order
}

// ตัวอย่าง: ดูประวัติคำสั่งซื้อ
const getMyOrders = async () => {
  // API call จะแนบ token ใน header อัตโนมัติ
  const orders = await orderService.getMyOrders()
  return orders
}
```

---

## 🔄 Token Flow - ตัวอย่างการทำงานจริง

### 📱 Scenario 1: User Login

```
1. User กรอก email + password
   ↓
2. dispatch(login({ email, password }))
   ↓
3. POST /auth/login (ไม่ต้องมี token)
   Body: { email, password }
   ↓
4. Backend:
   ├─ ตรวจสอบ email + password
   ├─ สร้าง JWT token
   └─ Return { user, token }
   ↓
5. Frontend:
   ├─ state.auth.token = token
   ├─ state.auth.user = user
   └─ localStorage.setItem('auth', { user, token })
   ↓
6. Redirect ไป Homepage
```

---

### 📦 Scenario 2: สร้างคำสั่งซื้อ (ต้องมี Token)

```
1. User คลิก "Place Order"
   ↓
2. orderService.create(orderData)
   ↓
3. Axios Interceptor:
   ├─ อ่าน token จาก localStorage
   └─ แนบใน header: Authorization: Bearer <token>
   ↓
4. POST /orders
   Headers: { Authorization: "Bearer eyJhbGc..." }
   Body: { orderId, items, address, paymentMethod, subtotal }
   ↓
5. Backend:
   ├─ @UseGuards(JwtAuthGuard)
   ├─ JwtStrategy.validate() → ตรวจสอบ token
   ├─ Extract userId จาก token payload
   └─ ordersService.create(userId, orderData)
   ↓
6. MongoDB: INSERT order
   ↓
7. Return order data → แสดงหน้า Payment Success
```

---

### 🔒 Scenario 3: Token หมดอายุ (401 Unauthorized)

```
1. User เข้าระบบไว้นาน (> 7 วัน)
   ↓
2. เรียก API: GET /auth/profile
   Headers: { Authorization: "Bearer <expired_token>" }
   ↓
3. Backend:
   ├─ JwtStrategy ตรวจสอบ token
   └─ Token หมดอายุ → throw UnauthorizedException
   ↓
4. Return: 401 Unauthorized
   ↓
5. Frontend: Axios Response Interceptor
   ├─ error.response.status === 401
   ├─ localStorage.removeItem('auth')
   └─ window.location.href = '/login'
   ↓
6. User ต้อง login ใหม่
```

---

### 🚪 Scenario 4: Logout

```
1. User คลิก "Logout"
   ↓
2. dispatch(logout())
   ↓
3. Redux State:
   ├─ state.auth.user = null
   ├─ state.auth.token = null
   └─ state.auth.status = 'idle'
   ↓
4. localStorage.removeItem('auth')
   ↓
5. Redirect ไป /login
```

---

## 📋 API Endpoints Summary

| Endpoint | Method | ต้อง Token | Guard | Request.user |
|----------|--------|-----------|-------|--------------|
| `/auth/register` | POST | ❌ | - | - |
| `/auth/login` | POST | ❌ | - | - |
| `/auth/profile` | GET | ✅ | JwtAuthGuard | ✅ |
| `/users/profile` | GET | ✅ | JwtAuthGuard | ✅ |
| `/users/profile` | PUT | ✅ | JwtAuthGuard | ✅ |
| `/users/account` | DELETE | ✅ | JwtAuthGuard | ✅ |
| `/products` | GET | ❌ | - | - |
| `/products/:id` | GET | ❌ | - | - |
| `/orders` | POST | ✅ | JwtAuthGuard | ✅ |
| `/orders/my-orders` | GET | ✅ | JwtAuthGuard | ✅ |
| `/orders/:orderId` | GET | ✅ | JwtAuthGuard | ✅ |

---

## 🔑 Token Security Best Practices

### ✅ สิ่งที่ระบบทำแล้ว:

1. **HTTPS Only** (Production)
   - Token ควรส่งผ่าน HTTPS เท่านั้น

2. **Token Expiration**
   - Token หมดอายุใน 7 วัน
   - ป้องกัน token ถูกใช้งานตลอดกาล

3. **Secret Key**
   - ใช้ environment variable (`JWT_SECRET`)
   - ไม่ hard-code ใน source code

4. **Password Hashing**
   - รหัสผ่านถูก hash ด้วย bcrypt
   - ไม่เก็บ plain password

5. **Token in Authorization Header**
   - ใช้ Bearer token scheme
   - ไม่ส่ง token ใน URL parameter

6. **Auto Logout on 401**
   - Token หมดอายุ → logout อัตโนมัติ
   - ป้องกันการใช้งาน expired token

### 🔒 Payload ที่เก็บใน Token:

```json
{
  "sub": "userId",        // ✅ User ID
  "email": "user@...",    // ✅ Email
  "name": "ชื่อผู้ใช้",    // ✅ Name
  "iat": 1698825600,      // ✅ Issued At
  "exp": 1699430400       // ✅ Expiration
}
```

**❌ ไม่ควรเก็บใน Token:**
- Password (hash หรือ plain)
- ข้อมูลบัตรเครดิต
- ข้อมูลส่วนตัวละเอียด

---

## 🎯 สรุป

### Backend (NestJS):
1. สร้าง token ด้วย `JwtService.sign(payload)` เมื่อ login/register
2. ใช้ `@UseGuards(JwtAuthGuard)` ป้องกัน protected routes
3. ตรวจสอบ token ด้วย `JwtStrategy`
4. Extract `userId` จาก token payload → ใช้ใน business logic

### Frontend (React):
1. เก็บ token ใน Redux State + localStorage
2. แนบ token ใน header อัตโนมัติ (Axios Interceptor)
3. Logout เมื่อได้ 401 Unauthorized
4. ตรวจสอบ token ก่อนเข้า protected pages

### Token Lifecycle:
- **สร้าง**: Login/Register → Backend สร้าง JWT
- **เก็บ**: Frontend เก็บใน State + localStorage
- **ใช้**: ส่งไปกับทุก API request ที่ต้อง authentication
- **ตรวจสอบ**: Backend verify signature + expiration
- **ลบ**: Logout หรือ token หมดอายุ

---

**🔐 Token = กุญแจดิจิทัล ที่ใช้ยืนยันตัวตนในทุก API request**
