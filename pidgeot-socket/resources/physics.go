package resources

import (
  "fighter/pidgeot-socket/ecs"

  "github.com/bxcodec/saint"
)

type PhysicsSystem struct {
  Hub Hub
}

func (system PhysicsSystem) Loop() {
  entities, err := system.Hub.World.AllEntitiesWithComponent(ecs.CollisionComponent)
  if err != nil {
    return
  }

  for e1, _ := range entities {
    c1_p, _ := system.Hub.World.GetComponent(e1, ecs.CollisionComponent)
    c1 := (*c1_p).(*ecs.Collision)

    p1_p, _ := system.Hub.World.GetComponent(e1, ecs.PositionComponent)
    p1 := (*p1_p).(*ecs.Position)

    if c1.IsStatic { continue }

    if c1.WithGravity {
      // Add gravity
      c1.ImpulseY = saint.Min(c1.ImpulseY + 1, c1.MaxSpeedY)
    }

    p1.NextY = p1.Y + c1.ImpulseY
    p1.NextX = p1.X + c1.ImpulseX

    for e2, _ := range entities {
      if e1 == e2 { continue }

      c2_p, _ := system.Hub.World.GetComponent(e2, ecs.CollisionComponent)
      c2 := (*c2_p).(*ecs.Collision)

      p2_p, _ := system.Hub.World.GetComponent(e2, ecs.PositionComponent)
      p2 := (*p2_p).(*ecs.Position)

      NextX2 := p2.X + c2.ImpulseX
      NextY2 := p2.Y + c2.ImpulseY

      // resolve y-axis
      collidingX := IsOverlapping(p1.X, p1.X + c1.W, p2.X, p2.X + c2.W)
      collidingY := IsOverlapping(p1.NextY, p1.NextY + c1.H, NextY2, NextY2 + c2.H)
      colliding := collidingX && collidingY

      if colliding {
        direction := func (impulse int) int {if impulse < 0 { return 1 } else { return -1 }}(c1.ImpulseY)
        overlap := CalculateOverlap(p1.NextY, p1.NextY + c1.H, NextY2, NextY2 + c2.H)

        p1.NextY += (direction * overlap)
        c1.ImpulseY = 0
        c1.IsJumping = false
      }

      // resolve x-axis
      collidingX = IsOverlapping(p1.NextX, p1.NextX + c1.W, NextX2, NextX2 + c2.W)
      collidingY = IsOverlapping(p1.Y, p1.Y + c1.H, p2.Y, p2.Y + c2.H)
      colliding = collidingX && collidingY

      if colliding {
        direction := func (impulse int) int {if impulse < 0 { return 1 } else { return -1 }}(c1.ImpulseX)
        overlap := CalculateOverlap(p1.NextX, p1.NextX + c1.W, NextX2, NextX2 + c2.W)

        p1.NextX += (direction * overlap)
      }
    }
  }

  for e1, _ := range entities {
    p1_p, _ := system.Hub.World.GetComponent(e1, ecs.PositionComponent)
    p1 := (*p1_p).(*ecs.Position)

    if (p1.X != p1.NextX || p1.Y != p1.NextY) {
      p1.X = p1.NextX
      p1.Y = p1.NextY

      system.Hub.broadcast <- system.Hub.World.GetComponentMessage(e1, p1_p)
    }
  }
}
