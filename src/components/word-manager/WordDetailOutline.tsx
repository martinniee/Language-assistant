import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { Word } from '../../MarkdownWordStorage';
import { getWordId } from '../../utils/wordManager';
import { RichText } from '../common';

interface WordDetailOutlineProps {
    word: Word;
}

export default function WordDetailOutline({
    word,
}: WordDetailOutlineProps): React.ReactElement {
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(
        new Set(),
    );

    const wordKey = useMemo(() => getWordId(word) || word.name, [word]);

    useEffect(() => {
        setCollapsedNodes(new Set());
    }, [wordKey]);

    const toggleNode = useCallback((nodeKey: string) => {
        setCollapsedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(nodeKey)) {
                next.delete(nodeKey);
            } else {
                next.add(nodeKey);
            }
            return next;
        });
    }, []);

    const validParts = useMemo(() => {
        return (word.content || []).filter((part) => {
            const hasType = Boolean(part.type && part.type.trim());
            const hasContent = Boolean(
                part.definitions?.some((def) => {
                    const hasDefinition = Boolean(
                        def.definition && def.definition.trim(),
                    );
                    const hasExamples = Boolean(
                        def.examples?.some((ex) => ex.text && ex.text.trim()),
                    );
                    return hasDefinition || hasExamples;
                }),
            );
            return hasType || hasContent;
        });
    }, [word.content]);

    if (validParts.length === 0) {
        return (
            <div className="la-word-detail-empty">
                <MoreHorizontal size={30} />
                暂无详细内容，点击“编辑单词”添加词性、定义和例句
            </div>
        );
    }

    return (
        <div className="la-word-detail-outline">
            {validParts.map((part, partIndex) => {
                const partKey = `part-${partIndex}`;
                const partCollapsed = collapsedNodes.has(partKey);
                const validDefinitions = (part.definitions || []).filter(
                    (def) => {
                        const hasDefinition = Boolean(
                            def.definition && def.definition.trim(),
                        );
                        const hasExamples = Boolean(
                            def.examples?.some(
                                (ex) => ex.text && ex.text.trim(),
                            ),
                        );
                        return hasDefinition || hasExamples;
                    },
                );

                return (
                    <section key={partKey} className="la-word-detail-part">
                        <div className="la-detail-node-heading la-detail-node-heading-part">
                            <button
                                type="button"
                                className="la-detail-toggle"
                                aria-label={`${partCollapsed ? '展开' : '折叠'}词性 ${part.type || '未命名词性'}`}
                                aria-expanded={!partCollapsed}
                                onClick={() => toggleNode(partKey)}>
                                {partCollapsed ? (
                                    <ChevronRight size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </button>
                            <h4 className="la-word-detail-part-title">
                                {part.type && part.type.trim()
                                    ? part.type
                                    : '未命名词性'}
                            </h4>
                            <span className="la-detail-node-count">
                                {validDefinitions.length} 个定义
                            </span>
                        </div>

                        {!partCollapsed && (
                            <div className="la-detail-node-children">
                                {validDefinitions.length > 0 ? (
                                    validDefinitions.map((def, defIndex) => {
                                        const defKey = `${partKey}-def-${defIndex}`;
                                        const examplesKey = `${defKey}-examples`;
                                        const defCollapsed =
                                            collapsedNodes.has(defKey);
                                        const examplesCollapsed =
                                            collapsedNodes.has(examplesKey);
                                        const hasDefinition = Boolean(
                                            def.definition &&
                                                def.definition.trim(),
                                        );
                                        const validExamples = def.examples
                                            ? def.examples.filter(
                                                  (ex) =>
                                                      ex.text &&
                                                      ex.text.trim() !== '',
                                              )
                                            : [];

                                        return (
                                            <div
                                                key={defKey}
                                                className="la-word-detail-definition">
                                                <div className="la-detail-node-heading la-detail-node-heading-definition">
                                                    <button
                                                        type="button"
                                                        className="la-detail-toggle"
                                                        aria-label={`${defCollapsed ? '展开' : '折叠'}定义`}
                                                        aria-expanded={
                                                            !defCollapsed
                                                        }
                                                        onClick={() =>
                                                            toggleNode(defKey)
                                                        }>
                                                        {defCollapsed ? (
                                                            <ChevronRight
                                                                size={16}
                                                            />
                                                        ) : (
                                                            <ChevronDown
                                                                size={16}
                                                            />
                                                        )}
                                                    </button>
                                                    <span className="la-detail-node-label">
                                                        定义
                                                    </span>
                                                </div>

                                                {!defCollapsed && (
                                                    <div className="la-detail-definition-body">
                                                        <div className="la-word-detail-definition-text">
                                                            {hasDefinition ? (
                                                                <RichText
                                                                    text={
                                                                        def.definition
                                                                    }
                                                                />
                                                            ) : (
                                                                <span className="la-word-detail-muted">
                                                                    暂无定义
                                                                </span>
                                                            )}
                                                        </div>

                                                        {validExamples.length >
                                                            0 && (
                                                            <div className="la-word-detail-examples">
                                                                <div className="la-detail-node-heading la-detail-node-heading-examples">
                                                                    <button
                                                                        type="button"
                                                                        className="la-detail-toggle"
                                                                        aria-label={`${examplesCollapsed ? '展开' : '折叠'}例句`}
                                                                        aria-expanded={
                                                                            !examplesCollapsed
                                                                        }
                                                                        onClick={() =>
                                                                            toggleNode(
                                                                                examplesKey,
                                                                            )
                                                                        }>
                                                                        {examplesCollapsed ? (
                                                                            <ChevronRight
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <ChevronDown
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />
                                                                        )}
                                                                    </button>
                                                                    <span className="la-detail-node-label la-detail-node-label-muted">
                                                                        例句
                                                                    </span>
                                                                </div>

                                                                {!examplesCollapsed && (
                                                                    <div className="la-word-detail-example-list">
                                                                        {validExamples.map(
                                                                            (
                                                                                example,
                                                                                exIndex,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        exIndex
                                                                                    }
                                                                                    className="la-word-detail-example">
                                                                                    <span className="la-word-detail-example-marker">
                                                                                        -
                                                                                    </span>
                                                                                    <RichText
                                                                                        text={
                                                                                            example.text
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="la-word-detail-empty la-word-detail-empty-inline">
                                        暂无定义和例句
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
