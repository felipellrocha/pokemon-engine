#include "renderer.h"

Renderer::Renderer(string initialData, string _assetPath, WebSocket::pointer _socket, EntityManager* _manager, int _windowWidth, int _windowHeight)
  : socket(_socket), assetPath(_assetPath), manager(_manager), windowWidth(_windowWidth), windowHeight(_windowHeight) {
  this->running = true;

  if (SDL_Init(SDL_INIT_VIDEO) != 0) {
    std::cout << "SDL: " << SDL_GetError() << std::endl;
    SDL_Quit();
    throw renderer_error();
  }

  // creating a window
  this->win = SDL_CreateWindow(
    "Game",
    0, 0,
    this->windowWidth, this->windowHeight,
    SDL_WINDOW_SHOWN | SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE
  );
  if (this->win == nullptr) {
    std::cout << "SDL_CreateWindow error: " << SDL_GetError() << std::endl;
    SDL_Quit();
    throw renderer_error();
  }

  // creating a renderer
  this->ren = SDL_CreateRenderer(
    this->win,
    -1,
    SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC | SDL_RENDERER_TARGETTEXTURE
  );

  if (this->ren == nullptr) {
    SDL_DestroyWindow(this->win);
    std::cout << "SDL_CreateRenderer error: " << SDL_GetError() << std::endl;
    SDL_Quit();
    throw renderer_error();
  }
  this->texture = SDL_CreateTexture(
    this->ren,
    SDL_PIXELFORMAT_RGBA8888,
    SDL_TEXTUREACCESS_TARGET,
    this->windowWidth, this->windowHeight
  );

  if( this->texture == NULL ) {
    printf( "Unable to create blank texture! SDL Error: %s\n", SDL_GetError() );
  }

  this->context = SDL_GL_CreateContext(this->win);

  if ((IMG_Init(IMG_INIT_PNG) & IMG_INIT_PNG) != IMG_INIT_PNG){
    std::cout << "IMG_Init Error: " << SDL_GetError() << std::endl;
    SDL_Quit();
    throw renderer_error();
  }
  
  //Initialize SDL_ttf
  if(TTF_Init() == -1) {
    printf( "SDL_ttf could not initialize! SDL_ttf Error: %s\n", TTF_GetError() );
    SDL_Quit();
    throw renderer_error();
  }
  
  if (glewInit() == -1) {
    printf( "GLEW could not initialize!" );
    SDL_Quit();
    throw renderer_error();
  }
  
  SDL_SetRenderDrawBlendMode(this->ren, SDL_BLENDMODE_BLEND);
  /*Buffer buffer = Buffer{
    initialData.c_str(),
    initialData.size(),
  };*/

  this->getMessages(initialData.c_str(), initialData.length());
  //this->initGame(initialData);
};

/*
 *
 *  Message types:
 *  --------------
 *
 *  0. Init Game
 *  1+. Component
 *
 */

