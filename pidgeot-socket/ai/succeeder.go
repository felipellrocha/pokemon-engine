// AUTOGENERATED FILE. DO NOT EDIT IT

// template decorator.go

package ai

import (
  _"fmt"
)

type Succeeder struct {
  Status Status

  Child Behavior
}

func NewSucceeder(child Behavior) *Succeeder {
  return &Succeeder{
    Child: child,
  }
}

func (n *Succeeder) Update() Status {
  n.Child.Tick()

  return SUCCESS
}




func (n *Succeeder) Initialize() { }
func (n *Succeeder) Terminate(status Status) { }

func (n *Succeeder) IsSuccess() bool { return n.Status == SUCCESS }
func (n *Succeeder) IsFailure() bool { return n.Status == FAILURE }
func (n *Succeeder) IsRunning() bool { return n.Status == RUNNING }
func (n *Succeeder) IsTerminated() bool { return n.Status == SUCCESS || n.Status == FAILURE }

func (n *Succeeder) Reset() { n.Status = INVALID }

func (n *Succeeder) Tick() Status {
  if n.Status != RUNNING { n.Initialize() }
  status := n.Update()
  if n.Status != RUNNING { n.Terminate(status) }

  return status
}

// DECORATOR SECTION
func (n *Succeeder) HasNoChild() bool {
  return n.Child == nil
}

func (n *Succeeder) AddChild(child Behavior) {
  n.Child = child
}
