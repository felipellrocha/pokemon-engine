package ai

import (
  _"fmt"
)

type Succeeder struct {
  Decorator
}

func NewSucceeder(child IBehavior) *Succeeder {
  return &Succeeder{
    Decorator: Decorator{
      Child: child,
    },
  }
}

func (n *Succeeder) Update() Status {
  n.Child.Tick(n.Child)

  return SUCCESS
}


