import axios from 'axios';
import { config } from './config';

class ApiService {
  private api: ReturnType<typeof axios.create>;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get all iglesias
  async getIglesias(params?: { minimal?: boolean }) {
    try {
      console.log('Making API request to:', `${config.apiUrl}/iglesias/getIglesias`);
      console.log('With params:', params);
      const response = await this.api.get('/iglesias/getIglesias', { params });
      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching iglesias:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Get iglesia detail
  async getIglesiaDetail(idIglesia: number) {
    try {
      const response = await this.api.get('/iglesias/getIglesiaDetail', {
        params: { idIglesia },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching iglesia detail:', error);
      throw error;
    }
  }

  // Get iglesias with tags and contacts
  async getIglesiasWithTagsAndContacts(showTest: boolean = false) {
    try {
      const response = await this.api.get('/iglesias/getIglesiasWithTagsAndContacts', {
        params: { show_test: showTest },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching iglesias with tags:', error);
      throw error;
    }
  }

  // Get contacts for a specific iglesia
  async getContacts(idIglesia: number) {
    try {
      console.log('Fetching contacts for iglesia:', idIglesia);
      console.log('Making request to:', `${config.apiUrl}/getUsuarios?idIglesia=${idIglesia}`);
      const response = await this.api.get('/getUsuarios', {
        params: { idIglesia },
      });
      console.log('Contacts raw response:', response);
      console.log('Contacts response data:', response.data);
      console.log('Type:', typeof response.data);
      console.log('Is Array?', Array.isArray(response.data));
      
      // Handle different response structures
      let contactsArray = [];
      if (Array.isArray(response.data)) {
        contactsArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.data && Array.isArray(response.data.data)) {
          contactsArray = response.data.data;
        } else if (response.data.usuarios && Array.isArray(response.data.usuarios)) {
          contactsArray = response.data.usuarios;
        } else if (response.data.contacts && Array.isArray(response.data.contacts)) {
          contactsArray = response.data.contacts;
        } else {
          // Try to extract array from object values
          const values = Object.values(response.data);
          if (values.length > 0 && Array.isArray(values[0])) {
            contactsArray = values[0];
          } else {
            contactsArray = values;
          }
        }
      }
      
      console.log('Processed contacts array:', contactsArray);
      console.log('Contacts count:', contactsArray.length);
      return contactsArray;
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  }

  // Generic GET request
  async get(endpoint: string, params?: any) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Generic POST request
  async post(endpoint: string, data: any) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  }

  // Generic PATCH request
  async patch(endpoint: string, data: any) {
    try {
      const response = await this.api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error patching ${endpoint}:`, error);
      throw error;
    }
  }

  // Generic DELETE request
  async delete(endpoint: string, params?: any) {
    try {
      const response = await this.api.delete(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  }

  // Media & Content APIs
  
  // Get galleries for a church
  async getGalleries(idIglesia: number) {
    try {
      console.log('Fetching galleries for idIglesia:', idIglesia);
      const response = await this.api.get('/galleries', {
        params: { idOrganization: idIglesia },
      });
      console.log('Galleries response:', response.data);
      let data = response.data;
      // Fallback: if empty, try duda_sync pictures endpoint
      const isEmpty = Array.isArray(data) ? data.length === 0 : (data && typeof data === 'object' ? Object.keys(data).length === 0 : !data);
      if (isEmpty) {
        console.log('Primary galleries empty, trying fallback duda_sync/pictures...');
        const fallback = await this.api.get('/galleries/duda_sync/pictures', {
          params: { idOrganization: idIglesia },
        });
        data = fallback.data;
      }
      return data;
    } catch (error: any) {
      console.error('Error fetching galleries:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  }

  // Get gallery albums
  async getGalleryAlbums(idIglesia: number) {
    try {
      console.log('Fetching gallery albums for idIglesia:', idIglesia);
      const response = await this.api.get('/galleries/albums', {
        params: { idOrganization: idIglesia },
      });
      console.log('Albums response:', response.data);
      let data = response.data;
      // Fallback: if empty, try duda_sync galleries endpoint
      const isEmpty = Array.isArray(data) ? data.length === 0 : (data && typeof data === 'object' ? Object.keys(data).length === 0 : !data);
      if (isEmpty) {
        console.log('Primary albums empty, trying fallback duda_sync/galleries...');
        const fallback = await this.api.get('/galleries/duda_sync/galleries', {
          params: { idOrganization: idIglesia },
        });
        data = fallback.data;
      }
      return data;
    } catch (error: any) {
      console.error('Error fetching gallery albums:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  }

  // Get articles/blog posts
  async getArticles(idIglesia: number) {
    try {
      console.log('Fetching articles for idIglesia:', idIglesia);
      const response = await this.api.get('/articulos/getArticulosByCategoria', {
        params: { idIglesia },
      });
      console.log('Articles response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  }

  // Get article categories
  async getArticleCategories(idIglesia: number) {
    try {
      const response = await this.api.get('/articulos/getCategoriasArticulosByIdIglesia', {
        params: { idIglesia },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching article categories:', error);
      throw error;
    }
  }

  // Get videos/media
  async getVideos(idIglesia: number, mediaType?: 'all' | 'video' | 'audio' | 'document') {
    try {
      console.log('Fetching videos for idIglesia:', idIglesia, 'type:', mediaType);
      const params: any = { idIglesia };
      if (mediaType && mediaType !== 'all') {
        params.type = mediaType;
      }
      const response = await this.api.get('/videos/getVideos/', { params });
      console.log('Videos response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  }

  // Get playlists
  async getPlaylists(idIglesia: number) {
    try {
      const response = await this.api.get('/videos/getPlaylists', {
        params: { idIglesia },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  // Directory members
  async getDirectory(idIglesia: number) {
    try {
      console.log('Fetching directory for idIglesia:', idIglesia);
      const response = await this.api.get('/directory', { params: { idIglesia } });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching directory:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  }

  // EzLinks
  async getEzLinks(idIglesia: number) {
    try {
      console.log('Fetching ezlinks for idIglesia:', idIglesia);
      const response = await this.api.get('/ezlinks', { params: { idIglesia } });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ezlinks:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  }

  // Get directory/groups
  async getGroups(idIglesia: number) {
    try {
      console.log('Fetching groups for idIglesia:', idIglesia);
      const response = await this.api.get('/groups/getGroups', {
        params: { idIglesia },
      });
      console.log('Groups response:', response.data);
      let data = response.data;
      // Fallback: try requesting public groups if empty
      const isEmpty = Array.isArray(data) ? data.length === 0 : (data && typeof data === 'object' ? Object.keys(data).length === 0 : !data);
      if (isEmpty) {
        console.log('Primary groups empty, trying with type=public...');
        const fallback = await this.api.get('/groups/getGroups', {
          params: { idIglesia, type: 'public' },
        });
        data = fallback.data;
      }
      return data;
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  }

  // Get events
  async getEvents(idIglesia: number) {
    try {
      console.log('Fetching events for idIglesia:', idIglesia);
      const response = await this.api.post('/groups/getGroupsEventsByIdIglesia', {
        idIglesia,
        show_passed_events: false
      });
      console.log('Events response:', response.data);
      let data = response.data;
      const isEmpty = Array.isArray(data) ? data.length === 0 : (data && typeof data === 'object' ? Object.keys(data).length === 0 : !data);
      if (isEmpty) {
        console.log('Primary events empty, trying getEventsStandaloneV2...');
        const fb = await this.api.post('/groups/getEventsStandaloneV2', { idIglesia });
        data = fb.data;
      }
      return data;
    } catch (error: any) {
      console.error('Error fetching events:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  }
}

export const apiService = new ApiService();
