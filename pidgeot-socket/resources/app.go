package resources

import (
  "io/ioutil"
  "encoding/json"
)

type MapDescription struct {
  Id string `json:"id"`
  Name string `json:"name"`
}

type App struct {
  InitialMap int `json:"initialMap"`
  Name string `json:"name"`
  Maps []MapDescription `json:"maps"`
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
