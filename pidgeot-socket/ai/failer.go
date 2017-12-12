package ai

import (
  _"fmt"
)

type Failer struct {
  Decorator
}

func NewFailer(child IBehavior) *Failer {
  return &Failer{
    Decorator: Decorator{
      Child: child,
    },
  }
}

func (n *Failer) Update() Status {
  n.Child.Tick(n.Child)

  return FAILURE
}
