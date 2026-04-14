"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Ctx = { done: boolean; setDone: (v: boolean) => void };

const LoaderContext = createContext<Ctx>({ done: false, setDone: () => {} });

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  return (
    <LoaderContext.Provider value={{ done, setDone }}>
      {children}
    </LoaderContext.Provider>
  );
}

export const useLoaderDone = () => useContext(LoaderContext);
