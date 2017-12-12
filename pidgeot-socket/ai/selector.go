package ai

import (
  _"fmt"
)

type Selector struct {
  Composite
}

func NewSelector(children ...IBehavior) *Selector {
  return &Selector{
    Composite: Composite{
      Children: children,
    },
  }
}

func (n *Selector) Update() Status {
	if n.IsEmpty() { return SUCCESS }

	for _, child := range n.Children {
		status := child.Tick(child)

		if status != FAILURE { return status }
	}

	return FAILURE
}

type MemSelector struct {
  Composite
}

func NewMemSelector(children ...IBehavior) *MemSelector {
  return &MemSelector{
    Composite: Composite{
      Children: children,
      Index: 0,
    },
  }
}

func (n *MemSelector) Update() Status {
	if n.IsEmpty() { return SUCCESS }

	for index := n.Index; index < len(n.Children); index++ {
    child := n.Children[index]
		status := child.Tick(child)

		if status != FAILURE { return status }
	}

	return FAILURE
}
