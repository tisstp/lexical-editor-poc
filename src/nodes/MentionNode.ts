import {
  TextNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
} from 'lexical';

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    mentionId: string;
  },
  SerializedTextNode
>;

export class MentionNode extends TextNode {
  __mention: string;
  __mentionId: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__mentionId, node.__text, node.__key);
  }

  constructor(mentionName: string, mentionId: string, text?: string, key?: NodeKey) {
    super(text ?? `@${mentionName}`, key);
    this.__mention = mentionName;
    this.__mentionId = mentionId;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = 'mention';
    dom.dataset.mentionId = this.__mentionId;
    return dom;
  }

  exportDOM() {
    const element = document.createElement('span');
    element.className = 'mention';
    element.setAttribute('data-mention-id', this.__mentionId);
    element.textContent = this.getTextContent();
    return { element };
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mentionName, serializedNode.mentionId);
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      mentionId: this.__mentionId,
      type: 'mention',
      version: 1,
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export function $createMentionNode(mentionName: string, mentionId: string): MentionNode {
  const node = new MentionNode(mentionName, mentionId);
  node.setMode('segmented').toggleDirectionless();
  return node;
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}
