import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  fiscalYear: string;
  setFiscalYear: (fy: string) => void;
  fuel: string;
  setFuel: (f: string) => void;
  selectedState: string;
  setSelectedState: (s: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPlantId: string | null;
  setSelectedPlantId: (id: string | null) => void;
  includeLignite: boolean;
  setIncludeLignite: (inc: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [fiscalYear, setFiscalYear] = useState('2023-24');
  const [fuel, setFuel] = useState('COAL');
  const [selectedState, setSelectedState] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [includeLignite, setIncludeLignite] = useState(false);

  const handleSetIncludeLignite = (inc: boolean) => {
    setIncludeLignite(inc);
    if (inc) {
      setFuel('ALL');
    } else {
      setFuel('COAL');
    }
  };

  return (
    <FilterContext.Provider
      value={{
        fiscalYear,
        setFiscalYear,
        fuel,
        setFuel,
        selectedState,
        setSelectedState,
        activeTab,
        setActiveTab,
        selectedPlantId,
        setSelectedPlantId,
        includeLignite,
        setIncludeLignite: handleSetIncludeLignite,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
