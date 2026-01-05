import { useState, useEffect } from 'react';
import { apiService } from './apiService';
import './ChurchDetails.css';

interface ChurchDetailsProps {
  iglesia: any;
  onClose: () => void;
}

interface MediaStats {
  galleries: number;
  albums: number;
  articles: number;
  videos: number;
  audios: number;
  documents: number;
  events: number;
  groups: number;
}

export function ChurchDetails({ iglesia, onClose }: ChurchDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'media' | 'galleries' | 'articles' | 'videos' | 'directory'>('info');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MediaStats>({
    galleries: 0,
    albums: 0,
    articles: 0,
    videos: 0,
    audios: 0,
    documents: 0,
    events: 0,
    groups: 0,
  });

  const [contacts, setContacts] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Generate a robust unique key for list items using multiple possible id fields, with a stable fallback
  const getKey = (item: any, prefix: string, index: number) => {
    if (!item) return `${prefix}-empty-${index}`;
    const candidates = [
      'id', 'idUsuario', 'idGallery', 'idAlbum', 'idArticulo', 'idVideo', 'idAudio', 'idDocument',
      'idGroup', 'idGrupo', 'idEvent', 'idEvento', '_id', 'uuid', 'key', 'Id', 'ID', 'slug'
    ];
    for (const c of candidates) {
      const val = item[c as keyof typeof item];
      if (val !== undefined && val !== null && String(val).length > 0) return String(val);
    }
    const title = item.title || item.titulo || item.nombre || '';
    const date = item.fecha || item.date || item.created_at || '';
    return `${prefix}-${title}-${date}-${index}`;
  };

  useEffect(() => {
    loadAllData();
  }, [iglesia.idIglesia]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Loading data for church:', iglesia.idIglesia, iglesia.Nombre);
      
      // Load all data in parallel - Use REST API from SQL database
      const results = await Promise.allSettled([
        apiService.getContacts(iglesia.idIglesia),
        apiService.getGalleries(iglesia.idIglesia),
        apiService.getGalleryAlbums(iglesia.idIglesia),
        apiService.getArticles(iglesia.idIglesia),
        apiService.getVideos(iglesia.idIglesia, 'all'),
        apiService.getGroups(iglesia.idIglesia),
        apiService.getEvents(iglesia.idIglesia),
      ]);
      
      const [contactsData, galleriesData, albumsData, articlesData, videosData, groupsData, eventsData] = results;

      // Helper to find the first array within an object by common keys or deep search
      const findFirstArray = (obj: any): any[] => {
        const commonKeys = [
          'data','result','items','galleries','albums','articles','videos','groups','events',
          'records','rows','list','content','pictures','entries'
        ];
        for (const k of commonKeys) {
          if (obj && Array.isArray(obj[k])) return obj[k];
        }
        // Deep search one level
        for (const v of Object.values(obj || {})) {
          if (Array.isArray(v)) return v;
          if (v && typeof v === 'object') {
            const inner = findFirstArray(v);
            if (Array.isArray(inner) && inner.length >= 0) return inner;
          }
        }
        return [];
      };

      // Helper function to extract array from any response shape
      const extractArray = (data: any) => {
        if (!data) return [] as any[];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') {
          const arr = findFirstArray(data);
          if (arr && Array.isArray(arr)) return arr;
          // Possibly a map keyed by ids
          return Object.values(data);
        }
        return [] as any[];
      };

      // Process results with logging
      console.log('Contacts response:', contactsData);
      console.log('Galleries response:', galleriesData);
      console.log('Albums response:', albumsData);
      console.log('Articles response:', articlesData);
      console.log('Videos response:', videosData);
      console.log('Groups response:', groupsData);
      console.log('Events response:', eventsData);

      if (contactsData.status === 'fulfilled') {
        const contactsArray = extractArray(contactsData.value);
        console.log('Extracted contacts:', contactsArray.length);
        setContacts(contactsArray);
      } else {
        console.error('Contacts failed:', contactsData.reason);
      }

      if (galleriesData.status === 'fulfilled') {
        const galleriesArray = extractArray(galleriesData.value);
        console.log('Extracted galleries:', galleriesArray.length);
        if (galleriesArray.length > 0) console.log('Sample gallery item:', galleriesArray[0]);
        setGalleries(galleriesArray);
      } else {
        console.error('Galleries failed:', galleriesData.reason);
      }

      if (albumsData.status === 'fulfilled') {
        const albumsArray = extractArray(albumsData.value);
        console.log('Extracted albums:', albumsArray.length);
        if (albumsArray.length > 0) console.log('Sample album:', albumsArray[0]);
        setAlbums(albumsArray);
      } else {
        console.error('Albums failed:', albumsData.reason);
      }

      if (articlesData.status === 'fulfilled') {
        const articlesArray = extractArray(articlesData.value);
        console.log('Extracted articles:', articlesArray.length);
        if (articlesArray.length > 0) console.log('Sample article:', articlesArray[0]);
        setArticles(articlesArray);
      } else {
        console.error('Articles failed:', articlesData.reason);
      }

      if (videosData.status === 'fulfilled') {
        const videosArray = extractArray(videosData.value);
        console.log('Extracted videos:', videosArray.length);
        if (videosArray.length > 0) console.log('Sample video:', videosArray[0]);
        setVideos(videosArray);
      } else {
        console.error('Videos failed:', videosData.reason);
      }

      if (groupsData.status === 'fulfilled') {
        const groupsArray = extractArray(groupsData.value);
        console.log('Extracted groups:', groupsArray.length);
        setGroups(groupsArray);
      } else {
        console.error('Groups failed:', groupsData.reason);
      }

      if (eventsData.status === 'fulfilled') {
        const eventsArray = extractArray(eventsData.value);
        console.log('Extracted events:', eventsArray.length);
        setEvents(eventsArray);
      } else {
        console.error('Events failed:', eventsData.reason);
      }

      // Calculate stats from videos data
      const videosArray = videosData.status === 'fulfilled' ? extractArray(videosData.value) : [];
      const videoItems = videosArray.filter((v: any) => {
        const type = v.type || v.tipo || v.mediaType || '';
        return type.includes('video') || v.url?.includes('youtube') || v.url?.includes('vimeo');
      });
      const audioItems = videosArray.filter((v: any) => {
        const type = v.type || v.tipo || v.mediaType || '';
        return type.includes('audio');
      });
      const documentItems = videosArray.filter((v: any) => {
        const type = v.type || v.tipo || v.mediaType || '';
        return type.includes('document') || type.includes('pdf');
      });
      
      setStats({
        galleries: galleriesData.status === 'fulfilled' ? extractArray(galleriesData.value).length : 0,
        albums: albumsData.status === 'fulfilled' ? extractArray(albumsData.value).length : 0,
        articles: articlesData.status === 'fulfilled' ? extractArray(articlesData.value).length : 0,
        videos: videoItems.length,
        audios: audioItems.length,
        documents: documentItems.length,
        events: eventsData.status === 'fulfilled' ? extractArray(eventsData.value).length : 0,
        groups: groupsData.status === 'fulfilled' ? extractArray(groupsData.value).length : 0,
      });
    } catch (error) {
      console.error('Error loading church data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInfo = () => (
    <div className="info-section">
      <h3>Church Information</h3>
      <div className="info-grid">
        <div className="info-item">
          <label>Name:</label>
          <span>{iglesia.Nombre || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>City:</label>
          <span>{iglesia.Ciudad || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>Province/State:</label>
          <span>{iglesia.Provincia || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>Country:</label>
          <span>{iglesia.country || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>Address:</label>
          <span>{`${iglesia.Calle || ''} ${iglesia.NoExt || ''}, ${iglesia.Ciudad || ''}, ${iglesia.Provincia || ''} ${iglesia.ZIP || ''}`}</span>
        </div>
        <div className="info-item">
          <label>Phone:</label>
          <span>{iglesia.telefono || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>Email:</label>
          <span>{iglesia.email || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>Website:</label>
          <span>{iglesia.website ? <a href={iglesia.website} target="_blank" rel="noopener noreferrer">{iglesia.website}</a> : 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>Service Type:</label>
          <span>{iglesia.tipoServicio || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>Plan:</label>
          <span>{iglesia.plan_type || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label>Manager:</label>
          <span>{iglesia.manager || 'N/A'}</span>
        </div>
      </div>

      <h3 className="stats-title">Content Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{contacts.length}</div>
          <div className="stat-label">Contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-value">{stats.galleries}</div>
          <div className="stat-label">Galleries</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-value">{stats.albums}</div>
          <div className="stat-label">Albums</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.articles}</div>
          <div className="stat-label">Articles</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎥</div>
          <div className="stat-value">{stats.videos}</div>
          <div className="stat-label">Videos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎵</div>
          <div className="stat-value">{stats.audios}</div>
          <div className="stat-label">Audio</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-value">{stats.documents}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.events}</div>
          <div className="stat-label">Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍👩‍👧‍👦</div>
          <div className="stat-value">{stats.groups}</div>
          <div className="stat-label">Groups</div>
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="contacts-section">
      <h3>Contacts ({contacts.length})</h3>
      {contacts.length === 0 ? (
        <p className="no-data">No contacts found</p>
      ) : (
        <div className="contacts-list">
          {contacts.map((contact, idx) => (
            <div key={getKey(contact, 'contact', idx)} className="contact-card">
              {contact.avatar && (
                <img src={contact.avatar} alt={contact.nombre} className="contact-avatar" />
              )}
              <div className="contact-info">
                <h4>{`${contact.nombre || ''} ${contact.apellido || ''}`}</h4>
                <p>📧 {contact.email || 'No email'}</p>
                <p>📞 {contact.telefono || 'No phone'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGalleries = () => (
    <div className="galleries-section">
      <h3>Galleries ({galleries.length}) & Albums ({albums.length})</h3>
      {albums.length === 0 && galleries.length === 0 ? (
        <p className="no-data">No galleries or albums found</p>
      ) : (
        <>
          {albums.length > 0 && (
            <div>
              <h4>Albums</h4>
              <div className="albums-grid">
                {albums.map((album: any, index: number) => (
                  <div key={getKey(album, 'album', index)} className="album-card">
                    {(album.cover_photo || album.portada || album.imagen) && (
                      <img 
                        src={album.cover_photo || album.portada || album.imagen} 
                        alt={album.title || album.nombre || album.titulo} 
                        className="album-cover" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <h5>{album.title || album.nombre || album.titulo || 'Untitled Album'}</h5>
                    <p>{album.description || album.descripcion || ''}</p>
                    {album.photoCount && <span className="photo-count">📷 {album.photoCount} photos</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {galleries.length > 0 && (
            <div>
              <h4>Gallery Items</h4>
              <div className="galleries-grid">
                {galleries.map((item: any, index: number) => (
                  <div key={getKey(item, 'gallery', index)} className="gallery-item">
                    {(item.image_url || item.url || item.imagen || item.media) && (
                      <img 
                        src={item.image_url || item.url || item.imagen || item.media} 
                        alt={item.title || item.titulo || item.caption} 
                        className="gallery-image" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <p>{item.title || item.titulo || item.caption || item.nombre || ''}</p>
                    {item.fecha && <span className="date">📅 {new Date(item.fecha).toLocaleDateString()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderArticles = () => (
    <div className="articles-section">
      <h3>Articles ({articles.length})</h3>
      {articles.length === 0 ? (
        <p className="no-data">No articles found</p>
      ) : (
        <div className="articles-list">
          {articles.map((article: any, idx: number) => (
            <div key={getKey(article, 'article', idx)} className="article-card">
              {article.portada && (
                <img src={article.portada} alt={article.titulo} className="article-image" />
              )}
              <div className="article-content">
                <h4>{article.titulo || article.title || 'Untitled'}</h4>
                <p>{article.descripcion || article.description || ''}</p>
                <div className="article-meta">
                  <span>📅 {article.fecha ? new Date(article.fecha).toLocaleDateString() : 'N/A'}</span>
                  {article.categoria && <span>🏷️ {article.categoria}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVideos = () => {
    // Separate videos by type
    const videoItems = videos.filter((v: any) => {
      const type = v.type || v.tipo || v.mediaType || '';
      return type.includes('video') || v.url?.includes('youtube') || v.url?.includes('vimeo');
    });
    
    const audioItems = videos.filter((v: any) => {
      const type = v.type || v.tipo || v.mediaType || '';
      return type.includes('audio');
    });
    
    const documentItems = videos.filter((v: any) => {
      const type = v.type || v.tipo || v.mediaType || '';
      return type.includes('document') || type.includes('pdf');
    });
    
    return (
      <div className="videos-section">
        <h3>Videos & Media</h3>
        <div className="media-stats">
          <span>🎥 Videos: {videoItems.length}</span>
          <span>🎵 Audio: {audioItems.length}</span>
          <span>📄 Documents: {documentItems.length}</span>
        </div>
        
        {videos.length === 0 ? (
          <p className="no-data">No media found</p>
        ) : (
          <>
            {videoItems.length > 0 && (
              <div className="media-category">
                <h4>Videos</h4>
                <div className="videos-grid">
                  {videoItems.map((video: any, index: number) => (
                    <div key={getKey(video, 'video', index)} className="video-card">
                      {(video.thumbnail || video.miniatura || video.portada) && (
                        <img 
                          src={video.thumbnail || video.miniatura || video.portada} 
                          alt={video.title || video.titulo} 
                          className="video-thumbnail" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <h4>{video.title || video.titulo || video.nombre || 'Untitled'}</h4>
                      <p>{video.description || video.descripcion || ''}</p>
                      {video.url && <a href={video.url} target="_blank" rel="noopener noreferrer" className="media-link">▶️ Watch</a>}
                      {video.duration && <span className="video-duration">⏱️ {video.duration}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {audioItems.length > 0 && (
              <div className="media-category">
                <h4>Audio</h4>
                <div className="videos-grid">
                  {audioItems.map((audio: any, index: number) => (
                    <div key={getKey(audio, 'audio', index)} className="video-card">
                      <div className="audio-icon">🎵</div>
                      <h4>{audio.title || audio.titulo || audio.nombre || 'Untitled'}</h4>
                      <p>{audio.description || audio.descripcion || ''}</p>
                      {audio.url && <a href={audio.url} target="_blank" rel="noopener noreferrer" className="media-link">🎧 Listen</a>}
                      {audio.duration && <span className="video-duration">⏱️ {audio.duration}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {documentItems.length > 0 && (
              <div className="media-category">
                <h4>Documents</h4>
                <div className="videos-grid">
                  {documentItems.map((doc: any, index: number) => (
                    <div key={getKey(doc, 'document', index)} className="video-card">
                      <div className="audio-icon">📄</div>
                      <h4>{doc.title || doc.titulo || doc.nombre || 'Untitled'}</h4>
                      <p>{doc.description || doc.descripcion || ''}</p>
                      {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="media-link">📥 Download</a>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderDirectory = () => (
    <div className="directory-section">
      <h3>Groups & Events</h3>
      <div>
        <h4>Groups ({groups.length})</h4>
        {groups.length === 0 ? (
          <p className="no-data">No groups found</p>
        ) : (
          <div className="groups-list">
            {groups.map((group: any, index: number) => (
              <div key={getKey(group, 'group', index)} className="group-card">
                {(group.imagen || group.image || group.logo) && (
                  <img 
                    src={group.imagen || group.image || group.logo} 
                    alt={group.name || group.nombre} 
                    className="group-image" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <h5>{group.name || group.nombre || group.titulo || 'Unnamed Group'}</h5>
                <p>{group.description || group.descripcion || ''}</p>
                {(group.members_count || group.miembros || group.cantidadMiembros) && (
                  <span>👥 {group.members_count || group.miembros || group.cantidadMiembros} members</span>
                )}
                {group.categoria && <span className="group-category">🏷️ {group.categoria}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h4>Events ({events.length})</h4>
        {events.length === 0 ? (
          <p className="no-data">No events found</p>
        ) : (
          <div className="events-list">
            {events.map((event: any, index: number) => (
              <div key={getKey(event, 'event', index)} className="event-card">
                {(event.imagen || event.image || event.portada) && (
                  <img 
                    src={event.imagen || event.image || event.portada} 
                    alt={event.title || event.titulo} 
                    className="event-image" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <h5>{event.title || event.titulo || event.nombre || 'Unnamed Event'}</h5>
                <p>{event.description || event.descripcion || ''}</p>
                <div className="event-meta">
                  {(event.start_date || event.fecha || event.fechaInicio) && (
                    <span>📅 {new Date(event.start_date || event.fecha || event.fechaInicio).toLocaleDateString()}</span>
                  )}
                  {(event.location || event.ubicacion || event.lugar) && (
                    <span>📍 {event.location || event.ubicacion || event.lugar}</span>
                  )}
                  {(event.hora || event.time) && (
                    <span>🕐 {event.hora || event.time}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="church-details-overlay" onClick={onClose}>
      <div className="church-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            {iglesia.Logo && (
              <img src={iglesia.Logo} alt={iglesia.Nombre} className="church-logo-large" />
            )}
            <div>
              <h2>{iglesia.Nombre || 'Church Details'}</h2>
              <p>{iglesia.Ciudad}, {iglesia.Provincia}</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>
            📋 Info
          </button>
          <button className={activeTab === 'contacts' ? 'active' : ''} onClick={() => setActiveTab('contacts')}>
            👥 Contacts ({contacts.length})
          </button>
          <button className={activeTab === 'galleries' ? 'active' : ''} onClick={() => setActiveTab('galleries')}>
            📸 Galleries ({stats.galleries + stats.albums})
          </button>
          <button className={activeTab === 'articles' ? 'active' : ''} onClick={() => setActiveTab('articles')}>
            📝 Articles ({stats.articles})
          </button>
          <button className={activeTab === 'videos' ? 'active' : ''} onClick={() => setActiveTab('videos')}>
            🎥 Media ({stats.videos + stats.audios})
          </button>
          <button className={activeTab === 'directory' ? 'active' : ''} onClick={() => setActiveTab('directory')}>
            📁 Directory ({stats.groups + stats.events})
          </button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <>
              {activeTab === 'info' && renderInfo()}
              {activeTab === 'contacts' && renderContacts()}
              {activeTab === 'galleries' && renderGalleries()}
              {activeTab === 'articles' && renderArticles()}
              {activeTab === 'videos' && renderVideos()}
              {activeTab === 'directory' && renderDirectory()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
