import React, { useCallback, useMemo, useState } from 'react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    HelpCircle,
    RefreshCcw,
    Shuffle,
} from 'lucide-react';
import type { App } from 'obsidian';
import type { Word } from '../../MarkdownWordStorage';
import { WordHelper } from '../../MarkdownWordStorage';
import { getWordId } from '../../utils/wordManager';
import { RichText } from '../common';

type RandomPracticeRating = 'known' | 'unsure';

interface RandomWordPracticeProps {
    app: App;
    markdownSourcePath: string;
    words: Word[];
    onOpenDetail: (word: Word) => void;
}

/**
 * 将用户输入的抽取数量限制在词库容量范围内，避免出现空抽样或越界抽样。
 */
function clampSampleCount(value: number, max: number): number {
    if (max <= 0) return 0;
    if (!Number.isFinite(value)) return 1;
    return Math.min(Math.max(Math.floor(value), 1), max);
}

/**
 * 使用 Fisher-Yates 洗牌从词库中无放回抽取指定数量的单词。
 */
function sampleWords(words: Word[], count: number): Word[] {
    const shuffled = [...words];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[index],
        ];
    }

    return shuffled.slice(0, count);
}

/**
 * 读取单词第一条可用定义，作为随机曝光卡片的轻量答案内容。
 */
function getPrimaryDefinition(word: Word): string {
    for (const part of word.content || []) {
        for (const definition of part.definitions || []) {
            if (definition.definition.trim()) {
                return definition.definition;
            }
        }
    }

    return '';
}

/**
 * 读取单词第一条可用例句，帮助用户在揭示答案后建立语境记忆。
 */
function getPrimaryExample(word: Word): string {
    for (const part of word.content || []) {
        for (const definition of part.definitions || []) {
            for (const example of definition.examples || []) {
                if (example.text.trim()) {
                    return example.text;
                }
            }
        }
    }

    return '';
}

