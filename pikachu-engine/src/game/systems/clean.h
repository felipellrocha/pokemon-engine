#ifndef SYSTEMCLEAN_H
#define SYSTEMCLEAN_H

#include "sdl2image.h"

#include "renderer/renderer.h"

#include "entity/entity.h"
#include "entity/system.h"

using namespace std;

class CleanSystem : public System {
public:
  void update(float dt);

  CleanSystem(EntityManager *_manager, Renderer *_game) :
  System(_manager, _game) { };

  ~CleanSystem() { }
};

#endif
