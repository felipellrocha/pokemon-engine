package main

import (
  "fmt"

  "github.com/gin-gonic/gin"

  "fighter/pidgeot-socket/resources"
)

func Health(c *gin.Context) {
  response := gin.H{
    "status": "ok",
  }

  c.JSON(200, response)
}


func main() {
  router := gin.Default()
  resource := resources.NewResource()

  router.GET("/health", Health)
  router.POST("/game", resource.CreateGame)
  router.GET("/game/:game_id", resource.JoinGame)
  router.GET("/games", resource.ListGames)

  fmt.Println("Listening on port 8000")

  router.Run(":8000")
}
