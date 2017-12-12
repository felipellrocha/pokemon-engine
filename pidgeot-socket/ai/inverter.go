package ai

import (
  _"fmt"
)

type Inveter struct {
  Decorator
}

func NewInveter(child IBehavior) *Inveter {
  return &Inveter{
    Decorator: Decorator{
      Child: child,
    },
  }
}

func (n *Inveter) Update() Status {
  status := n.Child.Tick(n.Child)

  if status == SUCCESS { return FAILURE } else if status == FAILURE { return SUCCESS }

  return status
}
