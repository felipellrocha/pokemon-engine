package resources

import (
  "errors"
  "fmt"
  "time"
  "encoding/json"
  "encoding/binary"

  "game/pidgeot-socket/ecs"
  "game/pidgeot-socket/ai"
)

type SpawnTypes uint8
const (
  Player SpawnTypes = iota
)

type SpawnPoint struct {
  EntityId int
  Layer int
  Index int
}

type Hub struct {
  clients map[*Client]bool
  broadcast chan []byte
  register chan *Client
  unregister chan *Client
  SpawnPoints map[SpawnTypes][]SpawnPoint
  Inputs chan Input
  App ecs.App
  Map ecs.Map
  World ecs.Manager
  Forest []ai.Behavior
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
    SpawnPoints: make(map[SpawnTypes][]SpawnPoint),
    Inputs: make(chan Input, 64),
    App: *app,
    Map: *currentMap,
    World: *world,
    Forest: make([]ai.Behavior, 0),
    Systems: make([]ecs.System, 0),
  }

  hub.RegisterSystem(
    InputSystem{
      Hub: &hub,
    },
    AISystem{
      Hub: &hub,
    },
    PhysicsSystem{
      Hub: &hub,
    },
    AnimationSystem{
      Hub: &hub,
    },
  )


  hub.SpawnPoints[Player] = make([]SpawnPoint, 0)

  for i, _ := range currentMap.Layers {
    layer := currentMap.Layers[i]

    if !layer.Visible { continue }

    for j, _ := range layer.Data {
      tile := layer.Data[j]

      if tile.SetIndex == ecs.ENTITY_SET {
        definition := app.Entities[tile.EntityId]

        if definition.Name == "player" {
          hub.SpawnPoints[Player] = append(hub.SpawnPoints[Player], SpawnPoint{
            EntityId: tile.EntityId,
            Layer: i,
            Index: j,
          })
        } else {
          hub.CreateFromEntityId(tile.EntityId, i, j)
        }
      } else if tile.SetIndex == ecs.OBJECT_SET {
        entity, _, _ := hub.CreateFromEntityId(tile.ObjectDescription.EntityId, i, j)

        if c, err := hub.World.GetComponent(entity, ecs.CollisionComponent); err == nil {
          // if a collision component exists, let's try and update some of its data
          collision := c.(*ecs.Collision)

          collision.W = tile.ObjectDescription.Rect.W
          collision.H = tile.ObjectDescription.Rect.H
        }

        position := &ecs.Position{
          X: tile.ObjectDescription.Rect.X,
          Y: tile.ObjectDescription.Rect.Y,
          NextX: tile.ObjectDescription.Rect.X,
          NextY: tile.ObjectDescription.Rect.Y,
        }

        dimension := &ecs.Dimension{
          W: tile.ObjectDescription.Rect.W,
          H: tile.ObjectDescription.Rect.H,
        }

        hub.World.AddComponents(entity, position, dimension)
      } else if tile.SetIndex > ecs.EMPTY_SET {
        // create an actual tile
        entity := hub.World.NewEntity()

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
          NextX: currentMap.Grid.X(j) * app.Tile.Width,
          NextY: currentMap.Grid.Y(j) * app.Tile.Height,
        }

        render := &ecs.Render{
          Layer: i,
        }

        hub.World.AddComponents(entity, render, sprite, position)
      }
    }
  }

  return &hub
}

