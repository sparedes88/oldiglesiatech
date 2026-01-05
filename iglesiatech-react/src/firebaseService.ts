import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, remove, onValue } from 'firebase/database';
import { config } from './config';

// Initialize Firebase
const app = initializeApp(config.firebase);
const database = getDatabase(app);

class FirebaseService {
  // Get data from a path
  async getData(path: string) {
    try {
      const dbRef = ref(database, path);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log('No data available');
        return null;
      }
    } catch (error) {
      console.error('Error reading data:', error);
      throw error;
    }
  }

  // Set data at a path
  async setData(path: string, data: any) {
    try {
      const dbRef = ref(database, path);
      await set(dbRef, data);
      return { success: true };
    } catch (error) {
      console.error('Error writing data:', error);
      throw error;
    }
  }

  // Update data at a path
  async updateData(path: string, data: any) {
    try {
      const dbRef = ref(database, path);
      await update(dbRef, data);
      return { success: true };
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  // Delete data at a path
  async deleteData(path: string) {
    try {
      const dbRef = ref(database, path);
      await remove(dbRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }

  // Listen to changes at a path
  listenToData(path: string, callback: (data: any) => void) {
    const dbRef = ref(database, path);
    return onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
  }

  // Get database reference
  getRef(path: string) {
    return ref(database, path);
  }
}

export const firebaseService = new FirebaseService();
export { database };
