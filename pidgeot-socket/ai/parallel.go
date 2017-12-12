package ai

import (
  _"fmt"
)

type Parallel struct {
  Composite

  UseSuccessFailPolicy bool
  SuccessOnAll bool
  FailOnAll bool

  MinSuccess int
  MinFail int
}

func NewAllParallel(successOnAll bool, failOnAll bool, children ...IBehavior) *Parallel {
  return &Parallel{
    Composite: Composite{
      Children: children,
    },

    UseSuccessFailPolicy: true,
    SuccessOnAll: successOnAll,
    FailOnAll: failOnAll,
  }
}

func NewMinMaxParallel(minSuccess int, minFail int, children ...IBehavior) *Parallel {
  return &Parallel{
    Composite: Composite{
      Children: children,
    },

    MinSuccess: minSuccess,
    MinFail: minFail,
  }
}

func (n *Parallel) Update() Status {
  minSuccess := n.MinSuccess
  minFail := n.MinFail

  if n.UseSuccessFailPolicy {
    if n.SuccessOnAll { minSuccess = len(n.Children) } else { minSuccess = 1 }
    if n.FailOnAll { minFail = len(n.Children) } else { minFail = 1 }
  }

  totalSuccess := 0
  totalFail := 0

  for i := 0; i < len(n.Children); i++ {
    child := n.Children[i]
    status := child.Tick(child)

    if status == SUCCESS { totalSuccess++ }
    if status == FAILURE { totalFail++ }
  }

  if totalSuccess >= minSuccess { return SUCCESS }
  if totalFail >= minFail { return FAILURE }

  return RUNNING
}
