// AUTOGENERATED FILE. DO NOT EDIT IT

// template composite.go

package ai

import (
  _"fmt"
)

type Selector struct {
  Status Status

  Children []Behavior
}

func NewSelector(children ...Behavior) *Selector {
  return &Selector{
    Children: children,
  }
}

func (n *Selector) Update() Status {
	if n.IsEmpty() { return SUCCESS }

	for _, child := range n.Children {
		status := child.Tick()

		if status != FAILURE { return status }
	}

	return FAILURE
}



func (n *Selector) Initialize() { }
func (n *Selector) Terminate(status Status) { }

func (n *Selector) IsSuccess() bool { return n.Status == SUCCESS }
func (n *Selector) IsFailure() bool { return n.Status == FAILURE }
func (n *Selector) IsRunning() bool { return n.Status == RUNNING }
func (n *Selector) IsTerminated() bool { return n.Status == SUCCESS || n.Status == FAILURE }

func (n *Selector) Reset() { n.Status = INVALID }

func (n *Selector) Tick() Status {
  if n.Status != RUNNING { n.Initialize() }
  status := n.Update()
  if n.Status != RUNNING { n.Terminate(status) }

  return status
}

// COMPOSITE SECTION
func (n *Selector) IsEmpty() bool {
  return len(n.Children) == 0
}

func (n *Selector) AddChildren(children ...Behavior) {
  n.Children = append(n.Children, children...)
}
