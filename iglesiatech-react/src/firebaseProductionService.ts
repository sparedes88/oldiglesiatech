import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import type { Database } from 'firebase/database';
import { config } from './config';

// Firebase service for original production database (church data)
class FirebaseProductionService {
  private app: FirebaseApp;
  private db: Database;

  constructor() {
    // Initialize Firebase with original production config
    this.app = initializeApp(config.firebaseData, 'productionDB');
    this.db = getDatabase(this.app);
  }

  // Get data from a specific path
  async getData(path: string): Promise<any> {
    try {
      const dataRef = ref(this.db, path);
      const snapshot = await get(dataRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log(`No data at path: ${path}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
}

export const firebaseProductionService = new FirebaseProductionService();