void Renderer::getMessages(const char* buf, size_t size) {
  int index = 0;

  while (index < size) {
    uint16_t msgType = ReadBytesOfString<uint16_t>(buf, &index, size);

    switch (msgType) {
      case MessageDef::INIT: {
        // read message length
        auto length = ReadBytesOfString<uint64_t>(buf, &index, size);
        char* msg = new char[length];
        strncpy(msg, buf + index, length);

        printf("init! %s\n", msg);
        this->initGame(msg);

        delete [] msg;
        index += length + 1;

        break;
      }
      case MessageDef::POSITION: {
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);

        auto x = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto y = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto position = ReadBytesOfString<uint32_t>(buf, &index, size);

        manager->addComponent<PositionComponent>(eid, x, y, position);
        printf("Position(%d): %d, %d, %d\n", eid, x, y, position);
        break;
      }
      case MessageDef::RENDER: {
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);

        auto layer = ReadBytesOfString<uint8_t>(buf, &index, size);
        auto shouldTileX = ReadBytesOfString<bool>(buf, &index, size);
        auto shouldTileY = ReadBytesOfString<bool>(buf, &index, size);

        manager->addComponent<RenderComponent>(eid, layer, shouldTileX, shouldTileY);
        printf("Render(%d): %d, %d, %d\n", eid, layer, shouldTileX, shouldTileY);
        break;
      }
      case MessageDef::DIMENSION: {
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);

        auto w = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto h = ReadBytesOfString<uint32_t>(buf, &index, size);

        manager->addComponent<DimensionComponent>(eid, w, h);
        printf("Dimension(%d): %d, %d\n", eid, w, h);

        break;
      }
      case MessageDef::SPRITE: {
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);

        auto x = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto y = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto w = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto h = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto textureIndex = ReadBytesOfString<uint32_t>(buf, &index, size);

        manager->addComponent<SpriteComponent>(eid, x, y, w, h, textureIndex);
        printf("Sprite(%d): %d, %d, %d, %d, %d\n", eid, x, y, w, h, textureIndex);
        break;
      }
    }
  }
}

void Renderer::initGame(char* initialData) {
  json game_data = json::parse(initialData);
  json maps = game_data.at("maps");

  for (auto& element : json::iterator_wrapper(maps)) {
    auto map = element.value();

    string name = map.at("name").get<string>();
    string id = map.at("id").get<string>();
    mapsByName[name] = id;
  }

  this->entities = game_data.at("entities");

  for (auto& element : json::iterator_wrapper(entities)) {
    string id = element.key();
    auto entity = element.value();
    string name = entity.at("name").get<string>();

    entitiesByName[name] = id;
  }

  json textures = game_data.at("tilesets");
  for (auto& element : json::iterator_wrapper(textures)) {
    auto texture = element.value();
    string name = texture.at("src");
    string src = getAssetPath(texture.at("src"));

    this->textures[name] = loadTexture(this->ren, src);
  }

  this->grid.tile_w = game_data.at("tile").at("width").get<int>();
  this->grid.tile_h = game_data.at("tile").at("height").get<int>();
  //this->grid.columns = game_data.at("grid").at("columns").get<int>();
  //this->grid.rows = game_data.at("grid").at("rows").get<int>();


  int mapIndex = game_data.at("initialMap").get<int>();
  json currentMap = game_data.at("maps").at(mapIndex);
  string levelId = currentMap.at("id").get<string>();

  auto tileset_data = game_data.at("tilesets");
  for (uint i = 0; i < tileset_data.size(); i++) {
    auto tileset = tileset_data.at(i);

    int rows = tileset.at("rows").get<int>();
    int columns = tileset.at("columns").get<int>();
    string type = tileset.at("type").get<string>();
    string src = tileset.at("src").get<string>();
    auto tr = tileset.at("terrains");
    map<int, string> terrains;

    for (auto& element : json::iterator_wrapper(tr)) {
      int key = stoi(element.key());
      string value = element.value().at("type").get<string>();
      terrains[key] = value;
    }

    SDL_Texture *texture = this->textures[src];

    Tileset *t = new Tileset(rows, columns, type, texture, terrains);

    this->tilesets.push_back(t);
  }

  auto anims = game_data.at("animations");
  for (auto &i : json::iterator_wrapper(anims)) {
    string key = i.key();
    auto animation = i.value();

    Animation anim = Animation();

    anim.id = animation.at("id").get<string>();
    anim.numberOfFrames = animation.at("numberOfFrames").get<int>();

    auto keyframes = animation.at("keyframes");
    for (auto &j : json::iterator_wrapper(keyframes)) {
      int key = stoi(j.key());
      json value = j.value();

      SDL_Rect r;
      r.x = value.at("x").get<int>();
      r.y = value.at("y").get<int>();
      r.w = value.at("w").get<int>();
      r.h = value.at("h").get<int>();

      anim.keyframes[key] = r;
    }

    this->animations[key] = anim;
  }

  EID camera = manager->createEntity();
  manager->addComponent<DimensionComponent>(camera, this->windowWidth, this->windowHeight);
  manager->addComponent<PositionComponent>(camera, 0, 0);
  manager->saveSpecial("camera", camera);

  //string initialPayload = game_data.at("InitialPayload").dump();
  //int len = initialPayload.size();
  //for (int i = 0; i < len; i++) printf("%d", initialPayload[i]);

  //this->loadStage(initialPayload);

  //this->getComponentsFromBinary(initialPayload);
  this->resize(1200, 800);


  this->registerSystem<InputSystem>(manager);
  this->registerSystem<NetworkingSystem>(manager);
  this->registerSystem<CameraSystem>(manager);
  this->registerSystem<RenderSystem>(manager);
}

