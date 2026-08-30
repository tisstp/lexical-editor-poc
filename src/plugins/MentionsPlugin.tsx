import { useCallback, useMemo, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { TextNode } from 'lexical';
import { $createMentionNode } from '../nodes/MentionNode';

const MENTIONS = [
  { id: 'u1', name: 'Alice' },
  { id: 'u2', name: 'Bob' },
  { id: 'u3', name: 'Carol' },
  { id: 'u4', name: 'Dave' },
];

class MentionTypeaheadOption extends MenuOption {
  id: string;
  name: string;
  constructor(id: string, name: string) {
    super(name);
    this.id = id;
    this.name = name;
  }
}

export default function MentionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('@', { minLength: 0 });

  const options = useMemo(() => {
    const filtered = MENTIONS.filter((m) =>
      queryString ? m.name.toLowerCase().includes(queryString.toLowerCase()) : true,
    );
    return filtered.map((m) => new MentionTypeaheadOption(m.id, m.name));
  }, [queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.name, selectedOption.id);
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) =>
        anchorElementRef.current && options.length
          ? (
            <div className="mentions-menu">
              <ul>
                {options.map((option, i) => (
                  <li
                    key={option.key}
                    className={i === selectedIndex ? 'selected' : ''}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => selectOptionAndCleanUp(option)}
                  >
                    @{option.name}
                  </li>
                ))}
              </ul>
            </div>
          )
          : null
      }
    />
  );
}
