import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    logger.info('Socket client connected:', socket.id);

    socket.on('disconnect', () => {
      logger.info('Socket client disconnected:', socket.id);
    });
  });
}
