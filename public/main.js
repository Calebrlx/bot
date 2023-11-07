// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:3000');

// Connection opened
socket.addEventListener('open', function(event) {
  console.log('Connected to WS Server')
});

// Listen for messages
socket.addEventListener('message', function(event) {
  const logEntry = JSON.parse(event.data);
  if(logEntry.type === 'log') {
    const terminal = document.getElementById('terminal');
    // Append received message to the terminal
    terminal.textContent += logEntry.message + '\n';
    // Auto scroll to the bottom of the terminal
    terminal.scrollTop = terminal.scrollHeight;
  }
});