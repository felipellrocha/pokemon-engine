package resources

import (
  "fmt"
  "encoding/json"
  "encoding/binary"

  "fighter/pidgeot-socket/ecs"
  "github.com/davecgh/go-spew/spew"
)

type Hub struct {
  clients map[*Client]bool
  broadcast chan []byte
  register chan *Client
  unregister chan *Client
  App App
  Map Map
  World ecs.Manager
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

  world := ecs.NewManager()

  hub := Hub{
    broadcast: make(chan []byte),
    register: make(chan *Client),
    unregister: make(chan *Client),
    clients: make(map[*Client]bool),
    App: *app,
    Map: *currentMap,
    World: *world,
  }

  //spew.Dump(app.Entities)

  for i, layer := range currentMap.Layers {
    for j, tile := range layer.Data {
      if tile.SetIndex == ENTITY_SET {
        entity := world.NewEntity()

        definition, ok := app.Entities[tile.EntityId]
        if !ok {
          //fmt.Println("not found! %s")
          continue
        }
        fmt.Printf("%s(%d)\n--------------\n", definition.Name, entity)

        for _, component := range definition.Components {
          members := component.Members
          if component.Name == "RenderComponent" {
            shouldTileX, _ := ReadBool(members, "shouldTileX")
            shouldTileY, _ := ReadBool(members, "shouldTileY")

            render := ecs.Render{
              ShouldTileX: shouldTileX,
              ShouldTileY: shouldTileY,
              Layer: i,
            }

            world.AddComponents(entity, render)
          } else if component.Name == "DimensionComponent" {
            w, _ := ReadInt(members, "w")
            h, _ := ReadInt(members, "h")

            dimension := ecs.Dimension{
              W: w,
              H: h,
            }

            world.AddComponents(entity, dimension)
          } else if component.Name == "PositionComponent" {
            position := ecs.Position{
              X: currentMap.Grid.X(j) * app.Tile.Width,
              Y: currentMap.Grid.Y(j) * app.Tile.Height,
            }

            world.AddComponents(entity, position)
          } else if component.Name == "SpriteComponent" {
            x, _ := ReadInt(members, "x")
            y, _ := ReadInt(members, "y")
            w, _ := ReadInt(members, "w")
            h, _ := ReadInt(members, "h")
            setIndex, _ := ReadInt(component.Members, "src")

            sprite := ecs.Sprite{
              X: x,
              Y: y,
              W: w,
              H: h,
              SetIndex: setIndex,
            }
            spew.Dump(sprite)

            world.AddComponents(entity, sprite)
          }
        }
        //world.AddComponents()
      } else if tile.SetIndex >= 0 {
        entity := world.NewEntity()

        tileset := app.Tilesets[tile.SetIndex]

        sprite := ecs.Sprite{
          X: tileset.X(tile.TileIndex) * app.Tile.Width,
          Y: tileset.Y(tile.TileIndex) * app.Tile.Height,
          W: app.Tile.Width,
          H: app.Tile.Height,
          SetIndex: tile.SetIndex,
        }

        position := ecs.Position{
          X: currentMap.Grid.X(j) * app.Tile.Width,
          Y: currentMap.Grid.Y(j) * app.Tile.Height,
        }
        render := ecs.Render{
          Layer: i,
        }

        world.AddComponents(entity, position, render, sprite)
      }
    }
  }

  return &hub
}

func (h *Hub) Run() {
  for {
    select {
    case client := <-h.register:
      h.clients[client] = true
      // already comes with data lengths
      data := h.World.GetAllRenderableComponents()
      msgType := make([]byte, 2)
      binary.LittleEndian.PutUint16(msgType, ecs.JSON)
      init, err := json.Marshal(h.App)
      if err == nil {
        client.send <- append(msgType, ecs.GetLengthInBytes(init)...)
        client.send <- data
      } else {
        delete(h.clients, client)
        close(client.send)
        fmt.Println("error!", err)
      }
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
