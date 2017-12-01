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


  EID camera = manager->createEntity();
  manager->addComponent<DimensionComponent>(camera, this->windowWidth, this->windowHeight);
  manager->addComponent<PositionComponent>(camera, 0, 0);
  manager->saveSpecial("camera", camera);

  this->resize(1200, 800);

  this->registerSystem<NetworkingSystem>(manager);
  this->registerSystem<RenderSystem>(manager);

  this->getMessages(initialData.c_str(), initialData.length());
};

/*
 *
 *  Message types:
 *  --------------
 *
 *  0. Init Game
 *  1-7. Component
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
        // this +1 makes this work on wasm for some reason...
        char* msg = new char[length + 1];
        strncpy(msg, buf + index, length);

        this->initGame(msg);

        delete [] msg;
        index += length;

        break;
      }
      case MessageDef::DELETE: {
        // we will eventually need to disambiguate between deleting a
        // component and an entity
        //auto cid = ReadBytesOfString<uint16_t>(buf, &index, size);
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);
        manager->removeEntity(eid);
        break;
      }
      case MessageDef::POSITION: {
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);

        auto x = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto y = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto direction = ReadBytesOfString<uint32_t>(buf, &index, size);

        manager->addComponent<PositionComponent>(eid, x, y, direction);
        break;
      }
      case MessageDef::RENDER: {
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);

        auto layer = ReadBytesOfString<uint8_t>(buf, &index, size);
        auto shouldTileX = ReadBytesOfString<bool>(buf, &index, size);
        auto shouldTileY = ReadBytesOfString<bool>(buf, &index, size);

        manager->addComponent<RenderComponent>(eid, layer, shouldTileX, shouldTileY);
        break;
      }
      case MessageDef::COLLISION: {
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);

        auto isStatic = ReadBytesOfString<bool>(buf, &index, size);

        auto x = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto y = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto w = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto h = ReadBytesOfString<uint32_t>(buf, &index, size);

        manager->addComponent<CollisionComponent>(eid, isStatic, x, y, w, h);
        break;
      }
      case MessageDef::DIMENSION: {
        auto eid = ReadBytesOfString<uint32_t>(buf, &index, size);

        auto w = ReadBytesOfString<uint32_t>(buf, &index, size);
        auto h = ReadBytesOfString<uint32_t>(buf, &index, size);

        manager->addComponent<DimensionComponent>(eid, w, h);

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
        break;
      }
      default: {
        printf("Error!!!");
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

}

void Renderer::loadStage(string initialPayload) {
}

void Renderer::loop(float dt) {
  SDL_Event event;
  bool transmit = false;

  // extract input information so that all systems can use it
  while (SDL_PollEvent(&event)) {
    if (event.type == SDL_QUIT) {
      this->quit();
    }

    if (event.type == SDL_KEYDOWN) {
      switch (event.key.keysym.sym)
      {
        case SDLK_UP:
          if (!(Compass::NORTH & compass)) compass += Compass::NORTH; transmit = true;
        break;
        case SDLK_RIGHT:
          if (!(Compass::EAST & compass)) compass += Compass::EAST; transmit = true;
        break;
        case SDLK_DOWN:
          if (!(Compass::SOUTH & compass)) compass += Compass::SOUTH; transmit = true;
        break;
        case SDLK_LEFT:
          if (!(Compass::WEST & compass)) compass += Compass::WEST; transmit = true;
        break;

        case SDLK_SPACE:
          if (!(Actions::MAIN & actions)) actions += Actions::MAIN; transmit = true;
        break;
        case SDLK_LSHIFT:
          if (!(Actions::SECONDARY & actions)) actions += Actions::SECONDARY; transmit = true;
        break;
        case SDLK_d:
          if (!(Actions::ATTACK1 & actions)) actions += Actions::ATTACK1; transmit = true;
        break;
      }
    }
    if (event.type == SDL_KEYUP) {
      switch (event.key.keysym.sym)
      {
        case SDLK_UP:
          if (Compass::NORTH & compass) compass -= Compass::NORTH; transmit = true;
        break;
        case SDLK_RIGHT:
          if (Compass::EAST & compass) compass -= Compass::EAST; transmit = true;
        break;
        case SDLK_DOWN:
          if (Compass::SOUTH & compass) compass -= Compass::SOUTH; transmit = true;
        break;
        case SDLK_LEFT:
          if (Compass::WEST & compass) compass -= Compass::WEST; transmit = true;
        break;

        case SDLK_SPACE:
          if (Actions::MAIN & actions) actions -= Actions::MAIN; transmit = true;
        break;
        case SDLK_LSHIFT:
          if (Actions::SECONDARY & actions) actions -= Actions::SECONDARY; transmit = true;
        break;
        case SDLK_d:
          if (Actions::ATTACK1 & actions) actions -= Actions::ATTACK1; transmit = true;
        break;
      }
    }
  }

  if (transmit) {
    char* bytes = new char[2];

    // don't need this now, but will in the future
    //*((uint8_t*)(bytes + 0)) = 1;
    *((uint8_t*)(bytes + 0)) = compass;
    *((uint8_t*)(bytes + 1)) = actions;

    string message(bytes, 2);

    socket->sendBinary(message);
    printf("%d %d\n", compass, actions);

    delete [] bytes;
    transmit = false;
  }


  for (auto& system : systems) system->update(dt);
}

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
    //auto src = calc[0];
    auto dst = calc[1];

    EID entity = manager->createEntity();

    //manager->addComponent<SpriteComponent>(entity, src.x, src.y, src.w, src.h, tileset->texture);
    manager->addComponent<PositionComponent>(entity, dst.x, dst.y);
    manager->addComponent<RenderComponent>(entity, layer);
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

