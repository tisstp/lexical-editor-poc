import type { TextMatchTransformer, ElementTransformer } from '@lexical/markdown';
import {
  $createMentionNode,
  $isMentionNode,
  MentionNode,
} from '../nodes/MentionNode';
import {
  $isTableNode,
  $isTableRowNode,
  $isTableCellNode,
  TableNode,
} from '@lexical/table';

// Markdown: @[Name](userId)
export const MENTION_TRANSFORMER: TextMatchTransformer = {
  dependencies: [MentionNode],
  export: (node) => {
    if (!$isMentionNode(node)) {
      return null;
    }
    return `@[${node.__mention}](${node.__mentionId})`;
  },
  importRegExp: /@\[([^[]+)\]\(([^)]+)\)/,
  regExp: /@\[([^[]+)\]\(([^)]+)\)$/,
  replace: (textNode, match) => {
    const [, name, id] = match;
    const mentionNode = $createMentionNode(name, id);
    textNode.replace(mentionNode);
  },
  trigger: ')',
  type: 'text-match',
};

// Minimal GFM table transformer (pipe tables)
export const TABLE_TRANSFORMER: ElementTransformer = {
  dependencies: [TableNode],
  export: (node) => {
    if (!$isTableNode(node)) {
      return null;
    }
    const rows: string[][] = [];
    for (const row of node.getChildren()) {
      if (!$isTableRowNode(row)) continue;
      const cells: string[] = [];
      for (const cell of row.getChildren()) {
        if (!$isTableCellNode(cell)) continue;
        cells.push(cell.getTextContent().trim().replace(/\|/g, '\\|'));
      }
      rows.push(cells);
    }
    if (rows.length === 0) return '';

    const header = rows[0];
    const separator = header.map(() => '---');
    const lines = [
      `| ${header.join(' | ')} |`,
      `| ${separator.join(' | ')} |`,
      ...rows.slice(1).map((r) => `| ${r.join(' | ')} |`),
    ];
    return lines.join('\n');
  },
  regExp: /^\|(.+)\|\s*$/,
  replace: () => {
    // Export-only POC: markdown -> table import not implemented.
  },
  type: 'element',
};
