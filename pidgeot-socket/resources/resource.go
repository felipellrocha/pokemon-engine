package resources

type Resource struct {
  Connections map[string]*Hub
}

func NewResource() *Resource {
  return &Resource{
    Connections: make(map[string]*Hub),
  }
}

