import api from './api'

export interface UpdateProfileDto {
  name?: string
  email?: string
  phone?: string
  address?: string
  district?: string
  city?: string
  province?: string
  postalCode?: string
  currentPassword?: string
  newPassword?: string
  cardName?: string
  cardLast4?: string
  cardExpiry?: string
}

export interface User {
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

export const userService = {
  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  async deleteAccount(password: string): Promise<void> {
    await api.delete('/users/profile', { data: { password } })
  },
}
