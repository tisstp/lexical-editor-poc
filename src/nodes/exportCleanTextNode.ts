import type { DOMExportOutput, LexicalEditor, LexicalNode, TextNode } from 'lexical';

const LEGACY_WRAPPER_TAGS = new Set(['B', 'I', 'S', 'U']);

/**
 * TextNode.exportDOM always double-wraps formatted text for legacy client
 * compatibility, e.g. <b><strong class="editor-bold">text</strong></b>, and
 * inlines style="white-space: pre-wrap" on every node. Both are redundant
 * once this app owns the render CSS (the inner element's class already
 * carries the format, and white-space inherits from a container rule).
 * Registered via initialConfig.html.export so it runs in place of the
 * default TextNode export, without the class-identity pitfalls of full
 * node replacement (see https://lexical.dev/docs/concepts/node-replacement).
 */
export function exportCleanTextNode(editor: LexicalEditor, node: LexicalNode): DOMExportOutput {
  const { element } = (node as TextNode).exportDOM(editor);
  if (!(element instanceof HTMLElement)) return { element };

  let inner = element;
  while (LEGACY_WRAPPER_TAGS.has(inner.tagName) && inner.children.length === 1) {
    inner = inner.children[0] as HTMLElement;
  }
  inner.style.removeProperty('white-space');

  return { element: inner };
}
