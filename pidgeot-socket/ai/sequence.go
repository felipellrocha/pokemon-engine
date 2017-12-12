package ai

import (
  _"fmt"

  "fighter/pidgeot-socket/ecs"
)

type Sequence struct {
  Composite

  World *ecs.Manager
  Eid ecs.EID
}

func NewSequence(eid ecs.EID, world *ecs.Manager, children ...IBehavior) *Sequence {
  return &Sequence{
    Eid: eid,
    World: world,
    Composite: Composite{
      Children: children,
    },
  }
}

func (n *Sequence) Update() Status {
	if n.IsEmpty() { return SUCCESS }

	for _, child := range n.Children {
		status := child.Tick(child)

		if status != SUCCESS { return status }
	}

	return SUCCESS
}

type MemSequence struct {
  Composite

  World *ecs.Manager
  Eid ecs.EID
}

func NewMemSequence(eid ecs.EID, world *ecs.Manager, children ...IBehavior) *MemSequence {
  return &MemSequence{
    Eid: eid,
    World: world,
    Composite: Composite{
      Children: children,
      Index: 0,
    },
  }
}

func (n *MemSequence) Update() Status {
	if n.IsEmpty() { return SUCCESS }

	for i := n.Index; i < len(n.Children); i++ {
    child := n.Children[i]

		status := child.Tick(child)
		if status != SUCCESS { return status }
	}

	return SUCCESS
}
