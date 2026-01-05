import React from 'react';

type Audio = {
  idAudio?: number | string;
  id?: number | string;
  title?: string;
  speaker?: string;
  url?: string;
  [key: string]: any;
};

const AudioList: React.FC<{ items: Audio[] }> = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a, idx) => (
        <div key={(a.idAudio as string) || (a.id as string) || idx} className="bg-white rounded-xl shadow hover:shadow-md p-4 flex items-center gap-3">
          <div className="text-3xl">🎵</div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{a.title}</div>
            {a.speaker && <div className="text-sm text-gray-500">{a.speaker}</div>}
          </div>
          {a.url && (
            <a className="text-blue-600 hover:underline" href={a.url} target="_blank" rel="noopener noreferrer">Listen</a>
          )}
        </div>
      ))}
    </div>
  );
};

export default AudioList;
