package ecs

import (
  "fmt"
  "strconv"
  "io/ioutil"
  "encoding/json"
)

const (
  EMPTY_SET = -1
  ENTITY_SET = -2
  OBJECT_SET = -3
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

type Rect struct {
  X int `json:"x"`
  Y int `json:"y"`
  W int `json:"w"`
  H int `json:"h"`
}

type ObjectDescription struct {
  EntityId int `json:"entity"`
  Rect Rect `json:"rect"`
}

type Tile struct {
  SetIndex int
  TileIndex int
  EntityId int
  ObjectDescription ObjectDescription
}

func (r *Tile) UnmarshalJSON(data []byte) error {
  var values []json.RawMessage
  if err := json.Unmarshal(data, &values); err != nil {
    return err
  }

  setIndex, err := strconv.Atoi(string(values[0]))

  if err != nil { return fmt.Errorf("Could not unpack SetIndex: %d", setIndex) }

  if setIndex >= EMPTY_SET {
    tileIndex, err := strconv.Atoi(string(values[1]))

    if err != nil { return fmt.Errorf("Could not unpack TileIndex: %d", tileIndex)  }

    r.SetIndex = setIndex
    r.TileIndex = tileIndex
  } else if setIndex == OBJECT_SET {
    r.SetIndex = setIndex
    if err := json.Unmarshal(values[1], &r.ObjectDescription); err != nil {
      return fmt.Errorf("Could not unpack object set: %s\n%s", values[1], err)
    }
  } else if setIndex == ENTITY_SET {
    r.SetIndex = setIndex
    tileIndex, err := strconv.Atoi(string(values[1]))

    if err != nil { return fmt.Errorf("Could not unpack EntityIndex. Tile: (%s, %s)", string(values[0]), string(values[1]))  }
    //if err != nil { return fmt.Errorf("Could not unpack EntityIndex: %d", tileIndex)  }

    r.EntityId = tileIndex
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
