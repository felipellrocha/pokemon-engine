#ifndef COMPASS_H
#define COMPASS_H

#include <iostream>

using namespace std;

enum Compass {
  NORTH = 1,
  NORTHEAST = 2,
  EAST = 4,
  SOUTHEAST = 8,
  SOUTH = 16,
  SOUTHWEST = 32,
  WEST = 64,
  NORTHWEST = 128,
};

inline ostream& operator << (ostream &os, Compass const &c) {
  os << "Compass<";
  if (c & Compass::NORTH) os << "North ";
  if (c & Compass::NORTHEAST) os << "Northeast ";
  if (c & Compass::EAST) os << "East ";
  if (c & Compass::SOUTHEAST) os << "Southeast ";
  if (c & Compass::SOUTH) os << "South ";
  if (c & Compass::SOUTHWEST) os << "Southwest ";
  if (c & Compass::WEST) os << "West ";
  if (c & Compass::NORTHWEST) os << "Northwest ";
  os << ">";
  return os;
}

enum Actions {
  MAIN = 1,
  SECONDARY = 2,
  ATTACK1 = 4,
};

#endif
