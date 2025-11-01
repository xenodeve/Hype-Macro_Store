import type { Theme } from './types'

export const THEME_CHANGE_EVENT = 'theme:change'

const notifyThemeChange = (): void => {
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { value: theme.value } }))
}

const storageKey = 'theme-preference'

const getColorPreference = (): string => {
  const stored = localStorage.getItem(storageKey)
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const theme: Theme = {
  value: getColorPreference(),
}

const reflectPreference = (): void => {
  document.firstElementChild?.setAttribute('data-theme', theme.value)
  document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value)

  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  notifyThemeChange()
}

const setPreference = (): void => {
  localStorage.setItem(storageKey, theme.value)
  reflectPreference()
}

export const onClick = (): void => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  setPreference()
}

export const initializeTheme = (): void => {
  const preferred = getColorPreference()
  theme.value = preferred
  document.documentElement.setAttribute('data-theme', preferred)
  if (preferred === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
  notifyThemeChange()
}

export const reflectThemePreference = reflectPreference

export const setupSystemThemeListener = (): void => {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', ({ matches: isDark }: MediaQueryListEvent) => {
      theme.value = isDark ? 'dark' : 'light'
      setPreference()
    })
}
