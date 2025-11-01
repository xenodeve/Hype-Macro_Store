import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks'
import { useNavigate } from 'react-router-dom'
import { setUser, logout } from '../features/auth/authSlice'
import { userService } from '../services/userService'
import ThemeToggleButton from './ThemeToggleButton'

const Profile = () => {
  const { user, token } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    district: user?.district || '',
    city: user?.city || '',
    province: user?.province || '',
    postalCode: user?.postalCode || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        district: user.district || '',
        city: user.city || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Check if any data has changed
    const nameChanged = formData.name !== user?.name
    const emailChanged = formData.email !== user?.email
    const phoneChanged = formData.phone !== (user?.phone || '')
    const addressChanged = formData.address !== (user?.address || '')
    const districtChanged = formData.district !== (user?.district || '')
    const cityChanged = formData.city !== (user?.city || '')
    const provinceChanged = formData.province !== (user?.province || '')
    const postalCodeChanged = formData.postalCode !== (user?.postalCode || '')
    const passwordChanging = formData.newPassword || formData.confirmPassword || formData.currentPassword

    if (!nameChanged && !emailChanged && !phoneChanged && !addressChanged && 
        !districtChanged && !cityChanged && !provinceChanged && !postalCodeChanged && !passwordChanging) {
      setMessage({ type: 'error', text: 'ไม่มีการเปลี่ยนแปลงข้อมูล' })
      return
    }

    // Validate password fields if changing password
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'กรุณาใส่รหัสผ่านปัจจุบัน' })
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' })
        return
      }
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' })
        return
      }
    }

    setLoading(true)

    try {
      // Build update payload (only send changed fields)
      const updateData: any = {}

      if (nameChanged) {
        updateData.name = formData.name
      }

      if (emailChanged) {
        updateData.email = formData.email
      }

      // Add address fields if changed
      if (phoneChanged) {
        updateData.phone = formData.phone
      }
      if (addressChanged) {
        updateData.address = formData.address
      }
      if (districtChanged) {
        updateData.district = formData.district
      }
      if (cityChanged) {
        updateData.city = formData.city
      }
      if (provinceChanged) {
        updateData.province = formData.province
      }
      if (postalCodeChanged) {
        updateData.postalCode = formData.postalCode
      }

      // Add password fields if changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      // Call API to update profile
      const updatedUser = await userService.updateProfile(updateData)

      // Update user in Redux store
      dispatch(
        setUser({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          district: updatedUser.district,
          city: updatedUser.city,
          province: updatedUser.province,
          postalCode: updatedUser.postalCode,
        })
      )

      setMessage({ type: 'success', text: 'อัปเดตข้อมูลสำเร็จ!' })
      setIsEditing(false)
      
      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (error: any) {
      console.error('Profile update error:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setMessage(null)
    // Reset form to current user data
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        district: user.district || '',
        city: user.city || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('กรุณาใส่รหัสผ่านเพื่อยืนยันการลบบัญชี')
      return
    }

    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return
    }

    setIsDeleting(true)
    try {
      await userService.deleteAccount(deletePassword)
      alert('ลบบัญชีสำเร็จ')
      dispatch(logout())
      navigate('/login', { replace: true })
    } catch (error: any) {
      console.error('Delete account error:', error)
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบบัญชี รหัสผ่านอาจไม่ถูกต้อง')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setDeletePassword('')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ตั้งค่าโปรไฟล์</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ชื่อ
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Address Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  ที่อยู่สำหรับจัดส่ง
                </h3>

                <div className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                      placeholder="เช่น 08XXXXXXXX"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ที่อยู่
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                      placeholder="เช่น 123/45 หมู่ 6"
                    />
                  </div>

                  {/* District and City in one row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        แขวง/ตำบล
                      </label>
                      <input
                        type="text"
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        placeholder="เช่น คลองจั่น"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        เขต/อำเภอ
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        placeholder="เช่น บางกะปิ"
                      />
                    </div>
                  </div>

                  {/* Province and Postal Code in one row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        จังหวัด
                      </label>
                      <input
                        type="text"
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        placeholder="เช่น กรุงเทพมหานคร"
                      />
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        รหัสไปรษณีย์
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        placeholder="เช่น 10240"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Section (only visible when editing) */}
              {isEditing && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      เปลี่ยนรหัสผ่าน (ไม่บังคับ)
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          รหัสผ่านปัจจุบัน
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="off"
                          data-form-type="other"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          รหัสผ่านใหม่
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="new-password"
                          data-form-type="other"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ยืนยันรหัสผ่านใหม่
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="new-password"
                          data-form-type="other"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    แก้ไขข้อมูล
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ยกเลิก
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ข้อมูลบัญชี</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">User ID:</span> {user.id || 'N/A'}
            </p>
            <p>
              <span className="font-medium">สถานะ:</span>{' '}
              <span className="text-green-600 dark:text-green-400">ใช้งานอยู่</span>
            </p>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">การแสดงผล</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">โหมดมืด</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">เปลี่ยนธีมการแสดงผล</p>
            </div>
            <ThemeToggleButton id="profile-theme-toggle" />
          </div>
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="mt-6 bg-red-50 dark:bg-red-900/10 rounded-xl shadow border border-red-200 dark:border-red-900/30 p-6">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3">โซนอันตราย</h3>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            การลบบัญชีจะลบข้อมูลทั้งหมดของคุณอย่างถาวร และไม่สามารถกู้คืนได้
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            ลบบัญชี
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ยืนยันการลบบัญชี</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              กรุณาใส่รหัสผ่านเพื่อยืนยันการลบบัญชี การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="mb-6">
              <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                รหัสผ่าน
              </label>
              <input
                type="password"
                id="deletePassword"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={isDeleting}
                autoComplete="off"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800"
                placeholder="ใส่รหัสผ่านของคุณ"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || !deletePassword}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'กำลังลบบัญชี...' : 'ยืนยันการลบ'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
