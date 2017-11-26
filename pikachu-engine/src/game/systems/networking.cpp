#include "networking.h"

void NetworkingSystem::update(float dt) {
  if (game->socket->getReadyState() != WebSocket::CLOSED) {
    //printf("Am i here?");
    WebSocket::pointer wsp = game->socket;

    game->socket->poll();
    game->socket->dispatch([wsp](const string& message) {
      printf("Message received!\n> %s\n", message.c_str());
    });
  }
};

