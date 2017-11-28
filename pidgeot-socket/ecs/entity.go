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

func (m *Manager) GetComponentMessage(eid EID, cid CID) []byte {
  entities, ok := m.Components[cid]
  if !ok { return nil }

  component, ok := entities[eid]
  if !ok { return nil }

  buffer := new(bytes.Buffer)
  if err := binary.Write(buffer, binary.LittleEndian, uint16(cid)); err != nil { fmt.Println("error!", err) }
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
