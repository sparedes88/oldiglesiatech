import { useState, useEffect } from 'react'
import './App.css'
import { apiService } from './apiService'
import { ApiManager } from './ApiManager'
import { ChurchDetails } from './ChurchDetails'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import DirectoryPage from './pages/Directory/DirectoryPage.tsx'
import EzLinkPage from './pages/EzLink/EzLinkPage.tsx'
import MediaPage from './pages/Media/MediaPage.tsx'
import GalleryPage from './pages/Gallery/GalleryPage.tsx'

interface Iglesia {
  idIglesia: number;
  Nombre?: string;
  Ciudad?: string;
  Provincia?: string;
  Calle?: string;
  NoExt?: string;
  ZIP?: string;
  Logo?: string;
  header?: string;
  country?: string;
  telefono?: string;
  email?: string;
  website?: string;
  topic?: string;
  idTipoServicio?: number;
  tipoServicio?: string;
  service_type_picture?: string;
  manager?: string;
  plan_type?: string;
  monthly_cost?: number;
  contacts?: Contact[];
  contactCount?: number;
  [key: string]: any;
}

interface Contact {
  idUsuario: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  avatar?: string;
  [key: string]: any;
}

function Home() {
  const [iglesias, setIglesias] = useState<Iglesia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIglesia, setSelectedIglesia] = useState<number | null>(null);
  const [loadingContacts, setLoadingContacts] = useState<number | null>(null);
  const [totalContacts, setTotalContacts] = useState(0);
  const [showApiManager, setShowApiManager] = useState<Iglesia | null>(null);
  const [showChurchDetails, setShowChurchDetails] = useState<Iglesia | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIglesias();
  }, []);

  const fetchIglesias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getIglesias({ minimal: false });
      console.log('Raw API Response:', data);
      console.log('Type of data:', typeof data);
      console.log('Is Array?', Array.isArray(data));
      
      // Handle different response structures
      let iglesiasArray = [];
      if (Array.isArray(data)) {
        iglesiasArray = data;
      } else if (data && typeof data === 'object') {
        // Check if data has a nested array property
        if (data.data && Array.isArray(data.data)) {
          iglesiasArray = data.data;
        } else if (data.iglesias && Array.isArray(data.iglesias)) {
          iglesiasArray = data.iglesias;
        } else if (data.result && Array.isArray(data.result)) {
          iglesiasArray = data.result;
        } else {
          // Convert object values to array
          iglesiasArray = Object.values(data);
        }
      }
      
      console.log('Processed iglesias:', iglesiasArray);
      console.log('Count:', iglesiasArray.length);
      
      // Initialize contact counts to 0
      const iglesiasWithCounts = iglesiasArray.map((ig: any) => ({
        ...ig,
        contactCount: 0,
        contacts: []
      }));
      
      setIglesias(iglesiasWithCounts);
      
      // Fetch contact counts for all iglesias
      fetchAllContactCounts(iglesiasWithCounts);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch iglesias';
      setError(`${errorMsg} - Check console for details`);
      console.error('Full Error:', err);
      console.error('Error Response:', err.response);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllContactCounts = async (iglesiasData: Iglesia[]) => {
    let total = 0;
    const updatedIglesias = [...iglesiasData];
    
    for (let i = 0; i < updatedIglesias.length; i++) {
      try {
        const contacts = await apiService.getContacts(updatedIglesias[i].idIglesia);
        const contactArray = Array.isArray(contacts) ? contacts : [];
        updatedIglesias[i].contactCount = contactArray.length;
        total += contactArray.length;
      } catch (error) {
        console.error(`Error fetching contacts for iglesia ${updatedIglesias[i].idIglesia}:`, error);
        updatedIglesias[i].contactCount = 0;
      }
    }
    
    setTotalContacts(total);
    setIglesias(updatedIglesias);
  };

  const handleCardClick = async (iglesia: Iglesia) => {
    // If already has contacts loaded, toggle off
    if (selectedIglesia === iglesia.idIglesia) {
      setSelectedIglesia(null);
      return;
    }

    setSelectedIglesia(iglesia.idIglesia);
    setLoadingContacts(iglesia.idIglesia);

    try {
      const contacts = await apiService.getContacts(iglesia.idIglesia);
      const contactArray = Array.isArray(contacts) ? contacts : [];
      
      setIglesias(prev => prev.map(ig => 
        ig.idIglesia === iglesia.idIglesia 
          ? { ...ig, contacts: contactArray, contactCount: contactArray.length }
          : ig
      ));
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoadingContacts(null);
    }
  };

  const filteredIglesias = iglesias.filter((iglesia) =>
    iglesia.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iglesia.Ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iglesia.idIglesia?.toString().includes(searchTerm) ||
    iglesia.manager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <header>
        <h1>IglesiaTech - Database Viewer</h1>
        <p>Connected to: {apiService ? 'API Server' : 'No connection'}</p>
      </header>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by ID, name, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={fetchIglesias} className="refresh-btn">
          Refresh Data
        </button>
      </div>

      {loading && <div className="loading">Loading iglesias...</div>}
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchIglesias}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="results">
          <div className="summary-stats">
            <h2>Total Iglesias: {filteredIglesias.length}</h2>
            <h2>Total Contacts: {totalContacts}</h2>
          </div>
          
          <div className="iglesias-grid">
            {filteredIglesias.map((iglesia) => (
              <div 
                key={iglesia.idIglesia} 
                className={`iglesia-card ${selectedIglesia === iglesia.idIglesia ? 'expanded' : ''}`}
                onClick={() => handleCardClick(iglesia)}
              >
                {/* Header Image - using service type picture if available */}
                {(iglesia.header || iglesia.service_type_picture) && (
                  <div className="card-header-image">
                    <img 
                      src={iglesia.header || `https://iglesia-tech-api.e2api.com${iglesia.service_type_picture}`} 
                      alt={`${iglesia.Nombre} header`} 
                    />
                  </div>
                )}
                
                {/* Logo and ID */}
                <div className="card-top">
                  <div className="logo-container">
                    {iglesia.Logo ? (
                      <img src={iglesia.Logo} alt={`${iglesia.Nombre} logo`} className="church-logo" />
                    ) : (
                      <div className="church-logo-placeholder">⛪</div>
                    )}
                  </div>
                  <div className="iglesia-id">ID: {iglesia.idIglesia}</div>
                </div>

                {/* Church Name */}
                <h3 className="church-name">{iglesia.Nombre || 'Unnamed Church'}</h3>
                
                {/* Service Type & Plan */}
                {(iglesia.tipoServicio || iglesia.plan_type) && (
                  <div className="service-info">
                    {iglesia.tipoServicio && (
                      <span className="badge service-badge">{iglesia.tipoServicio}</span>
                    )}
                    {iglesia.plan_type && (
                      <span className="badge plan-badge">{iglesia.plan_type}</span>
                    )}
                    {iglesia.monthly_cost && (
                      <span className="cost">${iglesia.monthly_cost}/mo</span>
                    )}
                  </div>
                )}

                {/* Manager */}
                {iglesia.manager && (
                  <div className="manager-section">
                    <span className="icon">👤</span>
                    <span>Manager: <strong>{iglesia.manager}</strong></span>
                  </div>
                )}
                
                {/* Address Section */}
                <div className="address-section">
                  {(iglesia.Calle || iglesia.Ciudad || iglesia.Provincia || iglesia.country || iglesia.NoExt) && (
                    <>
                      <div className="section-label">📍 Address</div>
                      {iglesia.Calle && <p className="address-line">{iglesia.Calle}</p>}
                      <p className="address-line">
                        {[iglesia.Ciudad, iglesia.Provincia, iglesia.ZIP].filter(Boolean).join(', ')}
                      </p>
                      {iglesia.country && <p className="address-line">{iglesia.country}</p>}
                    </>
                  )}
                  
                  {/* Phone in NoExt field */}
                  {iglesia.NoExt && (
                    <p className="contact-item">
                      <span className="icon">📞</span> {iglesia.NoExt}
                    </p>
                  )}
                </div>

                {/* Contact Information */}
                {(iglesia.email || iglesia.website || iglesia.telefono) && (
                  <div className="contact-section">
                    {iglesia.telefono && (
                      <p className="contact-item">
                        <span className="icon">📞</span> {iglesia.telefono}
                      </p>
                    )}
                    {iglesia.email && (
                      <p className="contact-item">
                        <span className="icon">✉️</span> {iglesia.email}
                      </p>
                    )}
                    {iglesia.website && (
                      <p className="contact-item">
                        <span className="icon">🌐</span> 
                        <a href={iglesia.website} target="_blank" rel="noopener noreferrer">
                          {iglesia.website}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="stats-section">
                  <div className="stat-item highlight-stat">
                    <span>👥 Contacts: {iglesia.contactCount ?? 0}</span>
                  </div>
                  {iglesia.sms_count !== undefined && (
                    <div className="stat-item">
                      <span>💬 SMS: {iglesia.sms_count}</span>
                    </div>
                  )}
                  {iglesia.chat_count !== undefined && (
                    <div className="stat-item">
                      <span>💭 Chats: {iglesia.chat_count}</span>
                    </div>
                  )}
                  {iglesia.email_count !== undefined && (
                    <div className="stat-item">
                      <span>📧 Emails: {iglesia.email_count}</span>
                    </div>
                  )}
                </div>

                {/* Contacts List - Shown when card is clicked */}
                {selectedIglesia === iglesia.idIglesia && (
                  <div className="contacts-section">
                    {loadingContacts === iglesia.idIglesia ? (
                      <div className="loading-contacts">Loading contacts...</div>
                    ) : iglesia.contacts && iglesia.contacts.length > 0 ? (
                      <>
                        <div className="contacts-header">
                          <h4>Contacts ({iglesia.contacts.length})</h4>
                          <button 
                            className="close-contacts"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIglesia(null);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="contacts-list">
                          {iglesia.contacts.map((contact) => (
                            <div key={contact.idUsuario} className="contact-card">
                              <div className="contact-avatar">
                                {contact.avatar ? (
                                  <img src={contact.avatar} alt={`${contact.nombre} ${contact.apellido}`} />
                                ) : (
                                  <div className="avatar-placeholder">
                                    {(contact.nombre?.[0] || '') + (contact.apellido?.[0] || '')}
                                  </div>
                                )}
                              </div>
                              <div className="contact-info">
                                <div className="contact-name">
                                  {contact.nombre} {contact.apellido}
                                </div>
                                {contact.email && (
                                  <div className="contact-detail">✉️ {contact.email}</div>
                                )}
                                {contact.telefono && (
                                  <div className="contact-detail">📞 {contact.telefono}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="no-contacts">No contacts found</div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="card-actions">
                  <button 
                    className="btn-view-details"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChurchDetails(iglesia);
                    }}
                  >
                    📋 View All Details
                  </button>
                  <button 
                    className="btn-api-config"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowApiManager(iglesia);
                    }}
                  >
                    🔧 API Configuration
                  </button>
                  <div className="quick-links">
                    <button
                      className="btn-link"
                      onClick={(e) => { e.stopPropagation(); navigate(`/directory/${iglesia.idIglesia}`); }}
                    >
                      📇 Directory
                    </button>
                    <button
                      className="btn-link"
                      onClick={(e) => { e.stopPropagation(); navigate(`/ezlinks/${iglesia.idIglesia}`); }}
                    >
                      🔗 EzLinks
                    </button>
                    <button
                      className="btn-link"
                      onClick={(e) => { e.stopPropagation(); navigate(`/media/${iglesia.idIglesia}`); }}
                    >
                      ▶️ Media
                    </button>
                    <button
                      className="btn-link"
                      onClick={(e) => { e.stopPropagation(); navigate(`/galleries/${iglesia.idIglesia}`); }}
                    >
                      🖼️ Galleries
                    </button>
                  </div>
                </div>

                {/* Full Data Toggle */}
                <details className="full-data-details">
                  <summary>View Full Data</summary>
                  <pre>{JSON.stringify(iglesia, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>

          {filteredIglesias.length === 0 && !loading && (
            <p className="no-results">No iglesias found matching your search.</p>
          )}
        </div>
      )}

      {/* Church Details Modal */}
      {showChurchDetails && (
        <ChurchDetails 
          iglesia={showChurchDetails} 
          onClose={() => setShowChurchDetails(null)}
        />
      )}

      {/* API Manager Modal */}
      {showApiManager && (
        <ApiManager 
          iglesia={showApiManager} 
          onClose={() => setShowApiManager(null)}
        />
      )}
    </div>
  )
}

// Route wrappers for pages needing id param as prop
const MediaRoute = () => {
  const { id } = useParams();
  return <MediaPage idIglesia={Number(id)} />;
};

const GalleryRoute = () => {
  const { id } = useParams();
  return <GalleryPage idIglesia={Number(id)} />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/directory/:id" element={<DirectoryPage />} />
      <Route path="/ezlinks/:id" element={<EzLinkPage />} />
      <Route path="/media/:id" element={<MediaRoute />} />
      <Route path="/galleries/:id" element={<GalleryRoute />} />
    </Routes>
  );
}
