import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { $generateHtmlFromNodes } from '@lexical/html';
import { MENTION_TRANSFORMER, TABLE_TRANSFORMER } from '../transformers/customTransformers';

type Tab = 'json' | 'html' | 'markdown';
type HtmlView = 'source' | 'preview';

const ALL_TRANSFORMERS = [...TRANSFORMERS, TABLE_TRANSFORMER, MENTION_TRANSFORMER];

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
        setHtml($generateHtmlFromNodes(editor, null));
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
