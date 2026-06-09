import { Word, WordHelper } from '../MarkdownWordStorage';

export const createEmptyWord = (): Word => WordHelper.createEmpty();

export const getWordId = (word: Word): string => WordHelper.getId(word);

export const getWordQueryCount = (word: Word): number =>
    WordHelper.getQueryCount(word);
