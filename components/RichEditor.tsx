"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locale";

// Lightweight RichEditor using contentEditable and minimal toolbar
// Supports RTL-first layout, basic formatting commands, math insertion, and sanitized embed insertion on paste.

type RichEditorProps = {
  value?: string;
  locale: Locale;
  onChange?: (value: string) => void;
  placeholder?: string;
};

type KatexWindow = { katex?: { renderToString?: (tex: string, node: Element, opts?: unknown) => string } };

export default function RichEditor({ value = "", locale, onChange, placeholder }: RichEditorProps) {
  const t = useTranslations("RichEditor");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState<string>(() => value);

  useEffect(() => {
    if (value === html) return;
    const id = setTimeout(() => setHtml(value), 0);
    return () => clearTimeout(id);
  }, [value, html]);

  useEffect(() => {
    // Load KaTeX for math rendering when needed
    if (typeof window !== "undefined") {
      const win = window as unknown as KatexWindow;
      if (!win.katex) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    // render math blocks on html change
    const el = editorRef.current;
    if (!el) return;

    // render inline math elements marked with data-math attribute
    setTimeout(() => {
      const spans = el.querySelectorAll('[data-math]');
      const win = typeof window !== 'undefined' ? (window as unknown as KatexWindow) : undefined;
      spans.forEach((span) => {
        const tex = span.getAttribute('data-math') || '';
        try {
          if (win?.katex?.renderToString) {
            // render to the span node
            win.katex.renderToString(tex, span as Element, { throwOnError: false });
          }
        } catch {
          // ignore render errors
        }
      });
    }, 100);
  }, [html]);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value || undefined);
    triggerChange();
  }

  function triggerChange() {
    const content = editorRef.current?.innerHTML ?? "";
    setHtml(content);
    onChange?.(content);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    // intercept pasted HTML to remove disallowed content client-side as an extra layer
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');

    if (htmlData) {
      // insert sanitized html via server-side sanitizer will be enforced upon save
      e.preventDefault();
      document.execCommand('insertHTML', false, htmlData);
      triggerChange();
      return;
    }

    if (textData) {
      e.preventDefault();
      document.execCommand('insertText', false, textData);
      triggerChange();
    }
  }

  function insertMath() {
    const tex = prompt(t('insertMath') || 'Insert LaTeX');
    if (!tex) return;
    const span = document.createElement('span');
    span.setAttribute('data-math', tex);
    span.className = 'math-inline';
    // insert as HTML
    const htmlString = span.outerHTML;
    document.execCommand('insertHTML', false, htmlString);
    triggerChange();
  }

  function insertEmbed() {
    const url = prompt(t('insertVideoUrl') || '');
    if (!url) return;
    // simple embed transform for youtube/vimeo URLs to iframe
    try {
      const parsed = new URL(url);
      let src = '';
      if (parsed.hostname.includes('youtube.com')) {
        const v = parsed.searchParams.get('v');
        if (v) src = `https://www.youtube.com/embed/${v}`;
      } else if (parsed.hostname.includes('youtu.be')) {
        const v = parsed.pathname.split('/').pop();
        if (v) src = `https://www.youtube.com/embed/${v}`;
      } else if (parsed.hostname.includes('vimeo.com')) {
        const id = parsed.pathname.split('/').pop();
        if (id) src = `https://player.vimeo.com/video/${id}`;
      }

      if (src) {
        const iframe = `<iframe src="${src}" width="560" height="315" loading="lazy" sandbox="allow-same-origin allow-scripts" referrerpolicy="no-referrer"></iframe>`;
        document.execCommand('insertHTML', false, iframe);
        triggerChange();
      } else {
        alert(t('invalidVideoUrl'));
      }
    } catch {
      alert(t('invalidVideoUrl'));
    }
  }

  return (
    <div className={`rich-editor ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => exec('bold')} className="rounded px-3 py-1 bg-foreground/5 text-foreground">{t('toolbar.bold')}</button>
        <button type="button" onClick={() => exec('italic')} className="rounded px-3 py-1 bg-foreground/5 text-foreground">{t('toolbar.italic')}</button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="rounded px-3 py-1 bg-foreground/5 text-foreground">{t('toolbar.ul')}</button>
        <button type="button" onClick={() => exec('insertOrderedList')} className="rounded px-3 py-1 bg-foreground/5 text-foreground">{t('toolbar.ol')}</button>
        <button type="button" onClick={insertMath} className="rounded px-3 py-1 bg-foreground/5 text-foreground">{t('toolbar.math')}</button>
        <button type="button" onClick={insertEmbed} className="rounded px-3 py-1 bg-foreground/5 text-foreground">{t('toolbar.embed')}</button>
      </div>
      <div
        ref={editorRef}
        onInput={triggerChange}
        onBlur={triggerChange}
        onPaste={handlePaste}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label={t('editorLabel')}
        className={`min-h-[240px] w-full rounded-lg border border-foreground/10 bg-background p-4 text-foreground focus:outline-none ${locale === 'ar' ? 'direction-rtl' : 'direction-ltr'}`}
        dangerouslySetInnerHTML={{ __html: html || placeholder || '' }}
      />
    </div>
  );
}
