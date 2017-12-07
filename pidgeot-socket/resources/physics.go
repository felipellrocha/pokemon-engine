package resources

import (
  "fighter/pidgeot-socket/ecs"

  "github.com/bxcodec/saint"
)

type PhysicsSystem struct {
  Hub Hub
}

func GetImpulseDirection(impulse int) int {
  if impulse < 0 {
    return 1
  } else {
    return -1
  }
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

    if c1.IsStatic {
      // these are objects that have other things collide with them
      continue
    }

    if c1.WithGravity {
      // Add gravity
      c1.ImpulseY = saint.Min(c1.ImpulseY + 1,  c1.MaxSpeedY)
    }

    for e2, _ := range entities {
      if e1 == e2 { continue }

      c2_p, _ := system.Hub.World.GetComponent(e2, ecs.CollisionComponent)
      c2 := (*c2_p).(*ecs.Collision)

      p2_p, _ := system.Hub.World.GetComponent(e2, ecs.PositionComponent)
      p2 := (*p2_p).(*ecs.Position)


      p1.NextX = p1.X + c1.ImpulseX
      p2.NextX = p2.X + c2.ImpulseX

      p1.NextY = p1.Y + c1.ImpulseY
      p2.NextY = p2.Y + c2.ImpulseY

      collidingX := IsOverlapping(p1.NextX, p1.NextX + c1.W, p2.NextX, p2.NextX + c2.W)
      collidingY := IsOverlapping(p1.NextY, p1.NextY + c1.H, p2.NextY, p2.NextY + c2.H)
      colliding := collidingX && collidingY

      if colliding {
        hDistance := saint.Abs((p1.NextX + (c1.W / 2)) + (p2.NextX + (c2.W / 2)))
        vDistance := saint.Abs((p1.NextY + (c1.H / 2)) + (p2.NextY + (c2.H / 2)))

        // I think this is buggy right now
        if hDistance > vDistance {
          direction := GetImpulseDirection(c1.ImpulseY)
          overlap := CalculateOverlap(p1.NextY, p1.NextY + c1.H, p2.NextY, p2.NextY + c2.H)

          p1.NextY += (direction * overlap)
          c1.ImpulseY = 0
          c1.IsJumping = false
        } else {
          direction := GetImpulseDirection(c1.ImpulseX)
          overlap := CalculateOverlap(p1.NextX, p1.NextX + c1.W, p2.NextX, p2.NextX + c2.W)

          p1.NextY += (direction * overlap)
        }
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
