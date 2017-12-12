package ai

type ILeaf interface {
  IBehavior
}

type Leaf struct {
  Behavior
}
