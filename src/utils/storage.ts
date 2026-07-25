/**
 * Safe wrapper for chrome.storage.local with chrome.runtime.lastError guards
 * and localStorage fallback for local development.
 */
export const storage = {
  get: async <T>(key: string, defaultValue: T): Promise<T> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result: Record<string, any>) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn(`chrome.storage.local.get warning for key "${key}":`, chrome.runtime.lastError.message);
            resolve(defaultValue);
            return;
          }
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
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn(`chrome.storage.local.set warning for key "${key}":`, chrome.runtime.lastError.message);
          }
          resolve();
        });
      });
    } else {
      // LocalStorage Fallback for local development
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn('localStorage set error:', err);
      }
      return Promise.resolve();
    }
  },

  remove: async (key: string): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(key, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn(`chrome.storage.local.remove warning for key "${key}":`, chrome.runtime.lastError.message);
          }
          resolve();
        });
      });
    } else {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
  },
};
