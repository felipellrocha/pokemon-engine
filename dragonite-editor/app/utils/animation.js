export const getFrame = function(keyframes, frameIndex) {
  for (let i = frameIndex; i >= 0; i--) {
    const frame = keyframes[i];

    if (frame) return frame;
  }

  return null;
};

