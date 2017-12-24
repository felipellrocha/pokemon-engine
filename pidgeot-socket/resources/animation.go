package resources

import (
  "strconv"

  "game/pidgeot-socket/ecs"
)

type AnimationSystem struct {
  Hub *Hub
}

func (system AnimationSystem) Loop() {
  entities, err := system.Hub.World.AllEntitiesWithComponent(ecs.AnimationComponent)
  if err != nil {
    return
  }

  for entity, _ := range entities {
    a, _ := system.Hub.World.GetComponent(entity, ecs.AnimationComponent)
    s, _ := system.Hub.World.GetComponent(entity, ecs.SpriteComponent)

    animation := (*a).(*ecs.Animation)
    sprite := (*s).(*ecs.Sprite)
    definition := system.Hub.App.Animations[animation.Type]

    if keyframe, ok := definition.Keyframes[strconv.Itoa(animation.Frame)]; ok {
      sprite.X = keyframe.X
      sprite.Y = keyframe.Y
      sprite.W = keyframe.W
      sprite.H = keyframe.H

      system.Hub.broadcast <- system.Hub.World.GetComponentMessage(entity, s)

      if c, err := system.Hub.World.GetComponent(entity, ecs.CollisionComponent); err == nil {
        collision := (*c).(*ecs.Collision)

        collision.W = keyframe.W
        collision.H = keyframe.H

        system.Hub.broadcast <- system.Hub.World.GetComponentMessage(entity, c)
      }
    }

    animation.Frame = (animation.Frame + 1) % definition.NumberOfFrames
  }
}
