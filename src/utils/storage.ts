/**
 * Safe wrapper for chrome.storage.local with localStorage fallback
 */
export const storage = {
  get: async <T>(key: string, defaultValue: T): Promise<T> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result: Record<string, any>) => {
          if (result && result[key] !== undefined) {
            resolve(result[key] as T);
          } else {
            resolve(defaultValue);
          }
        });
      });
    } else {
      // LocalStorage Fallback for local development
      const val = localStorage.getItem(key);
      if (val !== null) {
        try {
          return JSON.parse(val) as T;
        } catch {
          return val as unknown as T;
        }
      }
      return defaultValue;
    }
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve();
        });
      });
    } else {
      // LocalStorage Fallback for local development
      localStorage.setItem(key, JSON.stringify(value));
      return Promise.resolve();
    }
  },

  remove: async (key: string): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(key, () => {
          resolve();
        });
      });
    } else {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
  }
};
