import React from 'react';

export default function ModalHeader({ children }: { children: React.ReactNode }) {
  return (
    // rounded top corners to match modal container
    <div className="bg-[#5d5448] text-white px-6 py-4 rounded-t-xl">
      <h2 className="text-lg font-semibold">{children}</h2>
    </div>
  );
}
