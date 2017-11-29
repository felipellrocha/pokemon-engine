package resources

import (
  "fmt"

  "github.com/gin-gonic/gin"
  "github.com/satori/go.uuid"
)

func (r *Resource) CreateGame(c *gin.Context) {
  uuid := uuid.NewV4().String()

  hub := NewHub()
  r.Connections[uuid] = hub

  go hub.Listen()
  go hub.Loop()

  //fmt.Println("%#v\n", hub.World)

  response := gin.H{
    "status": "ok",
    "game": uuid,
  }

  c.JSON(200, response)
}

func (r *Resource) JoinGame(c *gin.Context) {
  game_id := c.Param("game_id")

  if hub, ok := r.Connections[game_id]; ok {
    fmt.Printf("connecting to game_id: %s\n", game_id)
    ServeWS(hub, c.Writer, c.Request)
  } else {
    response := gin.H{
      "status": "error",
      "message": "Game not found",
    }

    c.JSON(400, response)
  }
}
