package resources

import (
  "fmt"

  "fighter/pidgeot-socket/ecs"
)

type Hub struct {
  clients map[*Client]bool
  broadcast chan []byte
  register chan *Client
  unregister chan *Client
  App App
  Map Map
  World Manager
}

func NewHub() *Hub {
  app, err := getApp()
  if err != nil {
    panic(fmt.Sprintf("Could not open up app: %s", err))
  }

  mapId := app.GetInitialMap()
  currentMap, err := getMap(mapId)

  if err != nil {
    fmt.Sprintf("Could not open up map: %s\n", err)
    panic(err)
  }

  hub := Hub{
    broadcast: make(chan []byte),
    register: make(chan *Client),
    unregister: make(chan *Client),
    clients: make(map[*Client]bool),
    App: *app,
    Map: *currentMap,
    World: NewManager(),
  }

  return &hub
}

func (h *Hub) Run() {
  for {
    select {
    case client := <-h.register:
      h.clients[client] = true
    case client := <-h.unregister:
      if _, ok := h.clients[client]; ok {
        delete(h.clients, client)
        close(client.send)
      }
    case message := <-h.broadcast:
      for client := range h.clients {
        client.send <- message
      }
    }
  }
}