void Renderer::loadStage(string initialPayload) {

}

void Renderer::getComponentsFromBinary(string d) {
  /*
  const char* data = d.c_str();
  Buffer buffer = Buffer{
    data,
    d.size(),
  };
  
  int CID = ReadBytes<uint8_t>(buffer);
  printf("CID: %d\n", CID);

  int EID = ReadBytes<uint64_t>(buffer);
  printf("EID: %d\n", EID);

  if (CID == ComponentDef::HEALTH) {
    int ch = ReadBytes<uint8_t>(buffer);
    int mh = ReadBytes<uint8_t>(buffer);
    int ce = ReadBytes<uint8_t>(buffer);
    int me = ReadBytes<uint8_t>(buffer);

    printf("ch: %d, mh: %d, ce: %d, me: %d\n", ch, mh, ce, me);
  }
  else if (CID == ComponentDef::POSITION) {
    int x = ReadBytes<uint32_t>(buffer);
    int y = ReadBytes<uint32_t>(buffer);
    int position = ReadBytes<uint32_t>(buffer);

    printf("x: %d, y: %d, position: %d\n", x, y, position);
  }

  for (int i = 0; i < 100; i++) {
    printf("%d ", buffer.data[i]);
  }
  printf("\n");
   */
}


void Renderer::loop(float dt) {
  SDL_Event event;
  //printf("loop");
  // extract input information so that all systems can use it
  while (SDL_PollEvent(&event)) {
    if (event.type == SDL_QUIT) {
      this->quit();
    }

    if (event.type == SDL_KEYDOWN) {
      switch (event.key.keysym.sym)
      {
        case SDLK_UP:
          if (!(Compass::NORTH & compass)) compass += Compass::NORTH;
        break;
        case SDLK_RIGHT:
          if (!(Compass::EAST & compass)) compass += Compass::EAST;
        break;
        case SDLK_DOWN:
          if (!(Compass::SOUTH & compass)) compass += Compass::SOUTH;
        break;
        case SDLK_LEFT:
          if (!(Compass::WEST & compass)) compass += Compass::WEST;
        break;
        case SDLK_SPACE:
          if (!(Actions::MAIN & actions)) actions += Actions::MAIN;
        break;
        case SDLK_LSHIFT:
          if (!(Actions::SECONDARY & actions)) actions += Actions::SECONDARY;
        break;
        case SDLK_d:
          if (!(Actions::ATTACK1 & actions)) actions += Actions::ATTACK1;
        break;
      }
    }
    if (event.type == SDL_KEYUP) {
      switch (event.key.keysym.sym)
      {
        case SDLK_UP:
          if (Compass::NORTH & compass) compass -= Compass::NORTH;
        break;
        case SDLK_RIGHT:
          if (Compass::EAST & compass) compass -= Compass::EAST;
        break;
        case SDLK_DOWN:
          if (Compass::SOUTH & compass) compass -= Compass::SOUTH;
        break;
        case SDLK_LEFT:
          if (Compass::WEST & compass) compass -= Compass::WEST;
        break;
        case SDLK_SPACE:
          if (Actions::MAIN & actions) actions -= Actions::MAIN;
        break;
        case SDLK_LSHIFT:
          if (Actions::SECONDARY & actions) actions -= Actions::SECONDARY;
        break;
        case SDLK_d:
          if (Actions::ATTACK1 & actions) actions -= Actions::ATTACK1;
        break;
      }
    }
  }

  for (auto& system : systems) system->update(dt);
}

