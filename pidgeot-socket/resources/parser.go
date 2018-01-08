package resources

import (
  "fmt"

  "encoding/json"

  "game/pidgeot-socket/ai"
  "game/pidgeot-socket/ecs"
)

func (h *Hub) CreateAI(data []byte, entity ecs.EID) *ai.BehaviorTree {
  //&hub.World
  //var script map[string]json.RawMessage
  var script []interface{}

  if err := json.Unmarshal(data, &script); err != nil {
    fmt.Println(err)
  }

  for _, behavior := range script {
    b := h.CreateBehavior(behavior.(map[string]interface{}), entity)
    return ai.NewBehaviorTree(b)
  }

  return nil
}

func GetInt(m interface{}, key string, def int) (int, error) {
  members := m.(map[string]interface{})

  if k, ok := members[key]; ok {
    Key := k.(map[string]interface{})
    return int(Key["value"].(float64)), nil
  } else {
    return def, nil
  }
}

func GetSlice(m interface{}, key string) ([]interface{}, error) {
  members := m.(map[string]interface{})

  if k, ok := members[key]; ok {
    Key := k.(map[string]interface{})
    return Key["value"].([]interface{}), nil
  } else {
    return make([]interface{}, 0), nil
  }
}

func (h *Hub) CreateBehavior(behavior map[string]interface{}, entity ecs.EID) ai.Behavior {
  name := behavior["name"].(string)

  if name == "Sequence" {
    b, _ := GetSlice(behavior["properties"], "children")
    behaviors := make([]ai.Behavior, len(b))

    for i, _ := range b {
      behaviors[i] = h.CreateBehavior(b[i].(map[string]interface{}), entity)
    }

    return ai.NewSequence(entity, &h.World, behaviors...)
  }

  if name == "Walk" {
    impulse, _ := GetInt(behavior["properties"], "impulse", 1)
    return ai.NewWalk(impulse, entity, &h.World)
  }

  return nil
}
