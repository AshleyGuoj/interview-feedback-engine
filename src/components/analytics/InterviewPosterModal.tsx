import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job, InterviewStage, QUESTION_CATEGORIES } from '@/types/job';
import { format } from 'date-fns';
import {
  Building2,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check,
  Lightbulb,
  Download,
  Copy,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import offermindLogo from '@/assets/offermind-logo-clean.png';

const QUALITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: '表现良好', color: '#16a34a' },
  medium: { label: '表现一般', color: '#6b7280' },
  low: { label: '有待提升', color: '#dc2626' },
};

interface InterviewPosterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  stage: InterviewStage;
}

export function InterviewPosterModal({ open, onOpenChange, job, stage }: InterviewPosterModalProps) {
  const { t } = useTranslation();
  const posterRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const generateImage = async (): Promise<string> => {
    if (!posterRef.current) throw new Error('Poster ref not found');
    return await toPng(posterRef.current, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const dataUrl = await generateImage();
      const link = document.createElement('a');
      link.download = `面试复盘-${job.companyName}-${stage.name}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('海报已下载');
    } catch (err) {
      console.error(err);
      toast.error('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const dataUrl = await generateImage();
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('海报已复制到剪贴板');
    } catch (err) {
      console.error(err);
      toast.error('复制失败，请尝试下载');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>生成分享海报</DialogTitle>
        </DialogHeader>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <Button onClick={handleDownload} disabled={isDownloading || isCopying} className="gap-2 flex-1">
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            下载图片
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={isDownloading || isCopying} className="gap-2 flex-1">
            {isCopying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            复制图片
          </Button>
        </div>

        {/* Poster preview */}
        <div className="overflow-y-auto flex-1 rounded-lg border bg-gray-50 p-2">
          <PosterContent ref={posterRef} job={job} stage={stage} t={t} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Poster DOM — this is what gets captured as PNG
import React from 'react';

const PosterContent = React.forwardRef<
  HTMLDivElement,
  { job: Job; stage: InterviewStage; t: (key: string) => string }
>(({ job, stage, t }, ref) => {
  const questions = stage.questions ?? [];
  const reflection = stage.reflection;

  return (
    <div
      ref={ref}
      style={{
        width: '390px',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        fontSize: '14px',
        color: '#111827',
        padding: '0',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
          padding: '24px 20px 20px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{job.companyName}</span>
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>·</span>
          <span style={{ fontSize: '14px', color: '#374151' }}>{job.roleTitle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <PosterBadge>{stage.name}</PosterBadge>
          {stage.scheduledTime && (
            <PosterBadge>{format(new Date(stage.scheduledTime), 'yyyy/MM/dd')}</PosterBadge>
          )}
          <PosterBadge accent>AI 面试复盘</PosterBadge>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Questions section */}
        {questions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <SectionTitle number="📝" title={`面试题目（${questions.length} 题）`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {questions.map((q, index) => {
                const quality = q.responseQuality ? QUALITY_LABELS[q.responseQuality] : null;
                const category = q.category ? QUESTION_CATEGORIES[q.category] : null;
                return (
                  <div
                    key={q.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '12px',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', minWidth: '28px' }}>
                        Q{index + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 8px', lineHeight: 1.5 }}>
                          {q.question}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {category && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              border: '1px solid #d1d5db',
                              color: '#374151',
                              backgroundColor: '#ffffff',
                            }}>
                              {t(`questionCategory.${q.category}`)}
                            </span>
                          )}
                          {quality && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              border: `1px solid ${quality.color}33`,
                              color: quality.color,
                              backgroundColor: `${quality.color}0d`,
                            }}>
                              {quality.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reflection section */}
        {reflection && (
          <div>
            <SectionTitle number="💡" title="面试复盘" />
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Performance summary */}
              {reflection.performanceSummary && (
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '12px',
                  backgroundColor: '#fafafa',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                    <NumberCircle n={1} />总体评价
                  </p>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{reflection.performanceSummary}</p>
                </div>
              )}

              {/* What went well */}
              {reflection.whatWentWell && reflection.whatWentWell.length > 0 && (
                <div style={{ borderLeft: '3px solid #86efac', paddingLeft: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <NumberCircle n={2} color="#16a34a" /> ✓ 表现良好
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {reflection.whatWentWell.map((item, i) => (
                      <li key={i} style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What could improve */}
              {reflection.whatCouldImprove && reflection.whatCouldImprove.length > 0 && (
                <div style={{ borderLeft: '3px solid #fca5a5', paddingLeft: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', marginBottom: '6px' }}>
                    <NumberCircle n={3} color="#dc2626" /> → 可改进之处
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {reflection.whatCouldImprove.map((item, i) => (
                      <li key={i} style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key takeaways */}
              {reflection.keyTakeaways && reflection.keyTakeaways.length > 0 && (
                <div style={{
                  backgroundColor: '#eff6ff',
                  borderRadius: '10px',
                  padding: '12px',
                }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>
                    <NumberCircle n={4} color="#2563eb" /> 核心收获
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {reflection.keyTakeaways.map((item, i) => (
                      <span key={i} style={{
                        fontSize: '12px',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interviewer vibe */}
              {reflection.interviewerVibe && (
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                    <NumberCircle n={5} /> 面试官风格
                  </p>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{reflection.interviewerVibe}</p>
                </div>
              )}

              {/* Company insights */}
              {reflection.companyInsights && (
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                    <NumberCircle n={6} /> 公司洞察
                  </p>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{reflection.companyInsights}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Watermark footer */}
      <div style={{
        borderTop: '1px solid #f3f4f6',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fafafa',
      }}>
        <img src={offermindLogo} alt="OfferMind" style={{ height: '20px', opacity: 0.5 }} />
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>由 OfferMind AI 生成 · 仅供参考</span>
      </div>
    </div>
  );
});
PosterContent.displayName = 'PosterContent';

// Small helper components for inline styles
function PosterBadge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      fontSize: '11px',
      padding: '3px 10px',
      borderRadius: '9999px',
      border: accent ? '1px solid #a5b4fc' : '1px solid #d1d5db',
      color: accent ? '#4338ca' : '#6b7280',
      backgroundColor: accent ? '#eef2ff' : '#ffffff',
    }}>
      {children}
    </span>
  );
}

function NumberCircle({ n, color = '#6b7280' }: { n: number; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '18px',
      height: '18px',
      borderRadius: '9999px',
      backgroundColor: `${color}1a`,
      color,
      fontSize: '11px',
      fontWeight: 700,
      marginRight: '4px',
    }}>
      {n}
    </span>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
      <span style={{ fontSize: '15px' }}>{number}</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{title}</span>
    </div>
  );
}
