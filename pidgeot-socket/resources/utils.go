package resources

import (
  "fmt"
  "strconv"

  "fighter/pidgeot-socket/ecs"
)

func ReadBool(members map[string]ecs.ComponentMember, key string) (bool, error) {
  return string(members[key].Value) == "true", nil
}

func ReadInt(members map[string]ecs.ComponentMember, key string) (int, error) {
  //fmt.Println(data, string(data))
  v, err := strconv.Atoi(string(members[key].Value))

  if err != nil {
    fmt.Println("binary.Read failed:", err)
    return -1, err
  }
  return v, nil
}