package resources

import (
  "fmt"
  "strconv"

  "game/pidgeot-socket/ecs"
  "github.com/bxcodec/saint"
)

func ReadBool(members map[string]ecs.ComponentMember, key string) (bool, error) {
  return string(members[key].Value) == "true", nil
}

func ReadInt(members map[string]ecs.ComponentMember, key string) (int, error) {
  v, err := strconv.Atoi(string(members[key].Value))

  if err != nil {
    fmt.Println("binary.Read failed:", err, members)
    panic(err)
    return -1, err
  }
  return v, nil
}

func IsOverlapping(min1 int, max1 int, min2 int, max2 int) bool {
  return max1 > min2 && max2 > min1
}

func CalculateOverlap(min1 int, max1 int, min2 int, max2 int) int {
  return saint.Max(0, saint.Min(max1, max2) - saint.Max(min1, min2))
}

