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

  /*
  m := ecs.NewManager()
  player := m.NewEntity()

  var health1 ecs.Health
  var position1 ecs.Position

  other := m.NewEntity()

  var health2 ecs.Health
  var position2 ecs.Position
  var sprite2 ecs.Sprite

  m.AddComponents(player, health1, position1)
  m.AddComponents(other, health2, position2, sprite2)

  fmt.Printf("%+v\n", m)

  c, _ := m.GetComponent(other, ecs.HealthComponent)
  fmt.Printf("%+v\n", *c)

  a, _ := m.AllEntitiesWithComponent(ecs.HealthComponent)
  fmt.Printf("%+v\n", a)
  */

  router.Run(":8000")
}
