import { useEffect, useRef } from "react";
import type { Crepe as CrepeInstance } from "@milkdown/crepe";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

export const SKACK_IMAGE_PREFIX = "skack-image:";

type MarkdownImageUpload = {
  url: string;
  previewUrl: string;
};

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<MarkdownImageUpload>;
  resolveImageUrl?: (url: string) => string | Promise<string>;
};

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "내용을 적어주세요.",
  onImageUpload,
  resolveImageUrl,
}: MarkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onImageUploadRef = useRef(onImageUpload);
  const resolveImageUrlRef = useRef(resolveImageUrl);
  const initialValueRef = useRef(value);
  const imagePreviewMapRef = useRef(new Map<string, string>());
  onChangeRef.current = onChange;
  onImageUploadRef.current = onImageUpload;
  resolveImageUrlRef.current = resolveImageUrl;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let editor: CrepeInstance | null = null;

    const initialize = async () => {
      const { Crepe } = await import("@milkdown/crepe");
      if (disposed) return;

      editor = new Crepe({
        root,
        defaultValue: initialValueRef.current,
        features: {
          [Crepe.Feature.ImageBlock]: true,
          [Crepe.Feature.Toolbar]: false,
          [Crepe.Feature.TopBar]: true,
        },
        featureConfigs: {
          [Crepe.Feature.ImageBlock]: {
            onUpload: async file => {
              const upload = onImageUploadRef.current;
              if (!upload) return "";
              const result = await upload(file);
              imagePreviewMapRef.current.set(result.url, result.previewUrl);
              return result.url;
            },
            proxyDomURL: url =>
              imagePreviewMapRef.current.get(url) ??
              resolveImageUrlRef.current?.(url) ??
              url,
          },
          [Crepe.Feature.Placeholder]: {
            text: placeholder,
            mode: "block",
          },
        },
      });

      editor.on(listener => {
        listener.markdownUpdated((_ctx, markdown) => {
          onChangeRef.current(markdown);
        });
      });

      await editor.create();
    };

    void initialize();

    return () => {
      disposed = true;
      if (editor) void editor.destroy();
    };
  }, [placeholder]);

  return (
    <div
      ref={rootRef}
      className="skack-markdown-editor"
      aria-label="마크다운 본문 편집기"
    />
  );
}

export function MarkdownContent({
  markdown,
  images = [],
}: {
  markdown: string;
  images?: { id: string; src: string }[];
}) {
  return (
    <div className="skack-markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={url =>
          url.startsWith(SKACK_IMAGE_PREFIX) ? url : defaultUrlTransform(url)
        }
        components={{
          img: ({ src, alt, ...props }) => {
            const isStoredImage = src?.startsWith(SKACK_IMAGE_PREFIX);
            const image =
              isStoredImage
                ? images.find(
                    item =>
                      item.id ===
                      src?.slice(SKACK_IMAGE_PREFIX.length)
                  )
                : undefined;
            const resolvedSrc = isStoredImage ? image?.src : src;
            if (!resolvedSrc) return null;
            return <img {...props} src={resolvedSrc} alt={alt || "본문 이미지"} />;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
