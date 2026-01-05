import React from 'react';
import DirectoryCard from './DirectoryCard';

type Member = {
  id?: number | string;
  idUsuario?: number | string;
  [key: string]: any;
};

const DirectoryList: React.FC<{ members: Member[] }> = ({ members }) => {
  if (!members || members.length === 0) {
    return <div className="text-center text-gray-500 py-8">No directory members found.</div>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m, idx) => (
        <DirectoryCard key={(m.id as string) || (m.idUsuario as string) || idx} member={m} />
      ))}
    </div>
  );
};

export default DirectoryList;
