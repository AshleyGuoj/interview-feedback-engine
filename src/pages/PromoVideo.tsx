import { Player } from '@remotion/player';
import { Video } from '@/remotion/Video';
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS, TOTAL_FRAMES } from '@/remotion/styles';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PromoVideo() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-[1200px] space-y-6">
        <div>
          <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.03em] leading-tight text-foreground">
            宣传短片预览
          </h1>
          <p className="text-[15px] text-muted-foreground mt-2 leading-relaxed">
            30 秒 OfferMind 宣传视频 · 使用 Remotion 构建
          </p>
        </div>

        <div className="rounded-xl overflow-hidden border border-border bg-black">
          <Player
            component={Video}
            durationInFrames={TOTAL_FRAMES}
            fps={FPS}
            compositionWidth={VIDEO_WIDTH}
            compositionHeight={VIDEO_HEIGHT}
            style={{ width: '100%' }}
            controls
            autoPlay
            loop
          />
        </div>

        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">导出 MP4 步骤：</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>将项目 Clone 到本地</li>
            <li>运行 <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">npm install</code></li>
            <li>运行 <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">npx remotion render src/remotion/Root.tsx OfferMindPromo out/promo.mp4</code></li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}
