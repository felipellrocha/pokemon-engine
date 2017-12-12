package ai

type IDecorator interface {
  IBehavior
}

type Decorator struct {
  Behavior

  Child IBehavior
}

func (n *Decorator) HasNoChild() bool {
  return n.Child == nil
}

func (n *Decorator) AddChild(child IBehavior) {
  n.Child = child
}
