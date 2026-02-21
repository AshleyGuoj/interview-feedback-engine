import { Composition } from 'remotion';
import { Video } from './Video';
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS, TOTAL_FRAMES } from './styles';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="OfferMindPromo"
      component={Video}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
};
