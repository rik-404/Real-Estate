const EliteHouseUtils = {
  storage: {
    get: (key, defaultValue) => {
      try {
        const storedValue = localStorage.getItem(key)
        return storedValue ? JSON.parse(storedValue) : defaultValue
      } catch (error) {
        console.error(`Error getting ${key} from localStorage:`, error)
        return defaultValue
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error setting ${key} in localStorage:`, error)
      }
    },
    increment: (key) => {
      try {
        let currentValue = Number(localStorage.getItem(key) || 0)
        currentValue++
        localStorage.setItem(key, currentValue.toString())
      } catch (error) {
        console.error(`Error incrementing ${key} in localStorage:`, error)
      }
    },
  },
  dom: {
    createElement: (tag, attributes) => {
      const element = document.createElement(tag)
      for (const key in attributes) {
        element.setAttribute(key, attributes[key])
      }
      return element
    },
  },
  format: {
    formatPrice: (price) => {
      return Number(price).toLocaleString("pt-BR")
    },
  },
  url: {
    buildUrl: (baseUrl, params) => {
      const url = new URL(baseUrl, window.location.origin)
      for (const key in params) {
        if (params[key]) {
          url.searchParams.append(key, params[key])
        }
      }
      return url.toString()
    },
  },
}

export default EliteHouseUtils
