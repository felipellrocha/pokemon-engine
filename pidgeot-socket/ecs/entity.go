package ecs

import (
  "fmt"
  "bytes"
  "encoding/binary"
)

type EID uint16

type Manager struct {
  lowestEntityId int
  Components map[CID]map[EID]*Component
}

func NewManager() *Manager {
  return &Manager{
    Components: make(map[CID]map[EID]*Component),
  }
}

func (m *Manager) NewEntity() EID {
  m.lowestEntityId++
  return EID(m.lowestEntityId)
}

func (m *Manager) GetAllRenderableComponents() []byte {
  buffer := new(bytes.Buffer)

  for cid, entities := range m.Components {
    for eid, component := range entities {
      if (*component).IsRenderable() {
        if err := binary.Write(buffer, binary.LittleEndian, uint16(cid)); err != nil { fmt.Println("error!", err) }
        if err := binary.Write(buffer, binary.LittleEndian, uint32(eid)); err != nil { fmt.Println("error!", err) }
        if err := binary.Write(buffer, binary.LittleEndian, (*component).ToBinary()); err != nil { fmt.Println("error!", err) }
      }
    }
  }

  return buffer.Bytes()
}

func (m *Manager) DeleteEntity(eid EID) []byte {
  buffer := new(bytes.Buffer)

  for cid, entities := range m.Components {
    if component, ok := entities[eid]; ok {
      delete(entities, eid)

      if (*component).IsRenderable() {
        if err := binary.Write(buffer, binary.LittleEndian, uint16(DELETE)); err != nil { fmt.Println("error!", err) }
        if err := binary.Write(buffer, binary.LittleEndian, uint16(cid)); err != nil { fmt.Println("error!", err) }
        if err := binary.Write(buffer, binary.LittleEndian, uint32(eid)); err != nil { fmt.Println("error!", err) }
      }
    }
  }

  return buffer.Bytes()
}

func (m *Manager) GetComponentMessages(eid EID, components ...Component) []byte {
  buffer := new(bytes.Buffer)

  for i, _ := range components {
    // this manual way of grabbing the component fixes a nasty bug:
    // http://bryce.is/writing/code/jekyll/update/2015/11/01/3-go-gotchas.html
    component := components[i]

    if !component.IsRenderable() { continue }

    if err := binary.Write(buffer, binary.LittleEndian, uint16(component.ID())); err != nil { fmt.Println("error!", err) }
    if err := binary.Write(buffer, binary.LittleEndian, uint32(eid)); err != nil { fmt.Println("error!", err) }
    if err := binary.Write(buffer, binary.LittleEndian, component.ToBinary()); err != nil { fmt.Println("error!", err) }
  }

  return buffer.Bytes()
}

func (m *Manager) GetComponentMessage(eid EID, component *Component) []byte {
  buffer := new(bytes.Buffer)

  if err := binary.Write(buffer, binary.LittleEndian, uint16((*component).ID())); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, uint32(eid)); err != nil { fmt.Println("error!", err) }
  if err := binary.Write(buffer, binary.LittleEndian, (*component).ToBinary()); err != nil { fmt.Println("error!", err) }

  return buffer.Bytes()
}

func (m *Manager) GetComponent(eid EID, cid CID) (*Component, error) {
  entities, ok := m.Components[cid]
  if !ok { return nil, fmt.Errorf("Could not find component") }

  component, ok := entities[eid]
  if !ok { return nil, fmt.Errorf("Could not find entity") }

  return component, nil
}

func (m *Manager) AddComponents(eid EID, components ...Component) {
  for i, _ := range components {
    // this manual way of grabbing the component fixes a nasty bug:
    // http://bryce.is/writing/code/jekyll/update/2015/11/01/3-go-gotchas.html
    component := components[i]

    cid := component.ID()

    if m.Components[cid] == nil {
      m.Components[cid] = make(map[EID]*Component)
    }

    m.Components[cid][eid] = &component
  }
}

func (m *Manager) AllEntitiesWithComponent(cid CID) (map[EID]*Component, error) {
  entities, ok := m.Components[cid]
  if !ok { return nil, fmt.Errorf("Could not find component") }

  return entities, nil
}

// utility functions
// Only used for testing, DO NOT RELY ON IT ON ACTUAL CODE
func (m *Manager) GetRect(e EID) (int, int, int, int) {
  c_p, _ := m.GetComponent(e, CollisionComponent)
  p_p, _ := m.GetComponent(e, PositionComponent)
  c := (*c_p).(*Collision)
  p := (*p_p).(*Position)

  return p.NextX, p.NextY, c.W, c.H
}

func (m *Manager) PrintRect(e EID) {
  x, y, w, h := m.GetRect(e)
  fmt.Printf("%d -- (x: %d, y: %d) (x: %d, y: %d)\n", e, x, y, x + w, y + h)
}

