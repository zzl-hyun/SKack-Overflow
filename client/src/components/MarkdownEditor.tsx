import { useEffect, useRef, type ClipboardEvent as ReactClipboardEvent } from "react";
import type { Crepe as CrepeInstance } from "@milkdown/crepe";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onPaste?: (event: ReactClipboardEvent<HTMLDivElement>) => void;
};

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "내용을 적어주세요.",
  onPaste,
}: MarkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  onChangeRef.current = onChange;

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
          [Crepe.Feature.ImageBlock]: false,
          [Crepe.Feature.Toolbar]: false,
          [Crepe.Feature.TopBar]: true,
        },
        featureConfigs: {
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
      onPasteCapture={onPaste}
      aria-label="마크다운 본문 편집기"
    />
  );
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="skack-markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