void Renderer::runScript(json commands) {
  for (auto &command : commands) {
    cout << command << endl;
		if (command.at("name").get<string>() == "changeMap") {
      string level = command.at("parameters").at("map").at("value").get<string>();
      float duration = command.at("parameters").at("duration").at("value").get<float>();
      this->addTransition<FadeOutTransition>(level, duration);
		}
	}
};

void Renderer::createTile(json& data, int layer, int index) {
  json node = data.at(index);

  int setIndex = node.at(0).get<int>();
  int tileIndex = node.at(1).get<int>();

  vector<array<rect, 2>> sources;
  Tileset* tileset = tilesets[setIndex];
  int surrounding = this->grid.findSurroundings(node, index, data);

  if (tileset->type == "tile") {
    sources = simpleTile::calculateAll(tileIndex, index, tileset, &grid);
  }
  else if (tileset->terrains[tileIndex] == "6-tile") {
    sources = sixTile::calculateAll(tileIndex, index, surrounding, tileset, &grid);
  }
  else if (tileset->terrains[tileIndex] == "4-tile") {
    sources = fourTile::calculateAll(tileIndex, index, surrounding, tileset, &grid);
  }
  for (auto& calc : sources) {
    auto src = calc[0];
    auto dst = calc[1];

    EID entity = manager->createEntity();

    //manager->addComponent<SpriteComponent>(entity, src.x, src.y, src.w, src.h, tileset->texture);
    manager->addComponent<PositionComponent>(entity, dst.x, dst.y);
    manager->addComponent<RenderComponent>(entity, layer);
  }
}

void Renderer::createEntityByData(json& data, int layer, int index) {
  json node = data.at(index);

  string entityId = node.at(1).get<string>();
  createEntityByID(entityId, layer, index);
}

// if you don't care about where it's placed rendering wise (If entity has no
// rendering component)
void Renderer::createEntityByID(string entityId) {
  createEntityByID(entityId, 0, 0);
}

// if you know the coordinates
void Renderer::createEntityByID(string entityId, int layer, int x, int y, int w, int h) {
  createEntity(entityId, layer, x, y, w, h);
}

void Renderer::createEntityByID(string entityId, int layer, int index) {
  int x = this->grid.tile_w * this->grid.getX(index);
  int y = this->grid.tile_h * this->grid.getY(index);
  int w = this->grid.tile_w;
  int h = this->grid.tile_h;

  createEntity(entityId, layer, x, y, w, h);
}

