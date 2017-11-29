package resources

import (
  "fmt"
  "time"
  "encoding/json"
  "encoding/binary"

  "fighter/pidgeot-socket/ecs"
)

type Hub struct {
  clients map[*Client]bool
  broadcast chan []byte
  register chan *Client
  unregister chan *Client
  App ecs.App
  Map ecs.Map
  World ecs.Manager
  Systems []ecs.System
}

func NewHub() *Hub {
  app, err := ecs.GetApp()
  if err != nil {
    panic(fmt.Sprintf("Could not open up app: %s", err))
  }

  mapId := app.GetInitialMap()
  currentMap, err := ecs.GetMap(mapId)

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
    Systems: make([]ecs.System, 0),
  }

  hub.RegisterSystem(AnimationSystem{
    Hub: hub,
  })

  for i, layer := range currentMap.Layers {
    for j, tile := range layer.Data {
      if tile.SetIndex == ecs.ENTITY_SET {
        hub.CreateFromEntityId(tile.EntityId, i, j)
      } else if tile.SetIndex == ecs.OBJECT_SET {
        entity :=  hub.CreateFromEntityId(tile.ObjectDescription.EntityId, i, j)

        position := &ecs.Position{
          X: tile.ObjectDescription.Rect.X,
          Y: tile.ObjectDescription.Rect.Y,
        }

        dimension := &ecs.Dimension{
          W: tile.ObjectDescription.Rect.W,
          H: tile.ObjectDescription.Rect.H,
        }

        world.AddComponents(entity, position, dimension)
      } else if tile.SetIndex > ecs.EMPTY_SET {
        entity := world.NewEntity()

        tileset := app.Tilesets[tile.SetIndex]

        sprite := &ecs.Sprite{
          X: tileset.X(tile.TileIndex) * app.Tile.Width,
          Y: tileset.Y(tile.TileIndex) * app.Tile.Height,
          W: app.Tile.Width,
          H: app.Tile.Height,
          SetIndex: tile.SetIndex,
        }

        position := &ecs.Position{
          X: currentMap.Grid.X(j) * app.Tile.Width,
          Y: currentMap.Grid.Y(j) * app.Tile.Height,
        }
        render := &ecs.Render{
          Layer: i,
        }

        world.AddComponents(entity, position, render, sprite)
      }
    }
  }

  return &hub
}

func (hub *Hub) CreateFromEntityId(entityId string, layer int, tile int) ecs.EID {
  entity := hub.World.NewEntity()

  definition, ok := hub.App.Entities[entityId]
  if !ok {
    //fmt.Println("not found! %s")
    return entity
  }

  for _, component := range definition.Components {
    members := component.Members
    if component.Name == "RenderComponent" {
      shouldTileX, _ := ReadBool(members, "shouldTileX")
      shouldTileY, _ := ReadBool(members, "shouldTileY")

      render := &ecs.Render{
        ShouldTileX: shouldTileX,
        ShouldTileY: shouldTileY,
        Layer: layer,
      }

      hub.World.AddComponents(entity, render)
    } else if component.Name == "AnimationComponent" {
      definition, _ := ReadInt(members, "animation")

      animation := &ecs.Animation{
        Type: definition,
        Frame: 0,
        IsAnimating: false,
      }

      hub.World.AddComponents(entity, animation)
    } else if component.Name == "DimensionComponent" {
      w, _ := ReadInt(members, "w")
      h, _ := ReadInt(members, "h")

      dimension := &ecs.Dimension{
        W: w,
        H: h,
      }

      hub.World.AddComponents(entity, dimension)
    } else if component.Name == "PositionComponent" {
      position := &ecs.Position{
        X: hub.Map.Grid.X(tile) * hub.App.Tile.Width,
        Y: hub.Map.Grid.Y(tile) * hub.App.Tile.Height,
      }

      hub.World.AddComponents(entity, position)
    } else if component.Name == "SpriteComponent" {
      x, _ := ReadInt(members, "x")
      y, _ := ReadInt(members, "y")
      w, _ := ReadInt(members, "w")
      h, _ := ReadInt(members, "h")
      setIndex, _ := ReadInt(component.Members, "src")

      sprite := &ecs.Sprite{
        X: x,
        Y: y,
        W: w,
        H: h,
        SetIndex: setIndex,
      }

      hub.World.AddComponents(entity, sprite)
    }
  }

  return entity
}

func (h *Hub) RegisterSystem(system ecs.System) {
  h.Systems = append(h.Systems, system)
}

func (h *Hub) Loop() {
  tick := time.Tick(16 * time.Millisecond)
  for {
    select {
    case <-tick:
      for _, system := range h.Systems {
        system.Loop()
      }
    }
  }
}

func (h *Hub) Listen() {
  for {
    select {
    case client := <-h.register:
      h.clients[client] = true
      // already comes with data lengths
      data := h.World.GetAllRenderableComponents()
      msgType := make([]byte, 2)
      binary.LittleEndian.PutUint16(msgType, ecs.JSON)
      if init, err := json.Marshal(h.App); err == nil {
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
