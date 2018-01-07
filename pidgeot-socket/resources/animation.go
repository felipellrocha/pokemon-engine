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
    c, err := system.Hub.World.GetComponent(entity, ecs.CollisionComponent)

    animation := (*a).(*ecs.Animation)
    sprite := (*s).(*ecs.Sprite)

    if err == nil {
      collision := (*c).(*ecs.Collision)

      if collision.ImpulseY < 0 {
        animation.Type = 3
      } else if collision.ImpulseY > 0 {
        animation.Type = 4
      } else if collision.ImpulseY == 0 && collision.IsJumping {
          animation.Type = 0
      } else if collision.ImpulseX > 0 {
        animation.Type = 2
      } else if collision.ImpulseX < 0 {
        animation.Type = 2
      } else {
        animation.Type = 0
      }
    }


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
