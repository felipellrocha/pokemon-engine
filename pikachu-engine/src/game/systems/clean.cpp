#include "networking.h"

void CleanSystem::update(float dt) {
  for (auto eid : game->toDelete) {
    manager->removeEntity(eid);
  }
  game->toDelete.clear();
};

