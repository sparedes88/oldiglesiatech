import React from 'react';

type Member = {
  id?: number | string;
  idUsuario?: number | string;
  photo?: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
};

const DirectoryCard: React.FC<{ member: Member }> = ({ member }) => {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition p-4 flex gap-4 items-start">
      {member.photo && (
        <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
        <p className="text-sm text-blue-600 font-medium">{member.role || 'Member'}</p>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          {member.email && (
            <div>📧 <a className="text-blue-600 hover:underline" href={`mailto:${member.email}`}>{member.email}</a></div>
          )}
          {member.phone && (
            <div>📞 <a className="text-blue-600 hover:underline" href={`tel:${member.phone}`}>{member.phone}</a></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryCard;
