import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Job, InterviewStage } from '@/types/job';
import { format } from 'date-fns';
import { Download, Copy, Loader2, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import offermindLogo from '@/assets/offermind-logo-clean.png';
import React from 'react';

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

// ─── Text-level redaction types ───

interface TextRedaction {
  id: string;
  blockId: string;
  start: number;
  end: number;
  text: string;
}

interface SelectionToolbarState {
  visible: boolean;
  x: number;
  y: number;
  blockId: string;
  start: number;
  end: number;
  selectedText: string;
}

// ─── Block-level redaction style (for whole-block click) ───

function getRedactStyle(isRedacted: boolean, isEditing: boolean): React.CSSProperties {
  if (isRedacted) {
    return {
      filter: 'blur(7px)',
      backgroundColor: '#d1d5db',
      borderRadius: '4px',
      userSelect: 'none',
      cursor: isEditing ? 'pointer' : 'default',
      transition: 'filter 0.2s, background-color 0.2s',
    };
  }
  if (isEditing) {
    return {
      cursor: 'text',
      transition: 'outline 0.15s',
    };
  }
  return {};
}

// ─── RedactableText: renders text with inline blur spans ───

interface RedactableTextProps {
  text: string;
  blockId: string;
  redactions: TextRedaction[];
  onRemoveRedaction: (id: string) => void;
  privacyMode: boolean;
  style?: React.CSSProperties;
}

function RedactableText({ text, blockId, redactions, onRemoveRedaction, privacyMode, style }: RedactableTextProps) {
  const blockRedactions = redactions
    .filter(r => r.blockId === blockId)
    .sort((a, b) => a.start - b.start);

  if (blockRedactions.length === 0) {
    return <span style={style}>{text}</span>;
  }

  // Merge overlapping ranges
  const merged: { start: number; end: number; ids: string[] }[] = [];
  for (const r of blockRedactions) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
      last.ids.push(r.id);
    } else {
      merged.push({ start: r.start, end: r.end, ids: [r.id] });
    }
  }

  const segments: { text: string; redacted: boolean; ids: string[] }[] = [];
  let cursor = 0;
  for (const seg of merged) {
    if (cursor < seg.start) {
      segments.push({ text: text.slice(cursor, seg.start), redacted: false, ids: [] });
    }
    segments.push({ text: text.slice(seg.start, seg.end), redacted: true, ids: seg.ids });
    cursor = seg.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), redacted: false, ids: [] });
  }

  return (
    <span style={style}>
      {segments.map((seg, i) =>
        seg.redacted ? (
          <span
            key={i}
            onClick={privacyMode ? (e) => { e.stopPropagation(); seg.ids.forEach(id => onRemoveRedaction(id)); } : undefined}
            title={privacyMode ? '点击撤销遮挡' : undefined}
            style={{
              filter: 'blur(6px)',
              backgroundColor: '#d1d5db',
              borderRadius: '3px',
              userSelect: 'none',
              cursor: privacyMode ? 'pointer' : 'default',
              display: 'inline',
              padding: '0 1px',
            }}
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  );
}

// ─── Main Modal ───

export function InterviewPosterModal({ open, onOpenChange, job, stage }: InterviewPosterModalProps) {
  const { t } = useTranslation();
  const posterRef = useRef<HTMLDivElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSlicing, setIsSlicing] = useState(false);

  // Privacy mode state
  const [privacyMode, setPrivacyMode] = useState(false);
  // Block-level redactions (whole card/section)
  const [redactedItems, setRedactedItems] = useState<Set<string>>(new Set());
  // Text-level redactions
  const [textRedactions, setTextRedactions] = useState<TextRedaction[]>([]);
  // Selection toolbar
  const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbarState>({
    visible: false, x: 0, y: 0, blockId: '', start: 0, end: 0, selectedText: '',
  });

  const toggleRedact = (id: string) => {
    if (!privacyMode) return;
    setRedactedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePrivacyModeChange = (val: boolean) => {
    setPrivacyMode(val);
    if (!val) {
      setRedactedItems(new Set());
      setTextRedactions([]);
      setSelectionToolbar(s => ({ ...s, visible: false }));
    }
  };

  const removeTextRedaction = useCallback((id: string) => {
    setTextRedactions(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!privacyMode) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setSelectionToolbar(s => ({ ...s, visible: false }));
      return;
    }

    const selectedText = sel.toString().trim();
    if (!selectedText) {
      setSelectionToolbar(s => ({ ...s, visible: false }));
      return;
    }

    const range = sel.getRangeAt(0);

    // Find which block the selection is in by traversing up to data-block-id
    const anchor = range.startContainer;
    let el: Node | null = anchor;
    let blockId = '';
    while (el && el !== previewWrapperRef.current) {
      if (el instanceof Element && el.getAttribute('data-block-id')) {
        blockId = el.getAttribute('data-block-id')!;
        break;
      }
      el = el.parentNode;
    }

    if (!blockId) {
      setSelectionToolbar(s => ({ ...s, visible: false }));
      return;
    }

    // Get the full text content of the block element to compute offsets
    const blockEl = previewWrapperRef.current?.querySelector(`[data-block-id="${blockId}"]`);
    if (!blockEl) {
      setSelectionToolbar(s => ({ ...s, visible: false }));
      return;
    }

    const blockText = blockEl.textContent ?? '';
    // Find the selected text's position within the block text
    const selText = sel.toString();

    // Walk the block's text nodes to find the offset of range.startContainer
    let charOffset = 0;
    let found = false;
    const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node === range.startContainer) {
        charOffset += range.startOffset;
        found = true;
        break;
      }
      charOffset += (node.textContent ?? '').length;
    }

    if (!found) {
      setSelectionToolbar(s => ({ ...s, visible: false }));
      return;
    }

    const start = charOffset;
    const end = start + selText.length;

    // Position toolbar above/below the selection
    const rect = range.getBoundingClientRect();
    const wrapperRect = previewWrapperRef.current!.getBoundingClientRect();
    const toolbarX = rect.left - wrapperRect.left + rect.width / 2;
    const toolbarY = rect.top - wrapperRect.top - 44; // above

    setSelectionToolbar({
      visible: true,
      x: toolbarX,
      y: toolbarY,
      blockId,
      start,
      end,
      selectedText: selText,
    });
  }, [privacyMode]);

  const applyTextRedaction = () => {
    const { blockId, start, end, selectedText } = selectionToolbar;
    setTextRedactions(prev => [
      ...prev,
      { id: `tr-${Date.now()}-${Math.random()}`, blockId, start, end, text: selectedText },
    ]);
    window.getSelection()?.removeAllRanges();
    setSelectionToolbar(s => ({ ...s, visible: false }));
  };

  const dismissToolbar = () => {
    window.getSelection()?.removeAllRanges();
    setSelectionToolbar(s => ({ ...s, visible: false }));
  };

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

  const handleDownloadSliced = async () => {
    setIsSlicing(true);
    try {
      const dataUrl = await generateImage();

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
      });

      const fullWidth = img.naturalWidth;
      const fullHeight = img.naturalHeight;

      const pageHeight = Math.floor(fullWidth * (1660 / 1242));
      const totalPages = Math.ceil(fullHeight / pageHeight);

      const downloadBlob = (blob: Blob, filename: string) =>
        new Promise<void>((resolve) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve();
          }, 100);
        });

      for (let i = 0; i < totalPages; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = fullWidth;
        canvas.height = pageHeight;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, fullWidth, pageHeight);

        const srcY = i * pageHeight;
        const srcH = Math.min(pageHeight, fullHeight - srcY);
        ctx.drawImage(img, 0, srcY, fullWidth, srcH, 0, 0, fullWidth, srcH);

        const badge = `${i + 1} / ${totalPages}`;
        const badgePad = 10;
        const badgeFontSize = Math.round(fullWidth * 0.035);
        ctx.font = `600 ${badgeFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        const badgeW = ctx.measureText(badge).width + badgePad * 2.5;
        const badgeH = badgeFontSize + badgePad * 1.5;
        const badgeX = fullWidth - badgeW - badgePad * 1.5;
        const badgeY = pageHeight - badgeH - badgePad * 1.5;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeFontSize / 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.fillText(badge, badgeX + badgePad * 1.25, badgeY + badgeH / 2);

        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
        );

        await downloadBlob(blob, `面试复盘-${job.companyName}-${i + 1}.png`);
        if (i < totalPages - 1) await new Promise((r) => setTimeout(r, 200));
      }

      toast.success(`已下载 ${totalPages} 张图片，可直接上传到小红书 🎉`);
    } catch (err) {
      console.error(err);
      toast.error('分割下载失败，请重试');
    } finally {
      setIsSlicing(false);
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

  const anyLoading = isDownloading || isSlicing || isCopying;
  const blockRedactCount = redactedItems.size;
  const textRedactCount = textRedactions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>生成分享海报</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            小红书版会将长图自动切割为 3:4 竖版，可直接多图上传 📕
          </p>
        </DialogHeader>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button onClick={handleDownload} disabled={anyLoading} className="gap-2 flex-1 min-w-[100px]">
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            下载长图
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadSliced}
            disabled={anyLoading}
            className="gap-2 flex-1 min-w-[140px] border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            {isSlicing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            下载小红书版
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={anyLoading} className="gap-2 flex-1 min-w-[100px]">
            {isCopying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            复制图片
          </Button>
        </div>

        {/* Privacy mode bar */}
        <div className={`shrink-0 flex items-center gap-3 rounded-lg px-3 py-2 border transition-colors ${privacyMode ? 'bg-indigo-50 border-indigo-200' : 'bg-muted/40 border-border'}`}>
          <Shield className={`w-4 h-4 shrink-0 ${privacyMode ? 'text-indigo-600' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium ${privacyMode ? 'text-indigo-700' : 'text-foreground'}`}>
              🛡️ 隐私模式
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {privacyMode
                ? (textRedactCount > 0 || blockRedactCount > 0)
                  ? [
                      textRedactCount > 0 && `已精准遮挡 ${textRedactCount} 处`,
                      blockRedactCount > 0 && `整块遮挡 ${blockRedactCount} 块`,
                    ].filter(Boolean).join(' · ')
                  : '划选文字可精准打马赛克；或点击整块遮挡整段内容'
                : '开启后可划选文字精准打马赛克，或点击整块遮挡'}
            </p>
          </div>
          <Switch
            checked={privacyMode}
            onCheckedChange={handlePrivacyModeChange}
            aria-label="隐私模式"
          />
        </div>

        {/* Poster preview wrapper — captures mouseup for selection */}
        <div
          ref={previewWrapperRef}
          className="overflow-y-auto flex-1 rounded-lg border bg-muted/30 p-2 relative"
          onMouseUp={handleMouseUp}
        >
          {/* Floating selection toolbar */}
          {privacyMode && selectionToolbar.visible && (
            <div
              style={{
                position: 'absolute',
                left: `${selectionToolbar.x}px`,
                top: `${selectionToolbar.y}px`,
                transform: 'translateX(-50%)',
                zIndex: 50,
                display: 'flex',
                gap: '4px',
                background: '#1e1b4b',
                borderRadius: '8px',
                padding: '5px 8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                alignItems: 'center',
                pointerEvents: 'all',
              }}
              onMouseDown={(e) => e.preventDefault()} // prevent selection clear
            >
              <button
                onClick={applyTextRedaction}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c7d2fe',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                🛡️ 打上马赛克
              </button>
              <div style={{ width: '1px', height: '14px', background: '#4338ca' }} />
              <button
                onClick={dismissToolbar}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                ✕
              </button>
            </div>
          )}

          <PosterContent
            ref={posterRef}
            job={job}
            stage={stage}
            t={t}
            privacyMode={privacyMode}
            redactedItems={redactedItems}
            onToggleRedact={toggleRedact}
            textRedactions={textRedactions}
            onRemoveTextRedaction={removeTextRedaction}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inline SVG helpers ───

function MessageSquareSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LightbulbSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function CheckCircleSvg({ color = '#16a34a' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleSvg({ color = '#dc2626' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckSvg({ color = '#16a34a' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowRightSvg({ color = '#dc2626' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Poster DOM — captured as PNG ───

interface PosterContentProps {
  job: Job;
  stage: InterviewStage;
  t: (key: string) => string;
  privacyMode: boolean;
  redactedItems: Set<string>;
  onToggleRedact: (id: string) => void;
  textRedactions: TextRedaction[];
  onRemoveTextRedaction: (id: string) => void;
}

const PosterContent = React.forwardRef<HTMLDivElement, PosterContentProps>(
  ({ job, stage, t, privacyMode, redactedItems, onToggleRedact, textRedactions, onRemoveTextRedaction }, ref) => {
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
              <SectionTitle icon={<MessageSquareSvg />} title={`面试题目（${questions.length} 题）`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {questions.map((q, index) => {
                  const quality = q.responseQuality ? QUALITY_LABELS[q.responseQuality] : null;
                  const rid = `question-${index}`;
                  const isRedacted = redactedItems.has(rid);
                  return (
                    <div
                      key={q.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '12px',
                        backgroundColor: '#fafafa',
                        position: 'relative',
                        ...(privacyMode && !isRedacted ? { outline: '1.5px dashed #a5b4fc', outlineOffset: '1px' } : {}),
                      }}
                    >
                      {/* Click whole card to block-redact */}
                      {privacyMode && !isRedacted && (
                        <div
                          onClick={() => onToggleRedact(rid)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '8px',
                            fontSize: '10px',
                            color: '#6366f1',
                            opacity: 0.7,
                            cursor: 'pointer',
                            zIndex: 1,
                            userSelect: 'none',
                          }}
                        >
                          整块遮挡
                        </div>
                      )}
                      {isRedacted && (
                        <div
                          onClick={() => onToggleRedact(rid)}
                          style={{
                            position: 'absolute', inset: 0, borderRadius: '10px',
                            backgroundColor: '#d1d5db', filter: 'blur(0px)',
                            cursor: 'pointer', zIndex: 2, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <div style={{ filter: 'blur(8px)', width: '100%', height: '100%', position: 'absolute', inset: 0, backgroundColor: '#d1d5db', borderRadius: '10px' }} />
                          <span style={{ position: 'relative', zIndex: 1, fontSize: '10px', color: '#6366f1' }}>点击撤销遮挡</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', minWidth: '28px' }}>
                          Q{index + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p
                            data-block-id={rid}
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#111827',
                              margin: '0 0 8px',
                              lineHeight: 1.5,
                            }}
                          >
                            <RedactableText
                              text={q.question}
                              blockId={rid}
                              redactions={textRedactions}
                              onRemoveRedaction={onRemoveTextRedaction}
                              privacyMode={privacyMode}
                            />
                          </p>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {q.category && (
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
              <SectionTitle icon={<LightbulbSvg />} title="面试复盘" />
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Performance summary */}
                {reflection.performanceSummary && (() => {
                  const rid = 'reflection-summary';
                  const isRedacted = redactedItems.has(rid);
                  return (
                    <div
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '12px',
                        backgroundColor: '#fafafa',
                        position: 'relative',
                        ...(privacyMode && !isRedacted ? { outline: '1.5px dashed #a5b4fc', outlineOffset: '1px' } : {}),
                        ...(isRedacted ? { filter: 'blur(7px)', backgroundColor: '#d1d5db' } : {}),
                      }}
                    >
                      {privacyMode && !isRedacted && <BlockRedactHint onClick={() => onToggleRedact(rid)} />}
                      {isRedacted && <UnredactHint onClick={() => onToggleRedact(rid)} />}
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                        <NumberCircle n={1} />总体评价
                      </p>
                      <p
                        data-block-id={rid}
                        style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: 0 }}
                      >
                        <RedactableText
                          text={reflection.performanceSummary}
                          blockId={rid}
                          redactions={textRedactions}
                          onRemoveRedaction={onRemoveTextRedaction}
                          privacyMode={privacyMode}
                        />
                      </p>
                    </div>
                  );
                })()}

                {/* What went well */}
                {reflection.whatWentWell && reflection.whatWentWell.length > 0 && (() => {
                  const rid = 'reflection-well';
                  const isRedacted = redactedItems.has(rid);
                  return (
                    <div
                      style={{
                        borderLeft: '3px solid #86efac',
                        paddingLeft: '12px',
                        position: 'relative',
                        ...(privacyMode && !isRedacted ? { outline: '1.5px dashed #a5b4fc', outlineOffset: '1px', borderRadius: '4px' } : {}),
                        ...(isRedacted ? { filter: 'blur(7px)', backgroundColor: '#d1d5db', borderRadius: '4px' } : {}),
                      }}
                    >
                      {privacyMode && !isRedacted && <BlockRedactHint onClick={() => onToggleRedact(rid)} />}
                      {isRedacted && <UnredactHint onClick={() => onToggleRedact(rid)} />}
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <NumberCircle n={2} color="#16a34a" />
                        <CheckCircleSvg color="#16a34a" />
                        <span style={{ marginLeft: '2px' }}>表现良好</span>
                      </p>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {reflection.whatWentWell.map((item, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <CheckSvg color="#16a34a" />
                            <span
                              data-block-id={`${rid}-${i}`}
                            >
                              <RedactableText
                                text={item}
                                blockId={`${rid}-${i}`}
                                redactions={textRedactions}
                                onRemoveRedaction={onRemoveTextRedaction}
                                privacyMode={privacyMode}
                              />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* What could improve */}
                {reflection.whatCouldImprove && reflection.whatCouldImprove.length > 0 && (() => {
                  const rid = 'reflection-improve';
                  const isRedacted = redactedItems.has(rid);
                  return (
                    <div
                      style={{
                        borderLeft: '3px solid #fca5a5',
                        paddingLeft: '12px',
                        position: 'relative',
                        ...(privacyMode && !isRedacted ? { outline: '1.5px dashed #a5b4fc', outlineOffset: '1px', borderRadius: '4px' } : {}),
                        ...(isRedacted ? { filter: 'blur(7px)', backgroundColor: '#d1d5db', borderRadius: '4px' } : {}),
                      }}
                    >
                      {privacyMode && !isRedacted && <BlockRedactHint onClick={() => onToggleRedact(rid)} />}
                      {isRedacted && <UnredactHint onClick={() => onToggleRedact(rid)} />}
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <NumberCircle n={3} color="#dc2626" />
                        <AlertCircleSvg color="#dc2626" />
                        <span style={{ marginLeft: '2px' }}>可改进之处</span>
                      </p>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {reflection.whatCouldImprove.map((item, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <ArrowRightSvg color="#dc2626" />
                            <span
                              data-block-id={`${rid}-${i}`}
                            >
                              <RedactableText
                                text={item}
                                blockId={`${rid}-${i}`}
                                redactions={textRedactions}
                                onRemoveRedaction={onRemoveTextRedaction}
                                privacyMode={privacyMode}
                              />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* Key takeaways */}
                {reflection.keyTakeaways && reflection.keyTakeaways.length > 0 && (() => {
                  const rid = 'reflection-takeaways';
                  const isRedacted = redactedItems.has(rid);
                  return (
                    <div
                      style={{
                        backgroundColor: '#eff6ff',
                        borderRadius: '10px',
                        padding: '12px',
                        position: 'relative',
                        ...(privacyMode && !isRedacted ? { outline: '1.5px dashed #a5b4fc', outlineOffset: '1px' } : {}),
                        ...(isRedacted ? { filter: 'blur(7px)', backgroundColor: '#d1d5db' } : {}),
                      }}
                    >
                      {privacyMode && !isRedacted && <BlockRedactHint onClick={() => onToggleRedact(rid)} />}
                      {isRedacted && <UnredactHint onClick={() => onToggleRedact(rid)} />}
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>
                        <NumberCircle n={4} color="#2563eb" /> 核心收获
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {reflection.keyTakeaways.map((item, i) => (
                          <span
                            key={i}
                            data-block-id={`${rid}-${i}`}
                            style={{
                              fontSize: '12px',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                            }}
                          >
                            <RedactableText
                              text={item}
                              blockId={`${rid}-${i}`}
                              redactions={textRedactions}
                              onRemoveRedaction={onRemoveTextRedaction}
                              privacyMode={privacyMode}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Interviewer vibe */}
                {reflection.interviewerVibe && (() => {
                  const rid = 'reflection-vibe';
                  const isRedacted = redactedItems.has(rid);
                  return (
                    <div
                      style={{
                        position: 'relative',
                        ...(privacyMode && !isRedacted ? { outline: '1.5px dashed #a5b4fc', outlineOffset: '1px', borderRadius: '4px' } : {}),
                        ...(isRedacted ? { filter: 'blur(7px)', backgroundColor: '#d1d5db', borderRadius: '4px' } : {}),
                      }}
                    >
                      {privacyMode && !isRedacted && <BlockRedactHint onClick={() => onToggleRedact(rid)} />}
                      {isRedacted && <UnredactHint onClick={() => onToggleRedact(rid)} />}
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        <NumberCircle n={5} /> 面试官风格
                      </p>
                      <p
                        data-block-id={rid}
                        style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: 0 }}
                      >
                        <RedactableText
                          text={reflection.interviewerVibe}
                          blockId={rid}
                          redactions={textRedactions}
                          onRemoveRedaction={onRemoveTextRedaction}
                          privacyMode={privacyMode}
                        />
                      </p>
                    </div>
                  );
                })()}

                {/* Company insights */}
                {reflection.companyInsights && (() => {
                  const rid = 'reflection-insights';
                  const isRedacted = redactedItems.has(rid);
                  return (
                    <div
                      style={{
                        position: 'relative',
                        ...(privacyMode && !isRedacted ? { outline: '1.5px dashed #a5b4fc', outlineOffset: '1px', borderRadius: '4px' } : {}),
                        ...(isRedacted ? { filter: 'blur(7px)', backgroundColor: '#d1d5db', borderRadius: '4px' } : {}),
                      }}
                    >
                      {privacyMode && !isRedacted && <BlockRedactHint onClick={() => onToggleRedact(rid)} />}
                      {isRedacted && <UnredactHint onClick={() => onToggleRedact(rid)} />}
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        <NumberCircle n={6} /> 公司洞察
                      </p>
                      <p
                        data-block-id={rid}
                        style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: 0 }}
                      >
                        <RedactableText
                          text={reflection.companyInsights}
                          blockId={rid}
                          redactions={textRedactions}
                          onRemoveRedaction={onRemoveTextRedaction}
                          privacyMode={privacyMode}
                        />
                      </p>
                    </div>
                  );
                })()}
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
  }
);
PosterContent.displayName = 'PosterContent';

// ─── Small helper components ───

function BlockRedactHint({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: 'absolute',
        top: '6px',
        right: '8px',
        fontSize: '10px',
        color: '#6366f1',
        opacity: 0.7,
        cursor: 'pointer',
        zIndex: 1,
        userSelect: 'none',
      }}
    >
      整块遮挡
    </div>
  );
}

function UnredactHint({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit',
      }}
    >
      <span style={{ fontSize: '10px', color: '#6366f1', background: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
        点击撤销遮挡
      </span>
    </div>
  );
}

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

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
      {icon}
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{title}</span>
    </div>
  );
}
