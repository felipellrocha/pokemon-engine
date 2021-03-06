var chat = document.getElementById('chat');
var form = document.getElementById('form');
var message = document.getElementById('message');

function createDiv(text) {
  var div = document.createElement('div');
  div.innerHTML = text;

  return div;
}

var conn = new WebSocket(`ws://localhost:9000/socket/game/908b440b-f387-4941-9d0e-880388fde6fd`);

conn.onclose = (event) => {
  chat.appendChild(createDiv("Connection closed"));
};

conn.onmessage = (event) => {
  var messages = event.data.split('\n');
  for (var i = 0; i < messages.length; i++) {
    chat.appendChild(createDiv(messages[i]));
  }
};

form.onsubmit = () => {
  if (!conn) { return false }
  if (!message.value) { return false }

  conn.send(message.value);
  message.value = '';

  return false;
};
