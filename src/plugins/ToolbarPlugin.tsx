import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  $getRoot,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $patchStyleText } from '@lexical/selection';

const COLORS = ['#e03131', '#2f9e44', '#1971c2', '#f08c00', 'inherit'];

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
        }
      });
    });
  }, [editor]);

  const formatHeading = useCallback(
    (tag: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      });
    },
    [editor],
  );

  const formatParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }, [editor]);

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }, [editor]);

  const formatCode = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode());
      }
    });
  }, [editor]);

  const insertLink = useCallback(() => {
    const url = window.prompt('Link URL:', 'https://');
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
  }, [editor]);

  const applyColor = useCallback(
    (color: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { color: color === 'inherit' ? null : color });
        }
      });
    },
    [editor],
  );

  const clearAll = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
  }, [editor]);

  return (
    <div className="toolbar">
      <button className={isBold ? 'active' : ''} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>B</button>
      <button className={isItalic ? 'active' : ''} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>I</button>
      <span className="sep" />
      <button onClick={formatParagraph}>P</button>
      <button onClick={() => formatHeading('h1')}>H1</button>
      <button onClick={() => formatHeading('h2')}>H2</button>
      <button onClick={formatQuote}>Quote</button>
      <button onClick={formatCode}>Code</button>
      <span className="sep" />
      <button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>UL</button>
      <button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>OL</button>
      <span className="sep" />
      <button onClick={insertLink}>Link</button>
      <button onClick={insertTable}>Table</button>
      <span className="sep" />
      {COLORS.map((c) => (
        <button
          key={c}
          className={c === 'inherit' ? 'color-swatch inherit-swatch' : 'color-swatch'}
          style={c === 'inherit' ? undefined : { background: c }}
          onClick={() => applyColor(c)}
          title={c === 'inherit' ? 'Reset color' : c}
        />
      ))}
      <span className="sep" />
      <button onClick={clearAll}>Clear</button>
      <span className="hint">Type @ to mention</span>
    </div>
  );
}
