package ai

import (
  "game/pidgeot-socket/ecs"
)

type Test struct {
  Leaf

  Status Status
  World *ecs.Manager
  Eid ecs.EID
}

func NewTest(eid ecs.EID, world *ecs.Manager) *Test {
	return &Test{
    World: world,
    Eid: eid,
  }
}

func (n Test) Update() Status {
  c, err := n.World.GetComponent(n.Eid, ecs.CollisionComponent)
  if err == nil {
    collision := (*c).(*ecs.Collision)
    collision.ImpulseX = -1

    return SUCCESS
  }

  return FAILURE
}

