import React, { useEffect, useState } from 'react';
import { apiService } from '../../apiService';

type GalleryItem = Record<string, any>;

const GalleryCard: React.FC<{ item: GalleryItem; onOpen: () => void }> = ({ item, onOpen }) => {
  const title = item.title || item.name || item.descripcion || 'Untitled';
  const img = item.cover || item.thumbnail || item.image || (item.pictures && item.pictures[0]?.url) || null;
  return (
    <button onClick={onOpen} className="text-left bg-white rounded-xl shadow hover:shadow-md overflow-hidden">
      {img && <img src={img} alt={title} className="w-full h-40 object-cover" />}
      <div className="p-4">
        <div className="font-semibold text-gray-900">{title}</div>
        {item.count && <div className="text-sm text-gray-500">{item.count} photos</div>}
      </div>
    </button>
  );
};

const GalleryDetail: React.FC<{ album: GalleryItem | null; onClose: () => void }> = ({ album, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{album?.title || album?.name || 'Album'}</h2>
          <button onClick={onClose} className="px-3 py-1 rounded border">Close</button>
        </div>
        <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(album?.pictures || []).map((p: any, idx: number) => (
            <img key={p.idPicture || p.id || idx} src={p.url || p.src} alt={p.title || `Photo ${idx+1}`} className="w-full h-48 object-cover rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

const GalleryPage: React.FC<{ idIglesia: number }> = ({ idIglesia }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<GalleryItem[]>([]);
  const [openAlbum, setOpenAlbum] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!idIglesia) return;
    setLoading(true);
    setError(null);
    Promise.allSettled([apiService.getGalleries(idIglesia), apiService.getGalleryAlbums(idIglesia)])
      .then(([gals, albs]) => {
        const g = gals.status === 'fulfilled' ? (Array.isArray(gals.value) ? gals.value : []) : [];
        const a = albs.status === 'fulfilled' ? (Array.isArray(albs.value) ? albs.value : []) : [];
        setGalleries(g as GalleryItem[]);
        setAlbums(a as GalleryItem[]);
      })
      .catch((e: any) => setError(e?.message || 'Failed to load galleries'))
      .finally(() => setLoading(false));
  }, [idIglesia]);

  const all = [...galleries, ...albums];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Galleries</h1>
      {loading && <div>Loading galleries…</div>}
      {error && <div className="text-red-600">{String(error)}</div>}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((item, idx) => (
            <GalleryCard key={(item.idGallery as string) || (item.id as string) || idx} item={item} onOpen={() => setOpenAlbum(item)} />
          ))}
        </div>
      )}

      {openAlbum && <GalleryDetail album={openAlbum} onClose={() => setOpenAlbum(null)} />}
    </div>
  );
};

export default GalleryPage;
