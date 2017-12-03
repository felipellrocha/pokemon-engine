package ecs

import (
  "fmt"
  "bytes"
  "encoding/binary"
)

type CID uint16

const (
  JSON = iota
  DELETE

  PositionComponent
  DimensionComponent
  SpriteComponent
  RenderComponent
  CollisionComponent

  HealthComponent
  InputComponent
  AnimationComponent
)

type Component interface {
  ID() CID
  IsRenderable() bool
  ToBinary() []byte
}

type Health struct {
  CurrentHearts int
  MaxHearts int
  CurrentEnergy int
  MaxEnergy int
}
func (c *Health) ID() CID {
  return HealthComponent
}
func (c *Health) IsRenderable() bool {
  return false
}
func (c *Health) ToBinary() []byte {
  buffer := new(bytes.Buffer)
  if err := binary.Write(buffer, binary.LittleEndian, uint8(c.CurrentHearts)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint8(c.CurrentHearts)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint8(c.MaxHearts)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint8(c.CurrentEnergy)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint8(c.MaxEnergy)); err != nil { fmt.Println("error!", err) }
  return buffer.Bytes()
}

type Position struct {
  X int
  Y int

  DeltaX int
  DeltaY int

  Direction int
}
func (c *Position) ID() CID {
  return PositionComponent
}
func (c *Position) IsRenderable() bool {
  return true
}
func (c *Position) ToBinary() []byte {
  buffer := new(bytes.Buffer)
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.X)); err != nil { fmt.Println("Error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.Y)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.Direction)); err != nil { fmt.Println("error!", err) }
  return buffer.Bytes()
}

type Dimension struct {
  W int
  H int
}
func (c *Dimension) ID() CID {
  return DimensionComponent
}
func (c *Dimension) IsRenderable() bool {
  return true
}
func (c *Dimension) ToBinary() []byte {
  buffer := new(bytes.Buffer)
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.W)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.H)); err != nil { fmt.Println("error!", err) }
  return buffer.Bytes()
}

type Sprite struct {
  X int
  Y int
  W int
  H int
  SetIndex int
}
func (c *Sprite) ID() CID {
  return SpriteComponent
}
func (c *Sprite) IsRenderable() bool {
  return true
}
func (c *Sprite) ToBinary() []byte {
  buffer := new(bytes.Buffer)
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.X)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.Y)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.W)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.H)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.SetIndex)); err != nil { fmt.Println("error!", err) }
  return buffer.Bytes()
}

type Input struct {
}
func (c *Input) ID() CID {
  return InputComponent
}
func (c *Input) IsRenderable() bool {
  return false
}
func (c *Input) ToBinary() []byte {
  buffer := new(bytes.Buffer)
  return buffer.Bytes()
}

type Render struct {
  Layer int
  ShouldTileX bool
  ShouldTileY bool
}
func (c *Render) ID() CID {
  return RenderComponent
}
func (c *Render) IsRenderable() bool {
  return true
}
func (c *Render) ToBinary() []byte {
  buffer := new(bytes.Buffer)
  if err := binary.Write(buffer, binary.LittleEndian, uint8(c.Layer)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, c.ShouldTileX); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, c.ShouldTileY); err != nil { fmt.Println("error!", err) }
  return buffer.Bytes()
}

type Animation struct {
  Type int
  Frame int
  IsAnimating bool
}
func (c *Animation) ID() CID {
  return AnimationComponent
}
func (c *Animation) IsRenderable() bool {
  return false
}
func (c *Animation) ToBinary() []byte {
  buffer := new(bytes.Buffer)
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.Type)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint8(c.Frame)); err != nil { fmt.Println("error!", err) }
  return buffer.Bytes()
}

type Collision struct {
  IsStatic bool
  IsColliding bool
  WithGravity bool
  IsJumping bool

  MaxSpeedY int
  JumpImpulse int

  ImpulseX int
  ImpulseY int

  X int
  Y int
  W int
  H int
}
func (c *Collision) ID() CID {
  return CollisionComponent
}
func (c *Collision) IsRenderable() bool {
  return true
}
func (c *Collision) ToBinary() []byte {
  buffer := new(bytes.Buffer)
  if err := binary.Write(buffer, binary.LittleEndian, bool(c.IsStatic)); err != nil { fmt.Println("error!", err) }

  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.X)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.Y)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.W)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(c.H)); err != nil { fmt.Println("error!", err) }
  return buffer.Bytes()
}
