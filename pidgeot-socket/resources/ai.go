package resources

import (
  _"game/pidgeot-socket/ecs"
)

type AISystem struct {
  Hub *Hub
}

func (system AISystem) Loop() {
  for _, behavior := range system.Hub.Forest {
    behavior.Tick(behavior)
  }
}
