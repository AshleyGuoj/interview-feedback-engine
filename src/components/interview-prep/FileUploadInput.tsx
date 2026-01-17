import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Image, X, Loader2 } from "lucide-react";
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
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!SUPPORTED_TYPES.includes(file.type)) {
      toast({
        title: "不支持的文件类型",
        description: "请上传 PNG, JPG, WEBP 图片或 PDF 文件",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "文件大小不能超过 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Call edge function to parse the document
      const { data, error } = await supabase.functions.invoke("parse-document", {
        body: {
          imageBase64: base64,
          mimeType: file.type,
          fileName: file.name,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.text) {
        onChange(data.text);
        setUploadedFile({ name: file.name, type: file.type });
        toast({
          title: "解析成功",
          description: `已从 ${file.name} 提取文本`,
        });
      } else {
        throw new Error("未能提取文本内容");
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "解析失败",
        description: error instanceof Error ? error.message : "请重试或手动输入",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    onChange("");
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
        {/* Upload button */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                解析中...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                上传文件
              </>
            )}
          </Button>
          <span className="text-xs text-muted-foreground self-center">
            支持 PNG, JPG, PDF (≤10MB)
          </span>
        </div>

        {/* Uploaded file indicator */}
        {uploadedFile && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            {uploadedFile.type.startsWith("image/") ? (
              <Image className="h-4 w-4 text-primary" />
            ) : (
              <FileText className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearUploadedFile}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Textarea */}
        <Textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (uploadedFile) setUploadedFile(null);
          }}
          placeholder={placeholder}
          className={cn(
            "min-h-[160px] resize-y",
            isUploading && "opacity-50"
          )}
          required={required}
          disabled={isUploading}
        />
      </CardContent>
    </Card>
  );
}
