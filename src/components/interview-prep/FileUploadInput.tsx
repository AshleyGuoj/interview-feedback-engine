import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Image, X, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadInputProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

interface UploadedFile {
  name: string;
  type: string;
  base64: string;
}

const SUPPORTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];

export function FileUploadInput({
  title,
  description,
  icon,
  value,
  onChange,
  placeholder,
  required = false,
}: FileUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!SUPPORTED_TYPES.includes(file.type)) {
        toast({
          title: "不支持的文件类型",
          description: `${file.name}: 请上传 PNG, JPG, WEBP 图片或 PDF 文件`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: `${file.name}: 文件大小不能超过 10MB`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newFiles.push({
          name: file.name,
          type: file.type,
          base64,
        });
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast({
        title: "文件已添加",
        description: `已添加 ${newFiles.length} 个文件，点击"解析全部"提取文本`,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    onChange("");
  };

  const parseAllFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setIsParsing(true);

    try {
      const pages = uploadedFiles.map((file, index) => ({
        imageBase64: file.base64,
        mimeType: file.type,
        fileName: file.name,
        pageNumber: index + 1,
      }));

      const { data, error } = await supabase.functions.invoke("parse-document", {
        body: { pages },
      });

      if (error) {
        throw error;
      }

      if (data?.text) {
        onChange(data.text);
        toast({
          title: "解析成功",
          description: `已从 ${data.pageCount || uploadedFiles.length} 个页面提取文本`,
        });
      } else {
        throw new Error("未能提取文本内容");
      }
    } catch (error) {
      console.error("Parse error:", error);
      toast({
        title: "解析失败",
        description: error instanceof Error ? error.message : "请重试或手动输入",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          {!required && (
            <span className="text-xs font-normal text-muted-foreground">(可选)</span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Upload buttons */}
        <div className="flex gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isParsing}
            multiple
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            上传文件
          </Button>
          {uploadedFiles.length > 0 && (
            <>
              <Button
                type="button"
                onClick={parseAllFiles}
                disabled={isParsing}
                className="gap-2"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    解析中 ({uploadedFiles.length} 页)...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    解析全部 ({uploadedFiles.length})
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={clearAllFiles}
                disabled={isParsing}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                清空
              </Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          支持 PNG, JPG, PDF (≤10MB)，可上传多个文件/多页文档
        </p>

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
              >
                {file.type.startsWith("image/") ? (
                  <Image className="h-3 w-3 text-primary" />
                ) : (
                  <FileText className="h-3 w-3 text-primary" />
                )}
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="hover:text-destructive"
                  disabled={isParsing}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <Textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className={cn(
            "min-h-[160px] resize-y",
            isParsing && "opacity-50"
          )}
          required={required}
          disabled={isParsing}
        />
      </CardContent>
    </Card>
  );
}
