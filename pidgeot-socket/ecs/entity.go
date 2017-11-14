package ecs

import (
  "fmt"
)

type EID uint16

type Manager struct {
  lowestEntityId int
  Components map[CID]map[EID]Component
}

func NewManager() *Manager {
  return &Manager{
    Components: make(map[CID]map[EID]Component),
  }
}

func (m *Manager) NewEntity() EID {
  m.lowestEntityId++
  return EID(m.lowestEntityId)
}

func (m *Manager) AddComponents(eid EID, components ...Component) {
  for _, component := range components {
    cid := component.ID()

    if m.Components[cid] == nil {
      m.Components[cid] = make(map[EID]Component)
    }

    m.Components[cid][eid] = component
  }
}

func (m *Manager) GetComponent(eid EID, cid CID) (*Component, error) {
  entities, ok := m.Components[cid]
  if !ok { return nil, fmt.Errorf("Could not find component") }

  component, ok := entities[eid]
  if !ok { return nil, fmt.Errorf("Could not find entity") }

  return &component, nil
}

func (m *Manager) AllEntitiesWithComponent(cid CID) (map[EID]Component, error) {
  entities, ok := m.Components[cid]
  if !ok { return nil, fmt.Errorf("Could not find component") }

  return entities, nil
}
