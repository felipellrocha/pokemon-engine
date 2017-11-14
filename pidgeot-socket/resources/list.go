package resources

import (
  "github.com/gin-gonic/gin"
)

type Connection struct {
  Id string `json:"id"`
  NumberOfClients int `json:"number_of_clients"`
}

type Response struct {
  Status string `json:"status"`
  Connections []Connection `json:"connections"`
}

func (r *Resource) ListGames(c *gin.Context) {
  connections := make([]Connection, len(r.Connections))

  i := 0
  for key, hub := range r.Connections {
    connections[i] = Connection{
      Id: key,
      NumberOfClients: len(hub.clients),
    }

    i++
  }

  response := Response{
    Status: "ok",
    Connections: connections,
  }

  c.JSON(200, response)
}
