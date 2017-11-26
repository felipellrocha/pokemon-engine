package resources

import (
  "io/ioutil"
  "encoding/json"
)

type MapDescription struct {
  Id string `json:"id"`
  Name string `json:"name"`
}

type Dimensions struct {
	Width int `json:"width"`
	Height int `json:"height"`
}

type TerrainDefinition struct {
	Type string `json:"type"`
}

type Tileset struct {
  Source string `json:"src"`
  Name string `json:"name"`
  Rows int `json:"rows"`
  Columns int `json:"columns"`
  Type string `json:"type"`
	Terrain map[string]TerrainDefinition `json:"terrains"`
}

func (t *Tileset) X(index int) int {
  return index % t.Columns;
}

func (t *Tileset) Y(index int) int {
  return index / t.Columns;
}

type Keyframe struct {
  X int `json:"x"`
  Y int `json:"y"`
  W int `json:"w"`
  H int `json:"h"`
}

type Animation struct {
  Id string `json:"id"`
  NumberOfFrames int `json:"numberOfFrames"`
  SpriteSheet int `json:"spritesheet"`
  Keyframes map[string]Keyframe `json:"keyframes"`
}

type ComponentMember struct {
	Name string `json:"name"`
	Type string `json:"type"`
	Pointer bool `json:"pointer"`
	Value json.RawMessage `json:"value"`
}

type ComponentDescription struct {
	Name string `json:"name"`
	Members map[string]ComponentMember `json:"members"`
}

type Entity struct {
  Name string `json:"name"`
  Components []ComponentDescription `json:"components"`
}

type App struct {
  InitialMap int `json:"initialMap"`
	Tile Dimensions `json:"tile"`
  Name string `json:"name"`
  Tilesets []Tileset `json:"tilesets"`
  Maps []MapDescription `json:"maps"`
  Animations map[string]Animation `json:"animations"`
  Entities map[string]Entity `json:"entities"`
}

func (w *App) GetInitialMap() string {
  return w.GetMapById(w.InitialMap)
}

func (w *App) GetMapById(index int) string {
  return w.Maps[index].Id
}

func getApp() (*App, error) {
  file, err := ioutil.ReadFile("./assets/game.targ/app.json")

  if err != nil {
    return nil, err
  }

  var app App

  if err := json.Unmarshal(file, &app); err != nil {
    return nil, err
  } else {
    return &app, nil
  }
}
