const net = require('net');
const port = 1234;
const host = 'localhost';

const server = net.createServer();

server.listen(port, host, () => {
  console.log('TCP server listening on' + host + port);
});
let state = 0;
let count = 0;
let sockets = [];
server.on('connection', (socket) => {
  var clientAddress = socket.remoteAddress + ' : ' + socket.remotePort;
  console.log('new client connected: ' + clientAddress);
  sockets.push(socket);
  socket.on('data', (data) => {
    console.log('Client: ' + clientAddress + ' : ' + data);
    sockets.forEach((sock) => {
      sock.write(socket.remoteAddress + ':' + socket.remotePort + " said " + data + '\n');
    });

    switch (state) {
      case 0:
        if (data.toString().toLowerCase() == 'hello') {
          socket.write('Hello Player 1!\n' + 'Wait for another player!')
          state = 1;
          console.log('state=' + state)
        }
        else socket.write('INVALID : Enter "Hello"')
        break;
      case 1:
        if (data.toString().toLowerCase() == 'hello') {
          socket.write('Hello Player 2!\n' + 'Start Game!')
          state = 2;
          console.log('state=' + state)
        }
        else socket.write('INVALID')
        break;
      case 2:
        try {
          let num = parseInt(data || 0)

          if (num > 0 && num <= 3) {
            count += num;
            console.log('count=' + count)
            socket.write('Total: ' + count);
          }
          else if (num < 1 || num > 3) sock.write('Invalide, please selects 1, 2 or 3');

          if (count >= 20) {
            socket.write('\nTotal over 20 !!! \n' + 'Game Over');
            state = 3
          }
        } catch (e) {
          socket.write('SERVER HAS EXCEPTION')
        }
        break;
      case 3:
        if (data.toString().toLowerCase() == 'bye') {
          socket.write('END')
          console.log(state)
          socket.end()
        }
        else socket.write('INVALID')
        break;
    }
  });


  socket.on('close', (data) => {
    let index = sockets.findIndex((o) => {
      return o.remoteAddress === socket.remoteAddress && o.remotePort === socket.remotePort;
    })
    if (index !== -1) sockets.splice(index, 1);
    sockets.forEach((sock) => {
      sock.write(`${clientAddress} disconnected\n`);
    });
    console.log(`connection closed: ${clientAddress}`);
  });

  socket.on('error', (err) => {
    console.log(`Error occurred in ${clientAddress}: ${err.message}`);
  });
});
