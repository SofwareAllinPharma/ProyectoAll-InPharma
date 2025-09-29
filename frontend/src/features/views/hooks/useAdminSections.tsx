import React, { useState } from 'react';

export interface AdminSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

export const useAdminSections = (sections: AdminSection[]): {
  activeSection: string;
  setActiveSection: (section: string) => void;
  renderContent: () => React.ReactElement;
  renderNavigation: () => React.ReactElement[];
} => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || 'resumen');

  const renderContent = () => {
    const currentSection = sections.find(section => section.id === activeSection);
    if (!currentSection) return <div>Sección no encontrada</div>;
    
    const Component = currentSection.component;
    return <Component />;
  };

  const renderNavigation = () => {
    return sections.map((section) => (
      <button
        key={section.id}
        onClick={() => setActiveSection(section.id)}
        className={`w-full flex items-center gap-2 px-2 py-3 text-sm rounded-md mb-1 transition-colors ${
          activeSection === section.id
            ? 'bg-[#7c6a55] text-white'
            : 'text-gray-300 hover:bg-[#7c6a55] hover:text-white'
        }`}
      >
        {section.icon}
        {section.label}
      </button>
    ));
  };

  return {
    activeSection,
    setActiveSection,
    renderContent,
    renderNavigation,
  };
};