import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../../apiService';
import VideoList from './VideoList';
import AudioList from './AudioList';
import DocumentList from './DocumentList';

type MediaItem = Record<string, any>;

const normalize = (videosRaw: any): { videos: MediaItem[]; audios: MediaItem[]; documents: MediaItem[] } => {
  const items: any[] = Array.isArray(videosRaw) ? videosRaw : [];
  const videos: MediaItem[] = [];
  const audios: MediaItem[] = [];
  const documents: MediaItem[] = [];

  for (const v of items) {
    const type = String(v.type || v.mediaType || v.category || '').toLowerCase();
    const title = v.title || v.name || v.descripcion || 'Untitled';
    const url = v.url || v.link || v.src || v.videoUrl || v.mediaUrl;
    const thumb = v.thumb || v.thumbnail || v.image || v.cover || v.poster || null;
    const common = { ...v, title, url, thumbnail: thumb };

    if (type.includes('audio') || type === 'mp3' || (url && /\.(mp3|wav|m4a)(\?|$)/i.test(url))) {
      audios.push(common);
    } else if (type.includes('doc') || (url && /\.(pdf|docx?|pptx?|xlsx?)(\?|$)/i.test(url))) {
      documents.push(common);
    } else {
      videos.push(common);
    }
  }
  return { videos, audios, documents };
};

const MediaPage: React.FC<{ idIglesia: number }> = ({ idIglesia }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({ videos: [] as MediaItem[], audios: [] as MediaItem[], documents: [] as MediaItem[] });
  const [tab, setTab] = useState<'videos' | 'audios' | 'documents'>('videos');

  useEffect(() => {
    if (!idIglesia) return;
    setLoading(true);
    setError(null);
    apiService.getVideos(idIglesia)
      .then((resp) => {
        const normalized = normalize(resp);
        setData(normalized);
      })
      .catch((e: any) => setError(e?.message || 'Failed to load media'))
      .finally(() => setLoading(false));
  }, [idIglesia]);

  const counts = useMemo(() => ({
    videos: data.videos.length,
    audios: data.audios.length,
    documents: data.documents.length,
  }), [data]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Media</h1>

      <div className="flex gap-2 mb-6">
        {(['videos','audios','documents'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full border ${tab===t ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
            {t.charAt(0).toUpperCase()+t.slice(1)}{counts[t] ? ` (${counts[t]})` : ''}
          </button>
        ))}
      </div>

      {loading && <div>Loading media…</div>}
      {error && <div className="text-red-600">{String(error)}</div>}

      {!loading && !error && (
        <>
          {tab==='videos' && <VideoList items={data.videos} />}
          {tab==='audios' && <AudioList items={data.audios} />}
          {tab==='documents' && <DocumentList items={data.documents} />}
        </>
      )}
    </div>
  );
};

export default MediaPage;
