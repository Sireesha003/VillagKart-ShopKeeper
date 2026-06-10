import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(storeId: number) {
  const socket = useRef<Socket>();

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001');
    socket.current.emit('join:store', { storeId });

    return () => {
      socket.current?.disconnect();
    };
  }, [storeId]);

  return socket;
}
