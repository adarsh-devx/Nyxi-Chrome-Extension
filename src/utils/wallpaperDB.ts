/**
 * WallpaperDB
 * A client wrapper for managing binary files (images, GIFs, video loops) in IndexedDB.
 * Stores raw Blobs directly on disk, avoiding Base64 text overhead.
 */
class WallpaperDB {
  private dbName = 'NyxiWallpaperDB';
  private storeName = 'wallpapers';
  private version = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initializes or fetches the cached IndexedDB database instance.
   */
  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Checks if a binary Blob exists for the given ID.
   */
  async hasWallpaper(id: string): Promise<boolean> {
    try {
      const blob = await this.get(id);
      return blob !== null;
    } catch {
      return false;
    }
  }

  /**
   * Saves a raw binary file (Blob) under a unique identifier string.
   */
  async save(id: string, file: Blob): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(file, id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Retrieves a binary file (Blob) from storage by its unique ID.
   */
  async get(id: string): Promise<Blob | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Deletes a binary file from IndexedDB by its unique ID.
   */
  async delete(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clears all records from the wallpapers object store.
   */
  async clearStore(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const wallpaperDB = new WallpaperDB();
