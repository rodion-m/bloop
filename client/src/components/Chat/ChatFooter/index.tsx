import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  memo,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChatMessageAuthor,
  ChatMessageServer,
  OpenChatHistoryItem,
} from '../../../types/general';
import { ChatContext } from '../../../context/chatContext';
import { findElementInCurrentTab } from '../../../utils/domUtils';
import NLInput from './NLInput';
import { UIContext } from '../../../context/uiContext';
import {getPromptSuggestions} from "../../../services/api.ts";

type Props = {
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  onMessageEditCancel: () => void;
  setHistoryOpen: (b: boolean) => void;
  isLoading: boolean;
  isHistoryOpen: boolean;
  queryIdToEdit?: string;
  hideMessagesFrom: number | null;
  stopGenerating: () => void;
  openHistoryItem: OpenChatHistoryItem | null;
};

const blurInput = () => {
  findElementInCurrentTab('#question-input')?.blur();
};

const ChatFooter = ({
  inputValue,
  setInputValue,
  onMessageEditCancel,
  isLoading,
  queryIdToEdit,
  hideMessagesFrom,
  stopGenerating,
  openHistoryItem,
  isHistoryOpen,
  setHistoryOpen,
}: Props) => {
  const { t } = useTranslation();
  const { conversation, selectedLines, submittedQuery } = useContext(
    ChatContext.Values,
  );
  const { setSelectedLines, setSubmittedQuery, setConversation, setThreadId } =
    useContext(ChatContext.Setters);

  const [tutorialQuestions, setTutorialQuestions] = useState([]);

  const onSubmit = useCallback(
    (e?: FormEvent) => {
      if (e?.preventDefault) {
        e.preventDefault();
      }
      if (
        (conversation[conversation.length - 1] as ChatMessageServer)
          ?.isLoading ||
        !inputValue.trim()
      ) {
        return;
      }
      if (hideMessagesFrom !== null) {
        setConversation((prev) => prev.slice(0, hideMessagesFrom));
      }
      blurInput();
      setSubmittedQuery(
        submittedQuery === inputValue ? `${inputValue} ` : inputValue, // to trigger new search if query hasn't changed
      );
    },
    [inputValue, conversation, submittedQuery, hideMessagesFrom],
  );

  const loadingSteps = useMemo(() => {
    return conversation[conversation.length - 1]?.author ===
      ChatMessageAuthor.Server
      ? [
          ...(conversation[conversation.length - 1] as ChatMessageServer)
            .loadingSteps,
          ...((conversation[conversation.length - 1] as ChatMessageServer)?.text
            ?.length
            ? [
                {
                  displayText: t('Responding...'),
                  content: { query: '' },
                  path: '',
                  type: 'code' as const,
                },
              ]
            : []),
        ]
      : undefined;
  }, [JSON.stringify(conversation[conversation.length - 1])]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value),
    [],
  );

  const onFormClick = useCallback(() => {
    if (isHistoryOpen) {
      if (openHistoryItem) {
        setThreadId(openHistoryItem.threadId);
        setConversation(openHistoryItem.conversation);
      }
      setHistoryOpen(false);
    }
  }, [isHistoryOpen, openHistoryItem, setHistoryOpen]);


  const { tab } = useContext(UIContext.Tab);
  const repoRef = tab.repoRef;
  const branch = tab.branch;

  useEffect(() => {
    getPromptSuggestions(repoRef, branch).then((res) => {
      if (res && res.suggestions) {
        setTutorialQuestions(res.suggestions);
      }
    })
  }, [])

  return (
    <div className="flex flex-col w-full absolute bottom-0 left-0 p-4 bg-chat-bg-base/25 backdrop-blur-6 border-t border-chat-bg-border">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center overflow-x-auto">
          {tutorialQuestions && tutorialQuestions.map(({tag, question}) => (<button className="rounded-xl inline bg-chat-bg-base mr-2 py-1 px-2 whitespace-nowrap" onClick={() => setInputValue(question)}>{tag}</button>)
)}
        </div>
      </div>
      <form onSubmit={onSubmit} className="w-full" onClick={onFormClick}>
        <NLInput
          id="question-input"
          value={inputValue}
          onSubmit={onSubmit}
          onChange={handleInputChange}
          isStoppable={isLoading}
          loadingSteps={loadingSteps}
          generationInProgress={
            (conversation[conversation.length - 1] as ChatMessageServer)
              ?.isLoading
          }
          onStop={stopGenerating}
          selectedLines={selectedLines}
          setSelectedLines={setSelectedLines}
          queryIdToEdit={queryIdToEdit}
          onMessageEditCancel={onMessageEditCancel}
        />
      </form>
    </div>
  );
};

export default memo(ChatFooter);
