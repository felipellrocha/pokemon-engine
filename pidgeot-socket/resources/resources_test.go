package resources

import (
  "fmt"

  "game/pidgeot-socket/ecs"

  "testing"
)

func TestCheckOverlap (t *testing.T) {
  if ok := IsOverlapping(0, 50, 40, 90); !ok {
    t.Error("Expected true, got", ok)
  }

  if ok := IsOverlapping(0, 50, 50, 90); ok {
    t.Error("Expected false, got", ok)
  }

  if ok := IsOverlapping(0, 50, 51, 90); ok {
    t.Error("Expected false, got", ok)
  }
}

func TestOverlapCalculation (t *testing.T) {
  if length := CalculateOverlap(0, 50, 40, 90); length != 10 {
    t.Error("Expected 10, got", length)
  }
}

func NewCollidableEntity(m *ecs.Manager, x int, y int, w int, h int, static bool) ecs.EID {
  e := m.NewEntity()

  p := &ecs.Position{
    X: x,
    Y: y,
    Direction: 2,
  }
  c := &ecs.Collision{
    IsStatic: static,
    IsColliding: false,
    WithGravity: false,
    IsJumping: false,
    MaxSpeedY: 7,
    JumpImpulse: 3,
    X: 0,
    Y: 0,
    W: w,
    H: h,
  }
  m.AddComponents(e, p, c)

  return e
}

func TestPhysics (t *testing.T) {
  m := ecs.NewManager()

  e1 := NewCollidableEntity(m, 0, 0, 10, 10, false)
  e2 := NewCollidableEntity(m, 5, 0, 10, 10, false)

  fmt.Println(e1, e2)
}
