import { firebaseProductionService } from './firebaseProductionService';

class FirebaseDataService {
  // Get galleries for a church
  async getGalleries(idIglesia: number) {
    try {
      console.log('Fetching galleries from Firebase for idIglesia:', idIglesia);
      const data = await firebaseProductionService.getData(`galleries`);
      
      if (!data) return [];
      
      // Filter galleries by idIglesia
      const galleriesArray = Object.values(data).filter((item: any) => 
        item.idOrganization === idIglesia || item.idIglesia === idIglesia
      );
      
      console.log('Galleries from Firebase:', galleriesArray.length);
      return galleriesArray;
    } catch (error) {
      console.error('Error fetching galleries from Firebase:', error);
      return [];
    }
  }

  // Get gallery albums for a church
  async getGalleryAlbums(idIglesia: number) {
    try {
      console.log('Fetching gallery albums from Firebase for idIglesia:', idIglesia);
      const data = await firebaseProductionService.getData(`galleryAlbums`);
      
      if (!data) return [];
      
      // Filter albums by idIglesia
      const albumsArray = Object.values(data).filter((item: any) => 
        item.idOrganization === idIglesia || item.idIglesia === idIglesia
      );
      
      console.log('Albums from Firebase:', albumsArray.length);
      return albumsArray;
    } catch (error) {
      console.error('Error fetching albums from Firebase:', error);
      return [];
    }
  }

  // Get articles for a church
  async getArticles(idIglesia: number) {
    try {
      console.log('Fetching articles from Firebase for idIglesia:', idIglesia);
      const data = await firebaseProductionService.getData(`articulos`);
      
      if (!data) return [];
      
      // Filter articles by idIglesia
      const articlesArray = Object.values(data).filter((item: any) => 
        item.idIglesia === idIglesia || item.idOrganization === idIglesia
      );
      
      console.log('Articles from Firebase:', articlesArray.length);
      return articlesArray;
    } catch (error) {
      console.error('Error fetching articles from Firebase:', error);
      return [];
    }
  }

  // Get videos/media for a church
  async getVideos(idIglesia: number, mediaType?: 'all' | 'video' | 'audio' | 'document') {
    try {
      console.log('Fetching videos from Firebase for idIglesia:', idIglesia, 'type:', mediaType);
      const data = await firebaseProductionService.getData(`videos`);
      
      if (!data) return [];
      
      // Filter videos by idIglesia
      let videosArray = Object.values(data).filter((item: any) => 
        item.idIglesia === idIglesia || item.idOrganization === idIglesia
      );
      
      // Filter by media type if specified
      if (mediaType && mediaType !== 'all') {
        videosArray = videosArray.filter((item: any) => 
          item.type === mediaType || item.media_type === mediaType
        );
      }
      
      console.log('Videos from Firebase:', videosArray.length);
      return videosArray;
    } catch (error) {
      console.error('Error fetching videos from Firebase:', error);
      return [];
    }
  }

  // Get groups for a church
  async getGroups(idIglesia: number) {
    try {
      console.log('Fetching groups from Firebase for idIglesia:', idIglesia);
      const data = await firebaseProductionService.getData(`groups`);
      
      if (!data) return [];
      
      // Filter groups by idIglesia
      const groupsArray = Object.values(data).filter((item: any) => 
        item.idIglesia === idIglesia || item.idOrganization === idIglesia
      );
      
      console.log('Groups from Firebase:', groupsArray.length);
      return groupsArray;
    } catch (error) {
      console.error('Error fetching groups from Firebase:', error);
      return [];
    }
  }

  // Get events for a church
  async getEvents(idIglesia: number) {
    try {
      console.log('Fetching events from Firebase for idIglesia:', idIglesia);
      const data = await firebaseProductionService.getData(`events`);
      
      if (!data) return [];
      
      // Filter events by idIglesia
      const eventsArray = Object.values(data).filter((item: any) => 
        item.idIglesia === idIglesia || item.idOrganization === idIglesia
      );
      
      console.log('Events from Firebase:', eventsArray.length);
      return eventsArray;
    } catch (error) {
      console.error('Error fetching events from Firebase:', error);
      return [];
    }
  }

  // Get playlists for a church
  async getPlaylists(idIglesia: number) {
    try {
      console.log('Fetching playlists from Firebase for idIglesia:', idIglesia);
      const data = await firebaseProductionService.getData(`playlists`);
      
      if (!data) return [];
      
      // Filter playlists by idIglesia
      const playlistsArray = Object.values(data).filter((item: any) => 
        item.idIglesia === idIglesia || item.idOrganization === idIglesia
      );
      
      console.log('Playlists from Firebase:', playlistsArray.length);
      return playlistsArray;
    } catch (error) {
      console.error('Error fetching playlists from Firebase:', error);
      return [];
    }
  }
}

export const firebaseDataService = new FirebaseDataService();
