import { createContext, useContext, useState, ReactNode } from 'react';
import { MultiplayerService } from '@/services/multiplayer/types';
import { PeerJSService } from '@/services/multiplayer/PeerJSService';
import { SupabaseService } from '@/services/multiplayer/SupabaseService';

interface SupabaseConfig {
  url: string;
  key: string;
}

interface MultiplayerContextType {
  service: MultiplayerService | null;
  initializeService: (type: 'supabase' | 'peerjs', config?: SupabaseConfig) => MultiplayerService;
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState<MultiplayerService | null>(null);
  const [isHost, setIsHost] = useState(false);

  const initializeService = (type: 'supabase' | 'peerjs', config?: SupabaseConfig) => {
    let newService: MultiplayerService;
    if (type === 'peerjs') {
      newService = new PeerJSService();
    } else {
      // Default demo keys or from config
      const url = config?.url || (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
      const key =
        config?.key || (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';
      newService = new SupabaseService(url, key);
    }
    setService(newService);
    return newService;
  };

  return (
    <MultiplayerContext.Provider value={{ service, initializeService, isHost, setIsHost }}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
}
