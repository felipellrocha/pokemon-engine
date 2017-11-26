package ecs

import (
  "testing"
  "fmt"
)

func GetManager() *Manager {
  m := NewManager()
  player := m.NewEntity()

  health1 := Health{
    CurrentHearts: 5,
    MaxHearts: 10,
    CurrentEnergy: 17,
    MaxEnergy: 20,
  }
  position1 := Position{
    X: 10,
    Y: 20,
    Direction: 2,
  }

  other := m.NewEntity()

  health2 := Health{
    CurrentHearts: 5,
    MaxHearts: 10,
    CurrentEnergy: 17,
    MaxEnergy: 200,
  }
  var sprite2 Sprite

  m.AddComponents(player, health1, position1)
  m.AddComponents(other, health2, sprite2)

  return m
}

  /*
func TestSomething (t *testing.T) {

  fmt.Printf("%+v\n", m)

  c, _ := m.GetComponent(other, HealthComponent)
  fmt.Printf("%+v\n", *c)

  a, _ := m.AllEntitiesWithComponent(HealthComponent)
  fmt.Printf("%+v\n", a)
  */


func TestBinaryEnconding (t *testing.T) {
  position := Position{
    X: 10,
    Y: 20,
    Direction: 2,
  }

  bin := position.ToBinary()
  fmt.Printf("%b\n", bin)

  last := bin[len(bin) - 1]

  fmt.Printf("%b\n", last)

  if last != 2 {
    t.Error("Expected 2, got ", last)
  }
}
