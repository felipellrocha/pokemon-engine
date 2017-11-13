#ifndef SYSTEMNETWORKING_H
#define SYSTEMNETWORKING_H

#include "sdl2image.h"

#include "renderer/renderer.h"

#include "entity/entity.h"
#include "entity/system.h"

#include "networking/websocket.hpp"

using easywsclient::WebSocket;
using namespace std;

class NetworkingSystem : public System {
public:
  void update(float dt);

  NetworkingSystem(EntityManager *_manager, Renderer *_game) :
  System(_manager, _game) { };

  ~NetworkingSystem() { }
};

#endif
