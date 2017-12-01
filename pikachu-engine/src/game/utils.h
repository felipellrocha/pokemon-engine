#ifndef GAMEUTILS_H
#define GAMEUTILS_H

#include <math.h>
#include <string>
#include <cstring>
#include <assert.h>
#include "entity/entity.h"
#include "sdl2image.h"
#include "exceptions.h"

struct Collision {
  public:
    EID e1;
    EID e2;

    int r1;
    int r2;

    Collision (EID _e1, EID _e2, int _r1, int _r2)
      : e1(_e1), e2(_e2), r1(_r1), r2(_r2) { };

    bool operator< (Collision const &other) const {
      EID e1l = min(e1, e2);
      EID e1h = max(e1, e2);
      EID e2l = min(other.e1, other.e2);
      EID e2h = max(other.e1, other.e2);

      int r1l = min(r1, r2);
      int r1h = max(r1, r2);
      int r2l = min(other.r1, other.r2);
      int r2h = max(other.r1, other.r2);
     
      return e1l < e2l || e1h < e2h || r1l < r2l || r1h < r2h;
    }
};

bool isOverlapping(int min1, int max1, int min2, int max2);
int calculateOverlap(int min1, int max1, int min2, int max2);

SDL_Texture* loadTexture(SDL_Renderer *ren, string src);

template<typename Type>
Type ReadBytesOfString(const char* buffer, int* index, int totalSize) {
  int size = sizeof(Type);
  //assert(*index + size <= totalSize);

  Type value;
  value = *((Type*)(buffer + *index));
  *index += size;
  return value;
}

template<typename Type>
char* WriteVarToBytes(Type var) {
  int size = sizeof(var);
  char* output = new char[size];

  for (int i = 0; i < size; i++) output[size - i] = (var >> (i * 8));

  return output;
}

#endif
