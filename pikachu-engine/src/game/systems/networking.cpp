#include "networking.h"

void NetworkingSystem::update(float dt) {
  if (game->socket && game->socket->getReadyState() != WebSocket::CLOSED) {
    WebSocket::pointer wsp = game->socket;

    game->socket->poll();
    game->socket->dispatch([wsp](const string& message) {
      printf("> %s\n", message.c_str());
    });
  }
};

