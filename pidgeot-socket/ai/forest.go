package ai

import (
  _"fmt"
)

type Forest struct {
  Composite
}

func NewForest() *Forest {
  return &Forest{}
}

func (n *Forest) Update() Status {
	for _, child := range n.Children {
		child.Tick(child)
	}

  return RUNNING 
}