func (hub *Hub) CreateFromEntityId(entityId int, layer int, tile int) (ecs.EID, []byte, error) {
  entity := hub.World.NewEntity()

  if entityId > len(hub.App.Entities) {
    err := errors.New("Entity not found! %s")
    return entity, nil, err
  }

  definition := hub.App.Entities[entityId]
  components := make([]ecs.Component, 0)

  for i, _ := range definition.Components {
    component := definition.Components[i]
    members := component.Members
    if component.Name == "RenderComponent" {
      shouldTileX, _ := ReadBool(members, "shouldTileX", false)
      shouldTileY, _ := ReadBool(members, "shouldTileY", false)

      render := &ecs.Render{
        ShouldTileX: shouldTileX,
        ShouldTileY: shouldTileY,
        Layer: layer,
      }

      components = append(components, render)
    } else if component.Name == "AnimationComponent" {
      idle, _ := ReadInt(members, "idle", 0)
      running, _ := ReadInt(members, "running", 0)
      jumping, _ := ReadInt(members, "jumping", 0)
      falling, _ := ReadInt(members, "falling", 0)

      animation := &ecs.Animation{
        Type: 0,
        Frame: 0,
        IsAnimating: false,

        Idle: idle,
        Running: running,
        Jumping: jumping,
        Falling: falling,
      }

      components = append(components, animation)
    } else if component.Name == "DimensionComponent" {
      w, _ := ReadInt(members, "w", 0)
      h, _ := ReadInt(members, "h", 0)

      dimension := &ecs.Dimension{
        W: w,
        H: h,
      }

      components = append(components, dimension)
    } else if component.Name == "PositionComponent" {
      position := &ecs.Position{
        X: hub.Map.Grid.X(tile) * hub.App.Tile.Width,
        Y: hub.Map.Grid.Y(tile) * hub.App.Tile.Height,
        NextX: hub.Map.Grid.X(tile) * hub.App.Tile.Width,
        NextY: hub.Map.Grid.Y(tile) * hub.App.Tile.Height,
      }

      components = append(components, position)
    } else if component.Name == "SpriteComponent" {
      x, _ := ReadInt(members, "x", 0)
      y, _ := ReadInt(members, "y", 0)
      w, _ := ReadInt(members, "w", 0)
      h, _ := ReadInt(members, "h", 0)
      setIndex, _ := ReadInt(component.Members, "texture", 0)

      sprite := &ecs.Sprite{
        X: x,
        Y: y,
        W: w,
        H: h,
        SetIndex: setIndex,
      }

      components = append(components, sprite)
    } else if component.Name == "CollisionComponent" {
      isStatic, _ := ReadBool(members, "isStatic", true)
      isColliding, _ := ReadBool(members, "isColliding", false)
      withGravity, _ := ReadBool(members, "withGravity", false)

      x, _ := ReadInt(members, "x", 0)
      y, _ := ReadInt(members, "y", 0)
      w, _ := ReadInt(members, "w", 0)
      h, _ := ReadInt(members, "h", 0)

      collision := &ecs.Collision{
        IsStatic: isStatic,
        IsColliding: isColliding,
        WithGravity: withGravity,
        MaxSpeedY: 15,
        JumpImpulse: 15,
        X: x,
        Y: y,
        W: w,
        H: h,
      }

      components = append(components, collision)
    } else if component.Name == "AIComponent" {
      script, _ := ReadBytes(members, "script")
      tree := hub.CreateAI(script, entity)
      hub.Forest = append(hub.Forest, tree)
    }
  }

  hub.World.AddComponents(entity, components...)
  return entity, hub.World.GetComponentMessages(entity, components...), nil
}

func (h *Hub) RegisterSystem(systems ...ecs.System) {
  h.Systems = append(h.Systems, systems...)
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
  spawnIndex := 0

  for {
    select {
    case client := <-h.register:
      h.clients[client] = true
      data := h.World.GetAllRenderableComponents()
      msgType := make([]byte, 2)
      binary.LittleEndian.PutUint16(msgType, uint16(ecs.JSON))

      spawn := h.SpawnPoints[Player][spawnIndex]
      eid, entity, _ := h.CreateFromEntityId(spawn.EntityId, spawn.Layer, spawn.Index)

      client.Eid = eid

      if init, err := json.Marshal(h.App); err == nil {
        client.send <- append(msgType, ecs.GetLengthInBytes(init)...)
        client.send <- data

        spawnIndex = (spawnIndex + 1) % len(h.SpawnPoints[Player])

        for c := range h.clients {
          c.send <- entity
        }
      } else {
        delete(h.clients, client)
        close(client.send)
        fmt.Println("error!", err)
      }
    case client := <-h.unregister:
      if _, ok := h.clients[client]; ok {
        data := h.World.DeleteEntity(client.Eid)

        for c := range h.clients {
          c.send <- data
        }

        close(client.send)

        delete(h.clients, client)
      }
    case message := <-h.broadcast:
      for client := range h.clients {
        client.send <- message
      }
    }
  }
}
