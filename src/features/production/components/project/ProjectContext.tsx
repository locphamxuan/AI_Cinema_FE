'use client';

import { createContext, useContext } from 'react';
import type { ProjectDetail } from '@/types/production';
import type { ProjectCapabilities } from '../../lib/capabilities';
import type { ProductionBase } from '../../lib/routes';

export interface ProjectContextValue {
  project: ProjectDetail;
  caps: ProjectCapabilities;
  base: ProductionBase;
  /** Loads the project again after a change. */
  reload: () => Promise<void>;
}

const Context = createContext<ProjectContextValue | null>(null);

export const ProjectProvider = Context.Provider;

export function useProject(): ProjectContextValue {
  const value = useContext(Context);
  if (!value) throw new Error('useProject must be used inside ProjectProvider');
  return value;
}
