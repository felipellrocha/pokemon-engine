#ifndef GAMECOMPONENTS_H
#define GAMECOMPONENTS_H

#include "sdl2image.h"
#include <string>
#include <iostream>
#include <set>
#include <map>

#include "json/json.h"
#include "renderer/compass.h"
#include "entity/entity.h"
#include "entity/component.h"
#include "game/utils.h"
#include "game/materials.h"
#include "renderer/geometry.h"
#include "renderer/compass.h"

using json = nlohmann::json;

typedef int TextureSource;
typedef int AnimationType;
typedef json script;
typedef string AIScript;
typedef int ResolverType;
typedef map<Actions, Ability*> AbilityList;

enum MessageDef {
  INIT,
  DELETE,

  POSITION,
  DIMENSION,
  SPRITE,
  RENDER,
  COLLISION,
};

struct PositionComponent : public Component {
  int x; //private
  int y; //private

  int nextX; //private
  int nextY; //private

  int direction = 0; //private

  PositionComponent(int _x, int _y)
    : x(_x), y(_y), nextX(_x), nextY(_y) { }
  PositionComponent(int _x, int _y, int _direction)
    : x(_x), y(_y), nextX(_x), nextY(_y), direction(_direction) { }

  void update(int _x, int _y, int _direction) {
    x = _x;
    y = _y;
    direction = _direction;
  }

  void update(int _x, int _y) {
    x = _x;
    y = _y;
  }
};

struct DimensionComponent : public Component {
  int w;
  int h;

  DimensionComponent(int _w, int _h) : w(_w), h(_h) {}

  void update(int _w, int _h) {
    w = _w;
    h = _h;
  }
};

struct SpriteComponent : public Component {
  int x;
  int y;
  int w;
  int h;
  TextureSource texture;

  SpriteComponent(int _x, int _y, int _w, int _h, TextureSource _texture)
      : x(_x), y(_y), w(_w), h(_h), texture(_texture) {
  }

  void update(int _x, int _y, int _w, int _h, TextureSource _texture) {
    x = _x;
    y = _y;
    w = _w;
    h = _h;
    texture = _texture;
  }
};

struct RenderComponent : public Component {
  int layer; //private
  bool shouldTileX = false;
  bool shouldTileY = false;

  RenderComponent(int _layer, bool _shouldTileX, bool _shouldTileY)
  : layer(_layer), shouldTileX(_shouldTileX), shouldTileY(_shouldTileY) { };

  RenderComponent(int _layer)
  : layer(_layer), shouldTileX(false), shouldTileY(false) { };

  void update (int _layer, bool _stx, bool _sty) {
    layer = _layer;
    shouldTileX = _stx;
    shouldTileY = _sty;
  }

  void update (int _layer) {
    layer = _layer;
  }
};

struct CollisionComponent : public Component {
  // Static colliders are things like walls, and such, that are never moving
  // keeping track of them allows us to run a small optimization until we need
  // some more heavy duty things to check for collision

  bool isStatic = false;
  bool withGravity = false;
  bool isColliding = false; //private
  ResolverType resolver;
  int x = 0;
  int y = 0;
  int w = 0;
  int h = 0;

	script onCollision = nullptr;

  set<EID> collisions; //private

  CollisionComponent(bool _isStatic, int _x, int _y, int _w, int _h)
    : isStatic(_isStatic),
      x(_x),
      y(_y),
      w(_w),
      h(_h) { };

  void update(bool _isStatic, int _x, int _y, int _w, int _h) {
    isStatic = _isStatic;
    x = _x;
    y = _y;
    w = _w;
    h = _h;
  }
};

struct CenteredCameraComponent : public Component {
  EID entity; //private

  CenteredCameraComponent(EID _entity) : entity(_entity) { };

  void update(EID _entity) {
    entity = _entity;
  }
};

struct AnimationComponent : public Component {
  AnimationType animation;
  int frame; //private
  bool animating = false; //private

  AnimationComponent(AnimationType _animation, int _frame) : animation(_animation), frame(_frame) { };
  AnimationComponent() : AnimationComponent(0, 0) { };
};



struct AIComponent : public Component {
  AIScript script;

  AIComponent() { };
};

#endif
