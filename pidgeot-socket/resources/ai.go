package resources

type AISystem struct {
  Hub *Hub
}

func (system AISystem) Loop() {
  for _, behavior := range system.Hub.Forest {
    behavior.Tick()
  }
}