export default function RandomWordPractice({
    app,
    markdownSourcePath,
    words,
    onOpenDetail,
}: RandomWordPracticeProps): React.ReactElement {
    const defaultCount = Math.min(5, Math.max(words.length, 1));
    const [sampleCount, setSampleCount] = useState(defaultCount);
    const [randomWords, setRandomWords] = useState<Word[]>([]);
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
    const [ratings, setRatings] = useState<
        Partial<Record<string, RandomPracticeRating>>
    >({});

    const maxSampleCount = words.length;
    const safeSampleCount = clampSampleCount(sampleCount, maxSampleCount);
    const knownCount = useMemo(
        () => Object.values(ratings).filter((rating) => rating === 'known').length,
        [ratings],
    );
    const unsureCount = useMemo(
        () => Object.values(ratings).filter((rating) => rating === 'unsure').length,
        [ratings],
    );

    const handleGenerate = useCallback(() => {
        const nextCount = clampSampleCount(sampleCount, words.length);
        setSampleCount(nextCount);
        setRandomWords(sampleWords(words, nextCount));
        setRevealedIds(new Set());
        setRatings({});
    }, [sampleCount, words]);

    const handleCountChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const nextValue = Number(event.target.value);
            setSampleCount(clampSampleCount(nextValue, maxSampleCount));
        },
        [maxSampleCount],
    );

    const toggleReveal = useCallback((wordId: string) => {
        setRevealedIds((current) => {
            const next = new Set(current);

            if (next.has(wordId)) {
                next.delete(wordId);
            } else {
                next.add(wordId);
            }

            return next;
        });
    }, []);

    const rateWord = useCallback(
        (wordId: string, rating: RandomPracticeRating) => {
            setRatings((current) => ({
                ...current,
                [wordId]: rating,
            }));
        },
        [],
    );

    if (words.length === 0) {
        return (
            <section className="la-random-practice" aria-label="随机单词">
                <div className="la-random-practice-empty">
                    当前词库暂无单词，添加单词后即可开始随机曝光。
                </div>
            </section>
        );
    }

    return (
        <section className="la-random-practice" aria-label="随机单词">
            <div className="la-random-practice-header">
                <div className="la-random-practice-title">
                    <Shuffle size={18} aria-hidden="true" />
                    <div>
                        <h2>随机单词</h2>
                        <p>轻量抽查当前词库，只增加曝光，不改动学习数据。</p>
                    </div>
                </div>

                <div className="la-random-practice-controls">
                    <label className="la-random-practice-count">
                        <span>抽取数量</span>
                        <input
                            aria-label="随机单词抽取数量"
                            max={maxSampleCount}
                            min={1}
                            onChange={handleCountChange}
                            type="number"
                            value={safeSampleCount}
                        />
                    </label>
                    <button
                        className="la-random-practice-generate"
                        onClick={handleGenerate}
                        type="button">
                        <RefreshCcw size={16} aria-hidden="true" />
                        抽取
                    </button>
                </div>
            </div>

            {randomWords.length > 0 && (
                <div className="la-random-practice-summary" aria-live="polite">
                    <span>本轮 {randomWords.length} 个</span>
                    <span>认识 {knownCount}</span>
                    <span>模糊 {unsureCount}</span>
                </div>
            )}

            {randomWords.length === 0 ? (
                <div className="la-random-practice-empty">
                    设置数量后点击抽取，开始一次不写入数据的轻量自测。
                </div>
            ) : (
                <div className="la-random-practice-list">
                    {randomWords.map((word, index) => {
                        const wordId = getWordId(word) || word.name;
                        const isRevealed = revealedIds.has(wordId);
                        const rating = ratings[wordId];
                        const definition = getPrimaryDefinition(word);
                        const example = getPrimaryExample(word);

                        return (
                            <article className="la-random-card" key={wordId}>
                                <div className="la-random-card-front">
                                    <span className="la-random-card-index">
                                        {index + 1}
                                    </span>
                                    <div className="la-random-card-main">
                                        <h3>{word.name}</h3>
                                        <div className="la-random-card-meta">
                                            {word.pronunciation && (
                                                <span>{word.pronunciation}</span>
                                            )}
                                            {WordHelper.getCategory(word) && (
                                                <span>
                                                    {WordHelper.getCategory(word)}
                                                </span>
                                            )}
                                            {WordHelper.getLevel(word) && (
                                                <span>
                                                    {WordHelper.getLevel(word)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isRevealed && (
                                    <div className="la-random-card-answer">
                                        {definition ? (
                                            <RichText
                                                app={app}
                                                as="div"
                                                renderMarkdown
                                                sourcePath={markdownSourcePath}
                                                text={definition}
                                            />
                                        ) : (
                                            <span className="la-random-card-muted">
                                                暂无定义
                                            </span>
                                        )}
                                        {example && (
                                            <RichText
                                                app={app}
                                                as="div"
                                                className="la-random-card-example"
                                                renderMarkdown
                                                sourcePath={markdownSourcePath}
                                                text={example}
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="la-random-card-actions">
                                    <button
                                        className="la-random-card-action"
                                        onClick={() => toggleReveal(wordId)}
                                        type="button">
                                        {isRevealed ? (
                                            <EyeOff size={15} aria-hidden="true" />
                                        ) : (
                                            <Eye size={15} aria-hidden="true" />
                                        )}
                                        {isRevealed ? '隐藏释义' : '显示释义'}
                                    </button>
                                    <button
                                        className={`la-random-card-action${
                                            rating === 'known' ? ' is-active' : ''
                                        }`}
                                        onClick={() => rateWord(wordId, 'known')}
                                        type="button">
                                        <CheckCircle2 size={15} aria-hidden="true" />
                                        认识
                                    </button>
                                    <button
                                        className={`la-random-card-action${
                                            rating === 'unsure' ? ' is-active' : ''
                                        }`}
                                        onClick={() => rateWord(wordId, 'unsure')}
                                        type="button">
                                        <HelpCircle size={15} aria-hidden="true" />
                                        模糊
                                    </button>
                                    <button
                                        className="la-random-card-action"
                                        onClick={() => onOpenDetail(word)}
                                        type="button">
                                        查看详情
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
