package ecs

type CID uint16

const (
  HealthComponent = iota
  PositionComponent
  DimensionComponent
  SpriteComponent
  InputComponent
  RenderComponent
)

type Component interface {
  ID() CID
}

type Health struct {
  CurrentHearts int
  MaxHearts int
  CurrentEnergy int
  MaxEnergy int
}
func (c Health) ID() CID {
  return HealthComponent
}

type Position struct {
  X int
  Y int

  NextX int
  NextY int

  Direction int
}
func (c Position) ID() CID {
  return PositionComponent
}

type Dimension struct {
  W int
  H int
}
func (c Dimension) ID() CID {
  return DimensionComponent
}

type Sprite struct {
  X int
  Y int
  W int
  H int
  Src string
}
func (c Sprite) ID() CID {
  return SpriteComponent
}

type Input struct {
}
func (c Input) ID() CID {
  return InputComponent
}

type Render struct {
  Layer int
  ShouldTileX bool
  ShouldTileY bool
}
func (c Render) ID() CID {
  return RenderComponent
}
