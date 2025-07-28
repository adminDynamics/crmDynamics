export default (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Cliente WebSocket conectado');

    socket.on('mensaje', (data) => {
      io.emit('mensaje', data);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Cliente WebSocket desconectado');
    });
  });
};