#ifndef RENDERER_H
#define RENDERER_H

#include <cstdlib>
#include <vector>
#include <map>
#include <set>
#include <forward_list>
#include <SDL2/SDL.h>
#include <string>
#include <memory>
#include <utility>
#include <climits>

#include "sdl2image.h"
#include "exceptions.h"
#include "json/json.h"
#include "json/readjson.h"


#include "entity/entity.h"
#include "entity/system.h"

//#include "AI/node.h"
//#include "AI/behaviortree.h"
#include "AI/composite.h"
#include "AI/decorator.h"

#include "renderer/tileset.h"
#include "renderer/geometry.h"
#include "renderer/animation.h"

#include "game/components.h"
#include "game/behaviors/follow.h"
#include "game/behaviors/proximity.h"
#include "game/utils.h"
#include "game/systems/networking.h"
#include "game/systems/render.h"
#include "game/materials.h"

#include "networking/websocket.hpp"

using easywsclient::WebSocket;
using json = nlohmann::json;
using namespace std;

struct Buffer {
  const char* data;
  unsigned long size;
  int index = 0;
};

class Node;
class Transition;
class Renderer {
public:
  vector<Tileset *> tilesets;
  vector<System *> systems;

  SDL_Window *win = nullptr;
  SDL_Renderer *ren = nullptr;
  SDL_Texture *texture = nullptr;
  SDL_GLContext context = nullptr;

  WebSocket::pointer socket;

  map<string, string> mapsByName;
  map<EID, Node*> behaviors;
  map<string, string> entitiesByName;

  string gamePackage;
  string assetPath;
  EntityManager* manager;

  json entities;
  map<string, Animation> animations;
  forward_list<Transition *> incoming;
  forward_list<Transition *> outgoing;
  set<Transition *> transitions;

  Grid grid;
  map<string, SDL_Texture*> textures;

  int windowWidth = 1100;
  int windowHeight = 600;

  bool running = true;
  int compass = 0;
  int actions = 0;

  int numTransitions = 0;


  void initSocket();
  void initGame(char* message);
  void getMessages(const char* buf, size_t size);

  string getAssetPath(string asset) {
    return assetPath + asset;
  }

  void resize(int w, int h);

  void loop(float dt);
  bool isRunning() { return running; };
  void quit() { running = false; };

  template<class SystemClass, typename... Args>
  void registerSystem(Args... args) {
    SystemClass *system = new SystemClass(args..., this);
    this->systems.push_back(system);
  }

  Renderer(string initialData, string _assetPath, WebSocket::pointer socket, EntityManager* _manager, int width, int height);
  ~Renderer();
};

#endif
