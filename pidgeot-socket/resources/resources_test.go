package resources

import (
  "fmt"

  "game/pidgeot-socket/ecs"

  "testing"
)

func NewCollidableEntity(m *ecs.Manager, x int, y int, w int, h int, static bool, gravity bool) ecs.EID {
  e := m.NewEntity()

  p := &ecs.Position{
    X: x,
    Y: y,
    Direction: 2,
  }
  c := &ecs.Collision{
    IsStatic: static,
    IsColliding: false,
    WithGravity: gravity,
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

func GetPhysics() (*ecs.Manager, *PhysicsSystem, *Hub) {
  m := ecs.NewManager()

  hub := &Hub{
    broadcast: make(chan []byte, 1024),
    World: *m,
    Systems: make([]ecs.System, 0),
  }

  physics := PhysicsSystem{
    Hub: hub,
  }

  hub.RegisterSystem(physics)

  return m, &physics, hub
}

func TestRightToLeftSimpleCollision (t *testing.T) {
  m, system, _ := GetPhysics()

  // dynamic colliders
  e1 := NewCollidableEntity(m, 2, 0, 10, 10, false, true)

  // static colliders
  NewCollidableEntity(m, 0, 10, 30, 10, true, false)
  NewCollidableEntity(m, 10, 0, 10, 10, true, false)

  system.Loop()

  if x1, y1, _, _ := m.GetRect(e1); x1 != 0 || y1 != 0 {
    t.Error("Expected (0, 0) , got", x1, y1)
  }
}

func TestLeftToRightSimpleCollision (t *testing.T) {
  m, system, _ := GetPhysics()

  // dynamic colliders
  e1 := NewCollidableEntity(m, 18, 0, 10, 10, false, true)

  // static colliders
  e2 := NewCollidableEntity(m, 0, 10, 30, 10, true, false)
  e3 := NewCollidableEntity(m, 10, 0, 10, 10, true, false)

  fmt.Println(e1, e2, e3)
  m.PrintRect(e1)
  m.PrintRect(e2)
  m.PrintRect(e3)

  system.Loop()

  if x1, y1, _, _ := m.GetRect(e1); x1 != 20 || y1 != 0 {
    t.Error("Expected (0, 0), got", x1, y1)
  }
  //x1, x2, y1, y2 = m.GetRect(e1)
  m.PrintRect(e1)
  m.PrintRect(e2)
  m.PrintRect(e3)
}

func TestDownUpSimpleCollision (t *testing.T) {
  m, system, _ := GetPhysics()

  // dynamic colliders
  e1 := NewCollidableEntity(m, 0, 2, 10, 10, false, true)

  // static colliders
  NewCollidableEntity(m, 0, 10, 10, 10, true, false)

  system.Loop()

  if x1, y1, _, _ := m.GetRect(e1); x1 != 0 || y1 != 0 {
    t.Error("Expected (0, 0), got", x1, y1)
  }
}

func TestDownUpChainedCollision (t *testing.T) {
  m, system, _ := GetPhysics()

  // dynamic colliders
  e1 := NewCollidableEntity(m, 0, 2, 10, 10, false, true)
  e2 := NewCollidableEntity(m, 0, 12, 10, 10, false, true)

  // static colliders
  e3 := NewCollidableEntity(m, 0, 20, 10, 10, true, false)

  fmt.Println(e1, e2, e3)
  m.PrintRect(e1)
  m.PrintRect(e2)
  m.PrintRect(e3)

  system.Loop()

  if x1, y1, _, _ := m.GetRect(e1); x1 != 0 || y1 != 0 {
    t.Error("Expected (0, 0), got", x1, y1)
  }

  // test stability
  system.Loop()

  if x1, y1, _, _ := m.GetRect(e1); x1 != 0 || y1 != 0 {
    t.Error("Expected (0, 0), got", x1, y1)
  }

  for i := 0; i < 50; i++ {
    system.Loop()

    x1, y1, _, _ := m.GetRect(e1);
    x2, y2, _, _ := m.GetRect(e2);
    if x1 != 0 || y1 != 0 || x2 != 0 || y2 != 10 {
      t.Error("Expected (0, 0), got", x1, y1)
      return
    }
  }
}
