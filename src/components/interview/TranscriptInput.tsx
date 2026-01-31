import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, 
  Upload, 
  X, 
  Loader2, 
  Sparkles,
  File,
  FileType2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  content: string;
  status: 'parsing' | 'ready' | 'error';
  preview?: string;
}

interface TranscriptInputProps {
  onAnalyze: (transcript: string) => Promise<void>;
  isAnalyzing: boolean;
}

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.json'];
const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/json',
];

export function TranscriptInput({ onAnalyze, isAnalyzing }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFileSupported = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext) || SUPPORTED_MIME_TYPES.includes(file.type);
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseDocumentFile = async (file: File): Promise<string> => {
    // For PDF and DOCX, use parse-document edge function
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(',')[1];
          const { data, error } = await supabase.functions.invoke('parse-document', {
            body: {
              imageBase64: base64,
              mimeType: file.type,
              fileName: file.name,
            },
          });

          if (error) throw error;
          if (data.error) throw new Error(data.error);

          resolve(data.text || '');
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ext = file.name.split('.').pop()?.toLowerCase();

    // Create initial file entry
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      type: ext || 'unknown',
      content: '',
      status: 'parsing',
    };

    try {
      let content: string;

      if (['txt', 'md', 'json'].includes(ext || '')) {
        // Read text-based files directly
        content = await readTextFile(file);
      } else if (['pdf', 'docx'].includes(ext || '')) {
        // Parse PDF/DOCX using edge function
        content = await parseDocumentFile(file);
      } else {
        throw new Error('Unsupported file type');
      }

      return {
        ...uploadedFile,
        content,
        status: 'ready',
        preview: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        ...uploadedFile,
        status: 'error',
        content: '',
      };
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (!isFileSupported(file)) {
        toast.error(`暂不支持该文件格式: ${file.name}`);
        continue;
      }

      // Add file with parsing status
      const tempFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        content: '',
        status: 'parsing',
      };
      setUploadedFiles(prev => [...prev, tempFile]);

      // Process file
      const processedFile = await processFile(file);
      setUploadedFiles(prev => 
        prev.map(f => f.id === tempFile.id ? { ...processedFile, id: tempFile.id } : f)
      );

      if (processedFile.status === 'ready') {
        toast.success(`已解析: ${file.name}`);
      } else {
        toast.error(`解析失败: ${file.name}`);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getCombinedContent = (): string => {
    const fileContents = uploadedFiles
      .filter(f => f.status === 'ready' && f.content)
      .map(f => `[${f.name}]\n${f.content}`)
      .join('\n\n---\n\n');

    if (transcript && fileContents) {
      return `${transcript}\n\n---\n\n${fileContents}`;
    }
    return transcript || fileContents;
  };

  const canAnalyze = transcript.length >= 50 || uploadedFiles.some(f => f.status === 'ready');
  const isParsing = uploadedFiles.some(f => f.status === 'parsing');
  const totalChars = getCombinedContent().length;

  const handleSubmit = () => {
    const content = getCombinedContent();
    if (content.length < 50) {
      toast.error('内容太少，请添加更多面试记录（至少50个字符）');
      return;
    }
    onAnalyze(content);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileType2 className="w-4 h-4 text-red-500" />;
      case 'docx':
        return <FileType2 className="w-4 h-4 text-blue-500" />;
      case 'md':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'json':
        return <File className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        isDragOver && 'ring-2 ring-primary ring-offset-2 bg-primary/5'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <CardContent className="p-6 space-y-4">
        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <Badge
                key={file.id}
                variant={file.status === 'error' ? 'destructive' : 'secondary'}
                className={cn(
                  'gap-2 py-1.5 px-3 text-sm',
                  file.status === 'parsing' && 'animate-pulse'
                )}
              >
                {file.status === 'parsing' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : file.status === 'error' ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  getFileIcon(file.type)
                )}
                <span className="max-w-[150px] truncate">{file.name}</span>
                {file.status !== 'parsing' && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Text Input Area with Drop Zone */}
        <div className="relative">
          <Textarea
            placeholder={`粘贴你的面试记录...

支持格式：
- 纯文本笔记
- 聊天记录
- 混合中英文
- 无需格式化

示例：
面试官问了我为什么想加入这家公司，我说了对产品的理解...
然后问了一个系统设计题，设计一个电商系统...`}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className={cn(
              'min-h-[280px] font-mono text-sm resize-y transition-colors',
              isDragOver && 'border-primary bg-primary/5'
            )}
          />
          
          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-md pointer-events-none">
              <div className="text-center space-y-2">
                <Upload className="w-10 h-10 mx-auto text-primary" />
                <p className="text-sm font-medium text-primary">松开以上传文件</p>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Button */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.pdf,.docx,.json"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            上传文件
          </Button>
          <span className="text-xs text-muted-foreground">
            支持拖拽或上传文件（.txt / .md / .pdf / .docx / .json），AI 将自动解析内容
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{totalChars} 字符</span>
            {uploadedFiles.filter(f => f.status === 'ready').length > 0 && (
              <span className="text-primary">
                + {uploadedFiles.filter(f => f.status === 'ready').length} 个文件已解析
              </span>
            )}
          </div>
          <span>建议 500+ 字符以获得更好的分析效果</span>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSubmit}
          disabled={isAnalyzing || isParsing || !canAnalyze}
          className="w-full gap-2"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              正在分析...
            </>
          ) : isParsing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              正在解析文件...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              开始 AI 分析
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
