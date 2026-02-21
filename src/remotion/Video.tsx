import { Sequence } from 'remotion';
import { SCENES } from './styles';
import { IntroScene } from './scenes/IntroScene';
import { PainPointScene } from './scenes/PainPointScene';
import { FeaturesScene } from './scenes/FeaturesScene';
import { StatsScene } from './scenes/StatsScene';
import { CTAScene } from './scenes/CTAScene';

export const Video: React.FC = () => {
  return (
    <>
      <Sequence from={SCENES.intro.start} durationInFrames={SCENES.intro.duration}>
        <IntroScene />
      </Sequence>
      <Sequence from={SCENES.painPoints.start} durationInFrames={SCENES.painPoints.duration}>
        <PainPointScene />
      </Sequence>
      <Sequence from={SCENES.features.start} durationInFrames={SCENES.features.duration}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={SCENES.stats.start} durationInFrames={SCENES.stats.duration}>
        <StatsScene />
      </Sequence>
      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.duration}>
        <CTAScene />
      </Sequence>
    </>
  );
};
