import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../apiService';
import EzLinkCard from './EzLinkCard';

type EzLink = Record<string, any>;

const EzLinkPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<EzLink[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const raw = await apiService.getEzLinks(Number(id));
        const data = Array.isArray(raw) ? raw : (raw?.data || (raw?.items as any) || (raw?.result as any) || Object.values(raw || {}));
        setLinks(data as EzLink[]);
      } catch (e) {
        console.error('EzLinks load error:', e);
        setLinks([]);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">EzLinks</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : links.length === 0 ? (
        <div className="text-gray-500">No links found.</div>
      ) : (
        <div className="grid gap-3">
          {links.map((l, idx) => (
            <EzLinkCard key={(l.id as string) || idx} link={l} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EzLinkPage;
