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
    c, cerr := system.Hub.World.GetComponent(entity, ecs.CollisionComponent)

    animation := (*a).(*ecs.Animation)
    sprite := (*s).(*ecs.Sprite)

    if cerr == nil {
      collision := (*c).(*ecs.Collision)

      if collision.ImpulseY < 0 {
        // jumping
        animation.Type = animation.Jumping
      } else if collision.ImpulseY > 0 {
        animation.Type = animation.Falling
      } else if collision.ImpulseY == 0 && collision.IsJumping {
        animation.Type = animation.Idle
      } else if collision.ImpulseX > 0 {
        animation.Type = animation.Running
      } else if collision.ImpulseX < 0 {
        animation.Type = animation.Running
      } else {
        animation.Type = animation.Idle
      }
    }

    definition := system.Hub.App.Animations[animation.Type]

    if keyframe, ok := definition.Keyframes[strconv.Itoa(animation.Frame)]; ok {
      sprite.X = keyframe.X
      sprite.Y = keyframe.Y
      sprite.W = keyframe.W
      sprite.H = keyframe.H

      system.Hub.broadcast <- system.Hub.World.GetComponentMessage(entity, s)

      if cerr == nil {
        collision := (*c).(*ecs.Collision)

        collision.W = keyframe.W
        collision.H = keyframe.H

        system.Hub.broadcast <- system.Hub.World.GetComponentMessage(entity, c)
      }
    }

    animation.Frame = (animation.Frame + 1) % definition.NumberOfFrames
  }
}
