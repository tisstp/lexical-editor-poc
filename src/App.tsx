import { TextNode } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { MentionNode } from './nodes/MentionNode';
import { exportCleanTextNode } from './nodes/exportCleanTextNode';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import OutputPanel from './plugins/OutputPanel';
import './App.css';

const theme = {
  heading: { h1: 'editor-h1', h2: 'editor-h2' },
  quote: 'editor-quote',
  list: { ul: 'editor-ul', ol: 'editor-ol', listitem: 'editor-li' },
  link: 'editor-link',
  code: 'editor-code',
  text: { bold: 'editor-bold', italic: 'editor-italic', underline: 'editor-underline' },
  table: 'editor-table',
  tableCell: 'editor-table-cell',
  tableRow: 'editor-table-row',
};

function onError(error: unknown) {
  console.error(error);
}

const initialConfig = {
  namespace: 'lexical-poc',
  theme,
  onError,
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    CodeNode,
    TableNode,
    TableRowNode,
    TableCellNode,
    MentionNode,
  ],
  html: {
    export: new Map([[TextNode, exportCleanTextNode]]),
  },
};

function App() {
  return (
    <div className="app">
      <h1>Lexical Editor POC</h1>
      <p className="subtitle">Rich text in, Markdown / HTML / JSON out.</p>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-shell">
          <ToolbarPlugin />
          <div className="editor-container">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<div className="editor-placeholder">Start typing… try @Alice, **bold**, a table, or colored text.</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <TablePlugin />
            <MentionsPlugin />
          </div>
        </div>
        <OutputPanel />
      </LexicalComposer>
    </div>
  );
}

export default App;
