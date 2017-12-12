package ai

import (
  "fmt"
)

type Status int

const (
  INVALID = Status(iota)
  SUCCESS
  FAILURE
  RUNNING
  ERROR
)

type IBehavior interface {
  Tick(node IBehavior) Status

  Initialize()
  Update() Status
  Terminate(status Status)
}

type Behavior struct {
  Status Status
}

func NewBehavior() *Behavior {
  return &Behavior{
    Status: INVALID,
  }
}

func (n Behavior) Initialize() { }
func (n Behavior) Terminate(status Status) { }

func (n *Behavior) IsSuccess() bool { return n.Status == SUCCESS }
func (n *Behavior) IsFailure() bool { return n.Status == FAILURE }
func (n *Behavior) IsRunning() bool { return n.Status == RUNNING }
func (n *Behavior) IsTerminated() bool { return n.Status == SUCCESS || n.Status == FAILURE }

func (n *Behavior) Reset() { n.Status = INVALID }

func (n *Behavior) Tick(node IBehavior) Status {
  if n.Status != RUNNING { node.Initialize() }
  status := node.Update()
  if n.Status != RUNNING { node.Terminate(status) }

  return status
}

func (n *Behavior) Update() Status {
  fmt.Println("This update is being called")
  return n.Status
}
