import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { $generateHtmlFromNodes } from '@lexical/html';
import { MENTION_TRANSFORMER, TABLE_TRANSFORMER } from '../transformers/customTransformers';

type Tab = 'json' | 'html' | 'markdown';

const ALL_TRANSFORMERS = [...TRANSFORMERS, TABLE_TRANSFORMER, MENTION_TRANSFORMER];

export default function OutputPanel() {
  const [editor] = useLexicalComposerContext();
  const [tab, setTab] = useState<Tab>('markdown');
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

  const content = tab === 'json' ? json : tab === 'html' ? html : markdown;

  return (
    <div className="output-panel">
      <div className="tabs">
        <button className={tab === 'markdown' ? 'active' : ''} onClick={() => setTab('markdown')}>Markdown</button>
        <button className={tab === 'html' ? 'active' : ''} onClick={() => setTab('html')}>HTML</button>
        <button className={tab === 'json' ? 'active' : ''} onClick={() => setTab('json')}>JSON</button>
      </div>
      <pre className="output-content">{content}</pre>
    </div>
  );
}
