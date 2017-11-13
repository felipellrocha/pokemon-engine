package main

import (
  "fmt"

  "github.com/gin-gonic/gin"

  "fighter/pidgeot-socket/service"
  "fighter/pidgeot-socket/routes"
)

func Health(c *gin.Context) {
  response := gin.H{
    "status": "ok",
  }

  c.JSON(200, response)
}

func main() {
  r := gin.Default()
  hub := service.NewHub()
  go hub.Run()

  r.POST("/game", routes.CreateGame)
  r.GET("/health", Health)
  r.GET("/ws", func(c *gin.Context) {
    fmt.Println("connecting...")
    service.ServeWS(hub, c.Writer, c.Request)
  })

  fmt.Println("Listening on port 8000")

  r.Run(":8000")
}
