import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { $generateHtmlFromNodes } from '@lexical/html';
import { MENTION_TRANSFORMER, TABLE_TRANSFORMER } from '../transformers/customTransformers';

type Tab = 'json' | 'html' | 'markdown';
type HtmlView = 'source' | 'preview';

const ALL_TRANSFORMERS = [...TRANSFORMERS, TABLE_TRANSFORMER, MENTION_TRANSFORMER];

const LEGACY_FORMAT_TAGS = /<\/?(b|i|s|u)>/g;
const INLINE_WHITESPACE_STYLE = /\s*style="white-space:\s*pre-wrap;?"/g;

function stripLegacyFormatTags(html: string): string {
  // Lexical's core exportDOM always double-wraps formatted text, e.g.
  // <b><strong class="editor-bold">text</strong></b>. The inner element
  // already carries the format via its class, so the outer legacy tag
  // is redundant — drop it before storing/displaying.
  return html.replace(LEGACY_FORMAT_TAGS, '');
}

function stripInlineWhitespaceStyle(html: string): string {
  // Lexical inlines style="white-space: pre-wrap" on every text node so
  // spacing survives outside the editor. white-space inherits, so setting
  // it once on the rendering container has the same effect — drop the
  // per-node copies before storing to save space.
  return html.replace(INLINE_WHITESPACE_STYLE, '');
}

function prettyPrintHtml(html: string): string {
  const withBreaks = html.replace(/></g, '>\n<');
  const lines = withBreaks.split('\n');
  let indent = 0;
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (/^<\/\w/.test(trimmed)) indent = Math.max(indent - 1, 0);
      const result = '  '.repeat(indent) + trimmed;
      const isSelfClosing = /\/>$/.test(trimmed) || /^<(br|hr|img|input|meta|link)\b/i.test(trimmed);
      const isFullTag = /^<(\w+)[^>]*>.*<\/\1>$/.test(trimmed);
      if (/^<\w/.test(trimmed) && !trimmed.startsWith('</') && !isSelfClosing && !isFullTag) indent += 1;
      return result;
    })
    .join('\n');
}

export default function OutputPanel() {
  const [editor] = useLexicalComposerContext();
  const [tab, setTab] = useState<Tab>('markdown');
  const [htmlView, setHtmlView] = useState<HtmlView>('preview');
  const [json, setJson] = useState('');
  const [html, setHtml] = useState('');
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    const update = () => {
      editor.getEditorState().read(() => {
        setJson(JSON.stringify(editor.getEditorState().toJSON(), null, 2));
        setHtml(stripInlineWhitespaceStyle(stripLegacyFormatTags($generateHtmlFromNodes(editor, null))));
        setMarkdown($convertToMarkdownString(ALL_TRANSFORMERS));
      });
    };
    update();
    return editor.registerUpdateListener(update);
  }, [editor]);

  const content = tab === 'json' ? json : tab === 'html' ? prettyPrintHtml(html) : markdown;

  return (
    <div className="output-panel">
      <div className="tabs">
        <button className={tab === 'markdown' ? 'active' : ''} onClick={() => setTab('markdown')}>Markdown</button>
        <button className={tab === 'html' ? 'active' : ''} onClick={() => setTab('html')}>HTML</button>
        <button className={tab === 'json' ? 'active' : ''} onClick={() => setTab('json')}>JSON</button>
        {tab === 'html' && (
          <div className="html-subtabs">
            <button className={htmlView === 'preview' ? 'active' : ''} onClick={() => setHtmlView('preview')}>Preview</button>
            <button className={htmlView === 'source' ? 'active' : ''} onClick={() => setHtmlView('source')}>Source</button>
          </div>
        )}
      </div>
      {tab === 'html' && htmlView === 'preview' ? (
        <div className="output-content html-preview" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="output-content">{content}</pre>
      )}
    </div>
  );
}
