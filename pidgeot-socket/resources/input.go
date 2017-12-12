package resources

import (
  "strings"
  "bytes"
  "encoding/binary"

  "fighter/pidgeot-socket/ecs"

  //"github.com/bxcodec/saint"
)

type Compass uint8
type Action uint8

const (
  MAIN Action = 1 << iota
  SECONDARY
  ATTACK1
)

const (
  NORTH Compass = 1 << iota
  NORTHEAST
  EAST
  SOUTHEAST
  SOUTH
  SOUTHWEST
  WEST
  NORTHWEST
)

func (a Action) String() string {
  out := make([]string, 0)

  if a & MAIN != 0 { out = append(out, "MAIN") }
  if a & SECONDARY != 0 { out = append(out, "SECONDARY") }
  if a & ATTACK1 != 0 { out = append(out, "ATTACK1") }

  return strings.Join(out, ":")
}

func (c Compass) String() string {
  out := make([]string, 0)

  if c & NORTH != 0 { out = append(out, "NORTH") }
  if c & NORTHEAST != 0 { out = append(out, "NORTHEAST") }
  if c & EAST != 0 { out = append(out, "EAST") }
  if c & SOUTHEAST != 0 { out = append(out, "SOUTHEAST") }
  if c & SOUTH != 0 { out = append(out, "SOUTH") }
  if c & SOUTHWEST != 0 { out = append(out, "SOUTHWEST") }
  if c & WEST != 0 { out = append(out, "WEST") }
  if c & NORTHWEST != 0 { out = append(out, "NORTHWEST") }

  return strings.Join(out, ":")
}

type Input struct {
  Eid ecs.EID
  Compass Compass
  Action Action
}

func GetInput(data []byte, out *Input) error {
  buf := bytes.NewReader(data)

  if err := binary.Read(buf, binary.LittleEndian, &out.Compass); err != nil { return err }
  if err := binary.Read(buf, binary.LittleEndian, &out.Action); err != nil { return err }

  return nil
}

type InputSystem struct {
  Hub *Hub
}

func (system InputSystem) Loop() {
  for {
    select {
    case input := <-system.Hub.Inputs:
      entity := input.Eid

      c, err := system.Hub.World.GetComponent(entity, ecs.CollisionComponent)
      if err == nil {
        collision := (*c).(*ecs.Collision)

        if input.Compass & NORTH != 0 && !collision.IsJumping {
          collision.ImpulseY = -collision.JumpImpulse
          collision.IsJumping = true
        }

        if input.Compass & EAST != 0 && input.Compass & WEST != 0 {
          collision.ImpulseX = 0
        } else if input.Compass & EAST != 0 {
          collision.ImpulseX = 3
        } else if input.Compass & WEST != 0 {
          collision.ImpulseX = -3
        } else { collision.ImpulseX = 0 }
      }
    default:
      return
    }
  }
}
