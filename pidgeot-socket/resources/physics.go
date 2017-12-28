package resources

import (
  "fmt"

  "game/pidgeot-socket/ecs"

  "github.com/bxcodec/saint"
)

type PhysicsSystem struct {
  Hub *Hub
}

const (
  STILL int = 0
  FORWARD = -1
  BACKWARD = 1
)

func (system PhysicsSystem) Loop() {
  entities, err := system.Hub.World.AllEntitiesWithComponent(ecs.CollisionComponent)
  if err != nil { return }

  for e, _ := range entities {
    // apply impulse
    c_p, _ := system.Hub.World.GetComponent(e, ecs.CollisionComponent)
    c := (*c_p).(*ecs.Collision)

    p_p, _ := system.Hub.World.GetComponent(e, ecs.PositionComponent)
    p := (*p_p).(*ecs.Position)

    if c.WithGravity {
      // Add gravity
      c.ImpulseY = saint.Min(c.ImpulseY + 1, c.MaxSpeedY)
    }

    // apply impulse
    p.NextY = p.Y + c.ImpulseY
    p.NextX = p.X + c.ImpulseX
  }

  // resolving collisions
  for e1, _ := range entities {
    c1_p, _ := system.Hub.World.GetComponent(e1, ecs.CollisionComponent)
    c1 := (*c1_p).(*ecs.Collision)

    if c1.IsStatic { continue }

    for e2, _ := range entities {
      if e1 == e2 { continue }

      system.ResolveCollision(entities, e1, e2)
    }
  }

  // moving entities
  for e, _ := range entities {
    p_p, _ := system.Hub.World.GetComponent(e, ecs.PositionComponent)
    p := (*p_p).(*ecs.Position)

    if (p.X != p.NextX || p.Y != p.NextY) {
      p.X = p.NextX
      p.Y = p.NextY

      system.Hub.broadcast <- system.Hub.World.GetComponentMessage(e, p_p)
    }
  }
}

func GetDirection(e1_p1 int, e1_p2 int, e2_p1 int, e2_p2 int) int {
  if e1_p1 < e2_p1 {
    return FORWARD
  } else if e1_p1 > e2_p1 {
    return BACKWARD
  } else {
    return STILL
  }
}

func (system PhysicsSystem) ResolveCollision(entities map[ecs.EID]*ecs.Component, e1 ecs.EID, e2 ecs.EID) {
  c1_p, _ := system.Hub.World.GetComponent(e1, ecs.CollisionComponent)
  p1_p, _ := system.Hub.World.GetComponent(e1, ecs.PositionComponent)
  c1 := (*c1_p).(*ecs.Collision)
  p1 := (*p1_p).(*ecs.Position)

  c2_p, _ := system.Hub.World.GetComponent(e2, ecs.CollisionComponent)
  p2_p, _ := system.Hub.World.GetComponent(e2, ecs.PositionComponent)
  c2 := (*c2_p).(*ecs.Collision)
  p2 := (*p2_p).(*ecs.Position)

  // resolve y-axis
  mink := getMinkowski(p1, c1,  p2, c2)
  overlapY, overlapX := mink.overlap()

  if mink.collides() {

    fmt.Println(overlapY, overlapX)

    p1.NextY -= overlapY
    p1.NextX -= overlapX

    if overlapY > 0 {
      c1.ImpulseY = 0
      c1.IsJumping = false
    }
  }

  /*
  for e3, _ := range entities {
    if e1 == e3 || e2 == e3 { continue }

    c3_p, _ := system.Hub.World.GetComponent(e3, ecs.CollisionComponent)
    p3_p, _ := system.Hub.World.GetComponent(e3, ecs.PositionComponent)
    c3 := (*c3_p).(*ecs.Collision)
    p3 := (*p3_p).(*ecs.Position)

    if c3.IsStatic { continue }

    mink = getMinkowski(p1, c1,  p3, c3)

    if mink.collides() {
      // Apply correction

      fmt.Printf("resolving: %d, %d\n", e1, e3)

      p3.NextX -= overlapX
      p3.NextY -= overlapY

      system.ResolveCollision(entities, e1, e3)
    }
  }
  */
}
