#include "networking.h"

void NetworkingSystem::update(float dt) {
  auto game = this->game;

  if (game->socket->getReadyState() != WebSocket::CLOSED) {
    game->socket->poll(0);
    
    game->socket->dispatch([game](const string& message) {
      game->getMessages(message.c_str(), message.length());
    });
  }
};