void Renderer::createEntity(string entityId, int layer, int x, int y, int w, int h) {
  json entity_definition = entities.at(entityId);
  json components = entity_definition.at("components");
  string name = entity_definition.at("name").get<string>();

  EID entity = manager->createEntity();

  if (name == "player") {
    manager->saveSpecial("player", entity);
  }

  if (name == "enemy") {
    auto follow = makeBehavior<Follower>(entity);
    auto proximity = makeBehavior<Proximity>(entity, 50);
    auto inverter = makeBehavior<Inverter>(entity);
    auto sequence = makeBehavior<Sequence>(entity);
    inverter->setChild(proximity);
    sequence->addChild(inverter);
    sequence->addChild(follow);

    behaviors[entity] = sequence;

    manager->addComponent<AIComponent>(entity);
  }

  for (uint k = 0; k < components.size(); k++) {
    auto component = components.at(k);
    string name = component.at("name").get<string>();

    if (name == "CollisionComponent") {
      auto members = component.at("members");
      bool isStatic = members.at("isStatic").at("value").get<bool>();
      int x = members.at("x").value("value", 0);
      int y = members.at("y").value("value", 0);
      int ww = members.at("w").value("value", 0);
      int hh = members.at("h").value("value", 0);
      int resolver = members.at("resolver").value("value", 0);

      auto component = manager->addComponent<CollisionComponent>(
        entity,
        isStatic,
        resolver,
        x,
        y,
        (ww > 0) ? ww : (w > 0) ? w : this->grid.tile_w,
        (hh > 0) ? hh : (h > 0) ? h : this->grid.tile_h
      );

      if (!members.at("onCollision").at("value").is_null()) {
        component->onCollision = members.at("onCollision").at("value");
      }
    }
    else if (name == "PositionComponent") {
      manager->addComponent<PositionComponent>(entity, x, y);
    }
    else if (name == "DimensionComponent") {
      manager->addComponent<DimensionComponent>(entity, w, h);
    }
    else if (name == "HealthComponent") {
      int ch = component.at("members").at("currentHearts").at("value").get<int>();
      int mh = component.at("members").at("maxHearts").at("value").get<int>();
      int ce = component.at("members").at("currentEnergy").at("value").get<int>();
      int me = component.at("members").at("maxEnergy").at("value").get<int>();

      manager->addComponent<HealthComponent>(entity, ch, mh, ce, me);
    }
    else if (name == "SpriteComponent") {
      auto members = component.at("members");
      string source = members.at("src").at("value").get<string>();

      int x = members.at("x").value("value", 0);
      int y = members.at("y").value("value", 0);
      int w_v = members.at("w").value("value", 0);
      int h_v = members.at("h").value("value", 0);

      SDL_Texture *texture = this->textures[source];

      //manager->addComponent<SpriteComponent>(entity, x, y, (w_v) ? w_v : w, (h_v) ? h_v : h, texture);
    }
    else if (name == "AbilityComponent") {
      auto component = manager->addComponent<AbilityComponent>(entity);
      component->makeAbility(
        Actions::ATTACK1,
        AbilityType::RANGE,
        ElementType::FIRE,
        0.7f,
        5
      );
    }
    else if (name == "InputComponent") {
      manager->addComponent<InputComponent>(entity);
    }
    else if (name == "RenderComponent") {
      auto members = component.at("members");
      bool shouldTileX = members.at("shouldTileX").at("value").get<bool>();
      bool shouldTileY = members.at("shouldTileY").at("value").get<bool>();

      manager->addComponent<RenderComponent>(entity, layer, shouldTileX, shouldTileY);
    }
    else if (name == "MovementComponent") {
      int sX = component.at("members").at("slow").at("value").at("x").get<int>();
      int sY = component.at("members").at("slow").at("value").at("y").get<int>();
      int fX = component.at("members").at("fast").at("value").at("x").get<int>();
      int fY = component.at("members").at("fast").at("value").at("y").get<int>();

      manager->addComponent<MovementComponent>(entity, sX, sY, fX, fY);
    }
    else if (name == "WalkComponent") {
      manager->addComponent<WalkComponent>(entity);
    }
    else if (name == "CenteredCameraComponent") {
      EID camera = manager->getSpecial("camera");
      manager->addComponent<CenteredCameraComponent>(camera, entity);
    }
  }
}

void Renderer::resize(int w, int h) {
  SDL_SetWindowSize(win, w, h);
  SDL_DestroyTexture(this->texture);
  this->texture = SDL_CreateTexture(
    this->ren,
    SDL_PIXELFORMAT_RGBA8888,
    SDL_TEXTUREACCESS_TARGET,
    w, h
  );
  auto camera = manager->getSpecial("camera");
  if (camera >= 0) {
    auto dim = manager->getComponent<DimensionComponent>(camera);
    dim->w = w;
    dim->h = h;
  }
}


Renderer::~Renderer() {
  socket->close();
  SDL_DestroyTexture(this->texture);
  SDL_DestroyRenderer(this->ren);
  SDL_DestroyWindow(this->win);
}

