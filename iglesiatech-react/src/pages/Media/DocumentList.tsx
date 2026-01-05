import React from 'react';

type Document = {
  idDocument?: number | string;
  id?: number | string;
  title?: string;
  type?: string;
  url?: string;
  [key: string]: any;
};

const DocumentList: React.FC<{ items: Document[] }> = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((d, idx) => (
        <div key={(d.idDocument as string) || (d.id as string) || idx} className="bg-white rounded-xl shadow hover:shadow-md p-4 flex items-center gap-3">
          <div className="text-3xl">📄</div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{d.title}</div>
            {d.type && <div className="text-sm text-gray-500">{d.type}</div>}
          </div>
          {d.url && (
            <a className="text-blue-600 hover:underline" href={d.url} target="_blank" rel="noopener noreferrer">Open</a>
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
