import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { getAccessToken, getSelectedSchoolId } from '@/lib/authStorage';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function SocketProvider({ children }: { children: ReactNode }): JSX.Element {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const instance = io(import.meta.env.VITE_SOCKET_URL ?? window.location.origin, {
      auth: { token: getAccessToken() },
      transports: ['websocket', 'polling'],
    });

    instance.on('connect', () => {
      setIsConnected(true);
      const schoolId = user.schoolId || getSelectedSchoolId();
      if (schoolId) instance.emit('join:school', schoolId);
    });
    instance.on('disconnect', () => setIsConnected(false));

    setSocket(instance);
    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [user]);

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
