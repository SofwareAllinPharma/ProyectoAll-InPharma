import React from 'react';

interface ResumenCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  borderColor?: string;
  bgIcon?: string;
}

const ResumenCard: React.FC<ResumenCardProps> = ({
  title,
  value,
  icon,
  borderColor = '#9D977B', 
  bgIcon = '#f7f7f5',
}) => {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white border-l-4 transition hover:shadow-md"
      style={{ borderColor }}
    >
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-[#3E3529] mt-1">{value}</p>
      </div>
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full"
        style={{ backgroundColor: bgIcon }}
      >
        {icon}
      </div>
    </div>
  );
};

export default ResumenCard;
