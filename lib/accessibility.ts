// Accessibility utilities for mobile optimization

export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
  )
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  element.addEventListener('keydown', handleTab)
  firstFocusable?.focus()

  return () => {
    element.removeEventListener('keydown', handleTab)
  }
}

export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

export function getSafeAreaInsets() {
  return {
    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0,
    right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-right')) || 0,
    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom')) || 0,
    left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-left')) || 0,
  }
}

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
