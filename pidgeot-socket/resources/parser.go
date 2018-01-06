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

func GetSlice(members map[string]interface{}, key string) ([]interface{}, error) {
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
    b, _ := GetSlice(behavior["properties"].(map[string]interface{}), "children")
    behaviors := make([]ai.Behavior, len(b))

    for i, _ := range b {
      behaviors[i] = h.CreateBehavior(b[i].(map[string]interface{}), entity)
    }

    //test := ai.NewTest(entity, &h.World)
    return ai.NewSequence(entity, &h.World, behaviors...)
  }

  if name == "Test" {
    return ai.NewTest(entity, &h.World)
  }

  return nil
}
