package ai

import (
  _"fmt"
)

type Repeater struct {
  Decorator
}

func NewRepeater(child IBehavior) *Repeater {
  return &Repeater{
    Decorator: Decorator{
      Child: child,
    },
  }
}

func (n *Repeater) Update() Status {
  status := n.Child.Tick(n.Child)

  if status == SUCCESS { return FAILURE } else if status == FAILURE { return SUCCESS }

  return status
}
