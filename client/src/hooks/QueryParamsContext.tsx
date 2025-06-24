// QueryParamsContext.tsx
'use client'
import React, { createContext, useContext, useState } from 'react';

type QueryParamsContextType = {
  queryParams: URLSearchParams;
  setQueryParams: React.Dispatch<React.SetStateAction<URLSearchParams>>;
};

const QueryParamsContext = createContext<QueryParamsContextType | undefined>(undefined);

export const QueryParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryParams, setQueryParams] = useState(new URLSearchParams(""));

  return (
    <QueryParamsContext.Provider value={{ queryParams, setQueryParams }}>
      {children}
    </QueryParamsContext.Provider>
  );
};

// Custom hook để dùng trong các component khác
export const useQueryParams = () => {
  const context = useContext(QueryParamsContext);
  if (!context) {
    throw new Error("useQueryParams phải được dùng trong QueryParamsProvider");
  }
  return context;
};
