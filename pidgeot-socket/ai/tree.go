package ai

type IBehaviorTree interface {
  IBehavior
}

type BehaviorTree struct {
  Behavior

  Root IBehavior
}

func NewBehaviorTree(root IBehavior) *BehaviorTree {
  return &BehaviorTree{
    Root: root,
  }
}

func (n *BehaviorTree) Update() Status {
  return n.Root.Tick(n.Root)
}
