import React from 'react';
import { Edit2, History, Play, Trash2 } from 'lucide-react';
import { Word, WordHelper } from '../../MarkdownWordStorage';
import { getWordQueryCount } from '../../utils/wordManager';
import HighlightText from './HighlightText';

interface WordResultItemProps {
    word: Word;
    searchTerm: string;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetail: () => void;
    onJumpToSource: () => void;
    enableFullHighlight: boolean;
    isLast?: boolean;
}

export const WordCard: React.FC<WordResultItemProps> = React.memo(
    ({
        word,
        searchTerm,
        onEdit,
        onDelete,
        onViewDetail,
        onJumpToSource,
        enableFullHighlight,
    }) => {
        const tags = WordHelper.getTags(word);
        const category = WordHelper.getCategory(word);
        const level = WordHelper.getLevel(word);
        const queryCount = getWordQueryCount(word);

        return (
            <article className="la-word-card">
                <button
                    type="button"
                    className="la-word-card-main"
                    onClick={onViewDetail}
                    aria-label={`查看 ${word.name} 详情`}>
                    <div className="la-word-card-header">
                        <h3 className="la-word-title">
                            <HighlightText
                                text={word.name}
                                searchTerm={searchTerm}
                            />
                        </h3>
                        <div className="la-word-card-badges">
                            <span
                                className="la-word-query-badge"
                                aria-label={`查询次数 ${queryCount}`}>
                                <History size={16} aria-hidden="true" />
                                <span>{queryCount}</span>
                            </span>
                            {level && (
                                <span className="la-word-level">{level}</span>
                            )}
                        </div>
                    </div>

                    <dl className="la-word-meta">
                        <div>
                            <dt>发音</dt>
                            <dd>
                                {enableFullHighlight ? (
                                    <HighlightText
                                        text={word.pronunciation}
                                        searchTerm={searchTerm}
                                    />
                                ) : (
                                    word.pronunciation || '未填写'
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt>分类</dt>
                            <dd>
                                <span className="la-word-chip">
                                    {enableFullHighlight ? (
                                        <HighlightText
                                            text={category}
                                            searchTerm={searchTerm}
                                        />
                                    ) : (
                                        category || '未分类'
                                    )}
                                </span>
                            </dd>
                        </div>
                    </dl>

                    {tags.length > 0 && (
                        <div className="la-word-tags" aria-label="标签">
                            {tags.slice(0, 3).map((tag, index) => (
                                <span className="la-word-tag" key={index}>
                                    {enableFullHighlight ? (
                                        <HighlightText
                                            text={tag}
                                            searchTerm={searchTerm}
                                        />
                                    ) : (
                                        tag
                                    )}
                                </span>
                            ))}
                            {tags.length > 3 && (
                                <span className="la-word-tag is-muted">
                                    +{tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {word.notes && word.notes.trim() && (
                        <p className="la-word-note">
                            <span>备注</span>
                            {enableFullHighlight ? (
                                <HighlightText
                                    text={word.notes}
                                    searchTerm={searchTerm}
                                />
                            ) : (
                                word.notes
                            )}
                        </p>
                    )}

                    <span className="la-word-open-hint">查看详情</span>
                </button>

                <div className="la-word-actions">
                    <button
                        type="button"
                        className="la-word-action"
                        onClick={onEdit}
                        aria-label={`编辑 ${word.name}`}
                        title="编辑">
                        <Edit2 size={15} />
                        <span>编辑</span>
                    </button>
                    <button
                        type="button"
                        className="la-word-action is-danger"
                        onClick={onDelete}
                        aria-label={`删除 ${word.name}`}
                        title="删除">
                        <Trash2 size={15} />
                        <span>删除</span>
                    </button>
                    <button
                        type="button"
                        className="la-word-action"
                        onClick={onJumpToSource}
                        aria-label={`跳转到 ${word.name} 源文件`}
                        title="跳转到源文件">
                        <Play size={15} />
                        <span>跳转</span>
                    </button>
                </div>
            </article>
        );
    },
);

WordCard.displayName = 'WordCard';

export const WordListItem: React.FC<WordResultItemProps> = React.memo(
    ({
        word,
        searchTerm,
        onEdit,
        onDelete,
        onViewDetail,
        onJumpToSource,
        enableFullHighlight,
    }) => {
        const tags = WordHelper.getTags(word);
        const category = WordHelper.getCategory(word);
        const level = WordHelper.getLevel(word);

        return (
            <article className="la-word-row">
                <button
                    type="button"
                    className="la-word-row-main"
                    onClick={onViewDetail}
                    aria-label={`查看 ${word.name} 详情`}>
                    <span className="la-word-row-title">
                        <HighlightText
                            text={word.name}
                            searchTerm={searchTerm}
                        />
                    </span>
                    <span className="la-word-row-pronunciation">
                        {enableFullHighlight ? (
                            <HighlightText
                                text={word.pronunciation}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            word.pronunciation || '未填写'
                        )}
                    </span>
                    <span className="la-word-chip">
                        {enableFullHighlight ? (
                            <HighlightText
                                text={category}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            category || '未分类'
                        )}
                    </span>
                    <span className="la-word-row-tags">
                        {tags.slice(0, 2).map((tag, index) => (
                            <span className="la-word-tag" key={index}>
                                {enableFullHighlight ? (
                                    <HighlightText
                                        text={tag}
                                        searchTerm={searchTerm}
                                    />
                                ) : (
                                    tag
                                )}
                            </span>
                        ))}
                        {tags.length > 2 && (
                            <span className="la-word-tag is-muted">
                                +{tags.length - 2}
                            </span>
                        )}
                    </span>
                    <span className="la-word-row-count">
                        {getWordQueryCount(word)} 次
                    </span>
                    {level && <span className="la-word-level">{level}</span>}
                </button>

                <div className="la-word-row-actions">
                    <button
                        type="button"
                        className="la-icon-button la-word-row-action"
                        onClick={onEdit}
                        aria-label={`编辑 ${word.name}`}
                        title="编辑">
                        <Edit2 size={16} />
                    </button>
                    <button
                        type="button"
                        className="la-icon-button la-word-row-action is-danger"
                        onClick={onDelete}
                        aria-label={`删除 ${word.name}`}
                        title="删除">
                        <Trash2 size={16} />
                    </button>
                    <button
                        type="button"
                        className="la-icon-button la-word-row-action"
                        onClick={onJumpToSource}
                        aria-label={`跳转到 ${word.name} 源文件`}
                        title="跳转到源文件">
                        <Play size={16} />
                    </button>
                </div>
            </article>
        );
    },
);

WordListItem.displayName = 'WordListItem';
