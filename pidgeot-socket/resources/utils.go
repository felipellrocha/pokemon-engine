package resources

import (
  "fmt"
  "strconv"

  "game/pidgeot-socket/ecs"
  "github.com/bxcodec/saint"
)

type Box struct {
  x int
  y int
  w int
  h int
}

func (b *Box) collides() (bool, int, int) {
  var X int
  var Y int

  collides := b.x <= 0 && b.y <= 0 && (b.x + b.w) >= 0 && (b.y + b.h) >= 0

  if saint.Abs(b.x) < saint.Abs(b.x + b.w) { X = b.x } else { X = b.x + b.w }
  if saint.Abs(b.y) < saint.Abs(b.y + b.h) { Y = b.y } else { Y = b.y + b.h }

  if saint.Abs(X) < saint.Abs(Y) {
    return (collides && X != 0), 0, X
  } else {
    return (collides && Y != 0), Y, 0
  }
}

func getMinkowski(p1 *ecs.Position, c1 *ecs.Collision, p2 *ecs.Position, c2 *ecs.Collision) *Box {
  return &Box{
    x: p1.NextX - (p2.NextX + c2.W),
    y: p1.NextY - (p2.NextY + c2.H),
    w: c1.W + c2.W,
    h: c1.H + c2.H,
  }
}

func ReadBytes(members map[string]ecs.ComponentMember, key string) ([]byte, error) {
  if Key, ok := members[key]; ok {
    return []byte(Key.Value), nil
  } else {
    return []byte(""), nil
  }
}

func ReadBool(members map[string]ecs.ComponentMember, key string, def bool) (bool, error) {
  if Key, ok := members[key]; ok {
    return string(Key.Value) == "true", nil
  } else {
    return def, nil
  }
}

func ReadInt(members map[string]ecs.ComponentMember, key string, def int) (int, error) {
  Key, ok := members[key];
  if !ok {
    return def, nil
  }

  v, err := strconv.Atoi(string(Key.Value))

  if err != nil {
    fmt.Println("binary.Read failed:", err, members)
    panic(err)
    return -1, err
  }
  return v, nil
}

func IsOverlapping(min1 int, max1 int, min2 int, max2 int) bool {
  return max1 > min2 && max2 > min1
}

func CalculateOverlap(min1 int, max1 int, min2 int, max2 int) int {
  return saint.Abs(saint.Max(0, saint.Min(max1, max2) - saint.Max(min1, min2)))
}

