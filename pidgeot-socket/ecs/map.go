package ecs

import (
  "fmt"
  "strings"
  "strconv"
  "io/ioutil"
  "encoding/json"
)

const (
  EMPTY_SET = -1
  ENTITY_SET = -2
)

type Grid struct {
  Columns int `json:"columns"`
  Rows int `json:"rows"`
}

func (g *Grid) X(index int) int {
  return index % g.Columns;
}

func (g *Grid) Y(index int) int {
  return index / g.Columns;
}

type Layer struct {
  Id string `json:"id"`
  Type string `json:"string"`
  Visible bool `json:"visible"`
  Data []Tile `json:"data"`
}

type Map struct {
  Grid Grid `json:"grid"`
  Layers []Layer `json:"layers"`
}

type Tile struct {
  SetIndex int
  TileIndex int
  EntityId string
}

func (r *Tile) UnmarshalJSON(data []byte) error {
  var values []json.RawMessage
  if err := json.Unmarshal(data, &values); err != nil {
    return err
  }

  i, err := strconv.Atoi(string(values[0]))

  if err != nil { return fmt.Errorf("Could not unpack SetIndex: %d", i) }

  if i >= -1 {
    j, err := strconv.Atoi(string(values[1]))

    if err != nil { return fmt.Errorf("Could not unpack TileIndex: %d", j)  }

    r.SetIndex = i
    r.TileIndex = j
  } else if i == ENTITY_SET {
    r.SetIndex = i
    r.EntityId = strings.Trim(string(values[1]), "\"")
  }

  return nil
}

func GetMap(mapName string) (*Map, error) {
  filename := fmt.Sprintf("./assets/game.targ/maps/%s.json", mapName)
  file, err := ioutil.ReadFile(filename)

  if err != nil {
    return nil, err
  }

  var currentMap Map

  if err := json.Unmarshal(file, &currentMap); err != nil {
    return nil, err
  } else {
    return &currentMap, nil
  }
}
