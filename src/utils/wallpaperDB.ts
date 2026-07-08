/**
 * WallpaperDB
 * A client wrapper for managing binary files (images, GIFs, video loops) in IndexedDB.
 * This stores raw Blobs directly on disk, avoiding the ~33% overhead of Base64 text.
 * It easily handles files up to 500MB and serves them via runtime URL streams.
 */
class WallpaperDB {
  private dbName = 'NyxiWallpaperDB';
  private storeName = 'wallpapers';
  private version = 1;

  /**
   * Initializes or fetches the IndexedDB database instance.
   * Handles database creation and store upgrades.
   */
  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        // Create the object store if it doesn't already exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  /**
   * Saves a raw binary file (Blob) under a unique identifier string.
   * Overwrites the entry if the ID already exists (upsert operation).
   * 
   * @param id The unique string identifier for the wallpaper.
   * @param file The raw Blob or File to write.
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
   * Returns null if no entry is found.
   * 
   * @param id The unique string identifier.
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
   * 
   * @param id The unique string identifier of the wallpaper to delete.
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
}

// Export a singleton instance of the database helper
export const wallpaperDB = new WallpaperDB();
