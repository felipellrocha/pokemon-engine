package resources

import (
  "fighter/pidgeot-socket/ecs"

  //"github.com/bxcodec/saint"
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
    p1_p, _ := system.Hub.World.GetComponent(e1, ecs.PositionComponent)

    c1 := (*c1_p).(*ecs.Collision)
    p1 := (*p1_p).(*ecs.Position)

    if c1.IsStatic {
      // need to move these guys if they have any delta
      continue
    }

    // Add gravity

    DeltaY := c1.ImpulseY
    DeltaX := c1.ImpulseX
    DeltaY += 1

    for e2, _ := range entities {
      c2_p, _ := system.Hub.World.GetComponent(e2, ecs.CollisionComponent)
      p2_p, _ := system.Hub.World.GetComponent(e2, ecs.PositionComponent)

      c2 := (*c2_p).(*ecs.Collision)
      p2 := (*p2_p).(*ecs.Position)

      if (e1 == e2) {
        /*
        p1.Y += p1.DeltaY
        p1.X += p1.DeltaX

        system.Hub.broadcast <- system.Hub.World.GetComponentMessage(e1, p1_p)
        fmt.Printf("%#v\n", p1)
        */
        continue
      }

      NextX1 := p1.X + DeltaX + c1.X
      NextY1 := p1.Y + DeltaY + c1.Y
      NextX2 := p2.X + DeltaX + c2.X
      NextY2 := p2.Y + DeltaY + c2.Y

      collidingX := IsOverlapping(NextX1, NextX1 + c1.W, NextX2, NextX2 + c2.W)
      collidingY := IsOverlapping(NextY1, NextY1 + c1.H, NextY2, NextY2 + c2.H)
      colliding := (collidingX && collidingY)

      if (colliding) {
        //hDistance := saint.Abs((NextX1 + (c1.W / 2)) + (NextX2 + (c2.W / 2)))
        //vDistance := saint.Abs((NextY1 + (c1.H / 2)) + (NextY2 + (c2.H / 2)))

        overlapY := CalculateOverlap(NextY1, NextY1 + c1.H, NextY2, NextY2 + c2.H)
        overlapX := CalculateOverlap(NextX1, NextX1 + c1.W, NextX2, NextX2 + c2.W)
        if overlapY > 0 {
          direction := func() int {
            if DeltaY < 0 {
              return 1
            } else {
              return -1
            }
          }()

          NextY1 += (direction * overlapY)
          DeltaY = 0
        } else if overlapY > 0 {
          direction := func() int {
            if DeltaX < 0 {
              return -1
            } else {
              return 1
            }
          }()

          NextX1 += (direction * overlapX)
          DeltaX = 0
        }

      }

      if (p1.X != NextX1 || p1.Y != NextY1) {
        p1.X = NextX1
        p1.Y = NextY1

        system.Hub.broadcast <- system.Hub.World.GetComponentMessage(e1, p1_p)
      }
    }
  }
}
