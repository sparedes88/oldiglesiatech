import React from 'react';

type Video = {
  idVideo?: number | string;
  id?: number | string;
  thumbnail?: string;
  title?: string;
  speaker?: string;
  publish_date?: string;
  [key: string]: any;
};

const VideoList: React.FC<{ items: Video[] }> = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((v, idx) => (
        <div key={(v.idVideo as string) || (v.id as string) || idx} className="bg-white rounded-xl shadow hover:shadow-md p-3">
          {v.thumbnail && (
            <img src={v.thumbnail} alt={v.title} className="w-full h-44 object-cover rounded-lg" />
          )}
          <div className="mt-2">
            <div className="font-semibold text-gray-900">{v.title}</div>
            {v.speaker && <div className="text-sm text-gray-500">{v.speaker}</div>}
            {v.publish_date && <div className="text-xs text-gray-400">{new Date(v.publish_date).toLocaleDateString()}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;
