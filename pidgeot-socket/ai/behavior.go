package ai

type Status int

const (
  INVALID = Status(iota)
  SUCCESS
  FAILURE
  RUNNING
  ERROR
)

type Behavior interface {
  Tick() Status

  Initialize()
  Update() Status
  Terminate(status Status)
}
