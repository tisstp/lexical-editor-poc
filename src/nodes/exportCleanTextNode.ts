import type { DOMExportOutput, LexicalEditor, LexicalNode, TextNode } from 'lexical';

const LEGACY_WRAPPER_TAGS = new Set(['B', 'I', 'S', 'U']);

function wrapElement(el: HTMLElement, tag: string): HTMLElement {
  const wrapper = el.ownerDocument.createElement(tag);
  wrapper.appendChild(el);
  return wrapper;
}

/**
 * TextNode.exportDOM builds a base <strong>/<em>/<span> element (tag picked
 * by format priority, classed via theme) and then wraps it again in legacy
 * <b>/<i>/<s>/<u> tags for client compatibility — so bold alone comes out as
 * <b><strong class="editor-bold">text</strong></b>, a duplicate representation
 * of the same format. This rebuilds the wrapper chain to emit exactly one
 * legacy tag per active format, nested consistently (b > i > u > s), e.g.
 * bold+italic+underline -> <b><i><u>text</u></i></b>. Registered via
 * initialConfig.html.export in place of the default TextNode export.
 */
export function exportCleanTextNode(editor: LexicalEditor, node: LexicalNode): DOMExportOutput {
  const textNode = node as TextNode;
  const { element } = textNode.exportDOM(editor);
  if (!(element instanceof HTMLElement)) return { element };

  let core = element;
  while (LEGACY_WRAPPER_TAGS.has(core.tagName) && core.children.length === 1) {
    core = core.children[0] as HTMLElement;
  }
  core.style.removeProperty('white-space');

  if (core.tagName === 'STRONG' || core.tagName === 'EM') {
    const span = core.ownerDocument.createElement('span');
    span.className = core.className;
    const style = core.getAttribute('style');
    if (style) span.setAttribute('style', style);
    span.append(...Array.from(core.childNodes));
    core = span;
  }

  let wrapped: HTMLElement = core;
  if (textNode.hasFormat('underline')) wrapped = wrapElement(wrapped, 'u');
  if (textNode.hasFormat('italic')) wrapped = wrapElement(wrapped, 'i');
  if (textNode.hasFormat('bold')) wrapped = wrapElement(wrapped, 'b');
  if (textNode.hasFormat('strikethrough')) wrapped = wrapElement(wrapped, 's');

  return { element: wrapped };
}
