package ai

type IComposite interface {
  IBehavior
}

type Composite struct {
  Behavior

  Children []IBehavior
  Index int
}

func (n *Composite) IsEmpty() bool {
  return len(n.Children) == 0
}

func (n *Composite) AddChildren(children ...IBehavior) {
  n.Children = append(n.Children, children...)
}
