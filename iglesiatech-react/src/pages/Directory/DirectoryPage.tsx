import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DirectoryList from './DirectoryList';
import { apiService } from '../../apiService';

type Member = Record<string, any>;

const DirectoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const raw = await apiService.getDirectory(Number(id));
        const data = Array.isArray(raw) ? raw : (raw?.data || (raw?.items as any) || (raw?.result as any) || Object.values(raw || {}));
        setMembers(data as Member[]);
      } catch (e) {
        console.error('Directory load error:', e);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Directory</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <DirectoryList members={members} />
      )}
    </div>
  );
};

export default DirectoryPage;
