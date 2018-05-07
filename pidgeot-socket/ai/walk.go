// AUTOGENERATED FILE. DO NOT EDIT IT

// template behavior.go

package ai

import (
  "game/pidgeot-socket/ecs"
)

type Walk struct {
  Status Status
  World *ecs.Manager
  Eid ecs.EID
  Impulse int
}

func NewWalk(impulse int, eid ecs.EID, world *ecs.Manager) *Walk {
	return &Walk{
    World: world,
    Eid: eid,
    Impulse: impulse,
  }
}

func (n *Walk) Update() Status {
  p, err := n.World.GetComponent(n.Eid, ecs.PositionComponent)
  if err == nil {
    position := p.(*ecs.Position)
    position.NextX = position.X + n.Impulse

    return SUCCESS
  }

  return FAILURE
}



func (n *Walk) Initialize() { }
func (n *Walk) Terminate(status Status) { }

func (n *Walk) IsSuccess() bool { return n.Status == SUCCESS }
func (n *Walk) IsFailure() bool { return n.Status == FAILURE }
func (n *Walk) IsRunning() bool { return n.Status == RUNNING }
func (n *Walk) IsTerminated() bool { return n.Status == SUCCESS || n.Status == FAILURE }

func (n *Walk) Reset() { n.Status = INVALID }

func (n *Walk) Tick() Status {
  if n.Status != RUNNING { n.Initialize() }
  status := n.Update()
  if n.Status != RUNNING { n.Terminate(status) }

  return status
}
