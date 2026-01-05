import React from 'react';

const iconMap: Record<string, string> = {
  facebook: '📘',
  instagram: '📸',
  youtube: '▶️',
  twitter: '𝕏',
  whatsapp: '🟢',
  link: '🔗'
};

type EzLink = {
  id?: number | string;
  icon?: string;
  url?: string;
  title?: string;
  [key: string]: any;
};

const EzLinkCard: React.FC<{ link: EzLink }> = ({ link }) => {
  const icon = (link.icon && iconMap[link.icon]) || iconMap.link;
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow hover:shadow-md transition p-4 flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-gray-900 font-semibold">{link.title}</div>
        <div className="text-sm text-gray-500 break-all">{link.url}</div>
      </div>
    </a>
  );
};

export default EzLinkCard;
