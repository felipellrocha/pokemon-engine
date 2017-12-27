package resources

import (
  "fmt"
  "strconv"

  "game/pidgeot-socket/ecs"
  "github.com/bxcodec/saint"
)

func ReadBool(members map[string]ecs.ComponentMember, key string, def bool) (bool, error) {
  if Key, ok := members[key]; ok {
    return string(Key.Value) == "true", nil
  } else {
    return def, nil
  }
}

func ReadInt(members map[string]ecs.ComponentMember, key string, def int) (int, error) {
  Key, ok := members[key];
  if !ok {
    return def, nil
  }

  v, err := strconv.Atoi(string(Key.Value))

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

