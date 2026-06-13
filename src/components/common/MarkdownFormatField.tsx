import React, { useCallback, useRef, useState } from 'react';
import { Bold, Italic, Link, Palette, Trash2, X } from 'lucide-react';

type TextControl = HTMLInputElement | HTMLTextAreaElement;
type FieldVariant = 'input' | 'textarea';
type MarkdownColor = {
    label: string;
    value: string;
};
type LinkDraft = {
    text: string;
    url: string;
    start: number;
    end: number;
    isExisting: boolean;
};
type ColorDraft = {
    color: string;
    innerText: string;
    outerStart: number;
    outerEnd: number;
};
type TextRange = {
    start: number;
    end: number;
};

interface MarkdownFormatFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    variant?: FieldVariant;
    inputStyle?: React.CSSProperties;
    wrapperStyle?: React.CSSProperties;
    className?: string;
    rows?: number;
}

const COLORS: MarkdownColor[] = [
    { label: '红', value: '#ff0000' },
    { label: '蓝', value: '#0000ff' },
    { label: '绿', value: '#008000' },
];

const WORD_CHARACTER_PATTERN = /[\p{L}\p{N}_'\u2019-]/u;

/**
 * 判断字符是否属于可被格式化按钮自动识别的词段字符。
 */
function isWordCharacter(character: string): boolean {
    return WORD_CHARACTER_PATTERN.test(character);
}

/**
 * 无选区时，从光标位置向两侧扩展当前词段，便于直接加粗或取消加粗光标所在单词。
 */
function getMarkdownMarkerTargetRange(
    value: string,
    start: number,
    end: number,
): TextRange {
    if (start !== end) return { start, end };

    let nextStart = start;
    let nextEnd = end;

    while (nextStart > 0 && isWordCharacter(value[nextStart - 1])) {
        nextStart -= 1;
    }

    while (nextEnd < value.length && isWordCharacter(value[nextEnd])) {
        nextEnd += 1;
    }

    return { start: nextStart, end: nextEnd };
}

/**
 * 判断选中的内容或选区外侧是否已带有指定 Markdown 标记，并返回切换后的文本与选区。
 */
function toggleMarkdownMarker(
    value: string,
    start: number,
    end: number,
    marker: string,
): { nextValue: string; nextStart: number; nextEnd: number } {
    const selected = value.slice(start, end);
    const markerLength = marker.length;

    if (
        selected.startsWith(marker) &&
        selected.endsWith(marker) &&
        selected.length >= markerLength * 2
    ) {
        const inner = selected.slice(markerLength, selected.length - markerLength);
        return {
            nextValue: value.slice(0, start) + inner + value.slice(end),
            nextStart: start,
            nextEnd: start + inner.length,
        };
    }

    if (
        start >= markerLength &&
        value.slice(start - markerLength, start) === marker &&
        value.slice(end, end + markerLength) === marker
    ) {
        return {
            nextValue:
                value.slice(0, start - markerLength) +
                selected +
                value.slice(end + markerLength),
            nextStart: start - markerLength,
            nextEnd: end - markerLength,
        };
    }

    const wrapped = `${marker}${selected}${marker}`;
    return {
        nextValue: value.slice(0, start) + wrapped + value.slice(end),
        nextStart: start + markerLength,
        nextEnd: start + markerLength + selected.length,
    };
}

/**
 * 读取当前选区或相邻的 Markdown 链接，用于打开链接编辑面板。
 */
function normalizeColorValue(value: string): string {
    return value.trim().toLowerCase();
}

/**
 * 读取选区所在的 font 颜色标签，支持选中整段标签或只选中标签内部文本。
 */
function getColorDraft(
    value: string,
    start: number,
    end: number,
): ColorDraft | null {
    const selected = value.slice(start, end);
    const selectedMatch = selected.match(
        /^<font\s+color=(["'])(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)\1>([\s\S]*)<\/font>$/i,
    );

    if (selectedMatch) {
        return {
            color: normalizeColorValue(selectedMatch[2]),
            innerText: selectedMatch[3],
            outerStart: start,
            outerEnd: end,
        };
    }

    const openStart = value.lastIndexOf('<font', start);
    if (openStart === -1) return null;

    const openEnd = value.indexOf('>', openStart);
    if (openEnd === -1 || openEnd >= start) return null;

    const openTag = value.slice(openStart, openEnd + 1);
    const openMatch = openTag.match(
        /^<font\s+color=(["'])(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)\1>$/i,
    );
    if (!openMatch) return null;

    const closeStart = value.indexOf('</font>', openEnd + 1);
    if (closeStart === -1 || end > closeStart) return null;

    return {
        color: normalizeColorValue(openMatch[2]),
        innerText: value.slice(openEnd + 1, closeStart),
        outerStart: openStart,
        outerEnd: closeStart + '</font>'.length,
    };
}

/**
 * 切换 font 颜色标签：同色取消，异色替换；没有颜色时包裹选区。
 */
function toggleColorTag(
    value: string,
    start: number,
    end: number,
    color: string,
): { nextValue: string; nextStart: number; nextEnd: number } {
    const colorDraft = getColorDraft(value, start, end);
    const normalizedColor = normalizeColorValue(color);

    if (colorDraft) {
        const isSameColor = colorDraft.color === normalizedColor;
        const openTag = `<font color="${color}">`;
        const replacement = isSameColor
            ? colorDraft.innerText
            : `${openTag}${colorDraft.innerText}</font>`;
        const nextValue =
            value.slice(0, colorDraft.outerStart) +
            replacement +
            value.slice(colorDraft.outerEnd);

        if (isSameColor) {
            return {
                nextValue,
                nextStart: colorDraft.outerStart,
                nextEnd: colorDraft.outerStart + colorDraft.innerText.length,
            };
        }

        return {
            nextValue,
            nextStart: colorDraft.outerStart + openTag.length,
            nextEnd:
                colorDraft.outerStart +
                openTag.length +
                colorDraft.innerText.length,
        };
    }

    const selected = value.slice(start, end);
    const openTag = `<font color="${color}">`;
    const replacement = `${openTag}${selected}</font>`;
    return {
        nextValue: value.slice(0, start) + replacement + value.slice(end),
        nextStart: start + openTag.length,
        nextEnd: start + openTag.length + selected.length,
    };
}

function getLinkDraft(value: string, start: number, end: number): LinkDraft {
    const selected = value.slice(start, end);
    const wholeLinkPattern = /^\[([^\]]*)\]\(([^)]*)\)$/;
    const selectedMatch = selected.match(wholeLinkPattern);

    if (selectedMatch) {
        return {
            text: selectedMatch[1],
            url: selectedMatch[2],
            start,
            end,
            isExisting: true,
        };
    }

    const before = value.lastIndexOf('[', start);
    if (before !== -1) {
        const labelEnd = value.indexOf(']', before + 1);
        const urlStart = labelEnd + 1;
        const urlEnd = value.indexOf(')', urlStart + 1);

        if (
            labelEnd !== -1 &&
            value[urlStart] === '(' &&
            urlEnd !== -1 &&
            before <= start &&
            end <= urlEnd + 1
        ) {
            return {
                text: value.slice(before + 1, labelEnd),
                url: value.slice(urlStart + 1, urlEnd),
                start: before,
                end: urlEnd + 1,
                isExisting: true,
            };
        }
    }

    return {
        text: selected,
        url: '',
        start,
        end,
        isExisting: false,
    };
}

/**
 * 将选区替换为指定文本，并在 React 更新后恢复输入框焦点与选区。
 */
function updateSelection(
    control: TextControl | null,
    start: number,
    end: number,
): void {
    if (!control) return;

    const activeWindow = control.ownerDocument.defaultView;
    activeWindow?.setTimeout(() => {
        try {
            control.focus();
            control.setSelectionRange(start, end);
        } catch (error) {
            console.error('恢复文本选区失败:', error);
        }
    }, 0);
}

export default function MarkdownFormatField({
    value,
    onChange,
    placeholder,
    variant = 'input',
    inputStyle,
    wrapperStyle,
    className,
    rows,
}: MarkdownFormatFieldProps): React.ReactElement {
    const controlRef = useRef<TextControl | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [linkDraft, setLinkDraft] = useState<LinkDraft | null>(null);
    const isTextarea = variant === 'textarea';

    /**
     * 从当前输入控件读取选区，读取失败时退回到文本末尾，保证按钮操作不会抛出异常。
     */
    const getSelectionRange = useCallback(() => {
        try {
            const control = controlRef.current;
            if (!control) return { start: value.length, end: value.length };
            return {
                start: control.selectionStart ?? value.length,
                end: control.selectionEnd ?? value.length,
            };
        } catch (error) {
            console.error('读取文本选区失败:', error);
            return { start: value.length, end: value.length };
        }
    }, [value.length]);

    /**
     * 应用粗体或斜体标记；再次点击已格式化选区时移除外层标记。
     */
    const applyMarker = useCallback(
        (marker: string) => {
            try {
                const { start, end } = getSelectionRange();
                const targetRange = getMarkdownMarkerTargetRange(
                    value,
                    start,
                    end,
                );
                const result = toggleMarkdownMarker(
                    value,
                    targetRange.start,
                    targetRange.end,
                    marker,
                );
                onChange(result.nextValue);
                updateSelection(controlRef.current, result.nextStart, result.nextEnd);
            } catch (error) {
                console.error('应用 Markdown 标记失败:', error);
            }
        },
        [getSelectionRange, onChange, value],
    );

    /**
     * 将选区包裹为兼容 Markdown 渲染的 font 颜色标签。
     */
    const applyColor = useCallback(
        (color: string) => {
            try {
                const { start, end } = getSelectionRange();
                const result = toggleColorTag(value, start, end, color);
                onChange(result.nextValue);
                updateSelection(
                    controlRef.current,
                    result.nextStart,
                    result.nextEnd,
                );
            } catch (error) {
                console.error('应用文本颜色失败:', error);
            }
        },
        [getSelectionRange, onChange, value],
    );

    /**
     * 打开链接编辑面板；未选中文本时会生成空的 []() 草稿。
     */
    const openLinkEditor = useCallback(() => {
        try {
            const { start, end } = getSelectionRange();
            setLinkDraft(getLinkDraft(value, start, end));
            setIsActive(true);
        } catch (error) {
            console.error('打开链接编辑器失败:', error);
        }
    }, [getSelectionRange, value]);

    /**
     * 保存 Markdown 链接草稿，外部 URL 与 Obsidian 内部路径都以 []() 格式写入。
     */
    const saveLinkDraft = useCallback(() => {
        if (!linkDraft) return;

        try {
            const nextText = `[${linkDraft.text}](${linkDraft.url})`;
            const nextValue =
                value.slice(0, linkDraft.start) +
                nextText +
                value.slice(linkDraft.end);
            onChange(nextValue);
            setLinkDraft(null);
            updateSelection(
                controlRef.current,
                linkDraft.start + 1,
                linkDraft.start + 1 + linkDraft.text.length,
            );
        } catch (error) {
            console.error('保存 Markdown 链接失败:', error);
        }
    }, [linkDraft, onChange, value]);

    /**
     * 移除当前 Markdown 链接，仅保留显示文本。
     */
    const removeLinkDraft = useCallback(() => {
        if (!linkDraft) return;

        try {
            const nextValue =
                value.slice(0, linkDraft.start) +
                linkDraft.text +
                value.slice(linkDraft.end);
            onChange(nextValue);
            setLinkDraft(null);
            updateSelection(
                controlRef.current,
                linkDraft.start,
                linkDraft.start + linkDraft.text.length,
            );
        } catch (error) {
            console.error('移除 Markdown 链接失败:', error);
        }
    }, [linkDraft, onChange, value]);

    const handleBlurCapture = useCallback(() => {
        const activeWindow = controlRef.current?.ownerDocument.defaultView;
        activeWindow?.setTimeout(() => {
            const wrapper = wrapperRef.current;
            const activeElement = wrapper?.ownerDocument.activeElement;

            if (!wrapper || !activeElement || !wrapper.contains(activeElement)) {
                setIsActive(false);
                setLinkDraft(null);
            }
        }, 0);
    }, []);

    return (
        <div
            className="la-markdown-format-field"
            onBlurCapture={handleBlurCapture}
            ref={wrapperRef}
            style={wrapperStyle}>
            {isTextarea ? (
                <textarea
                    className={className}
                    onChange={(event) => onChange(event.target.value)}
                    onFocus={() => setIsActive(true)}
                    placeholder={placeholder}
                    ref={(element) => {
                        controlRef.current = element;
                    }}
                    rows={rows}
                    style={inputStyle}
                    value={value}
                />
            ) : (
                <input
                    className={className}
                    onChange={(event) => onChange(event.target.value)}
                    onFocus={() => setIsActive(true)}
                    placeholder={placeholder}
                    ref={(element) => {
                        controlRef.current = element;
                    }}
                    style={inputStyle}
                    type="text"
                    value={value}
                />
            )}

            {isActive && (
                <div
                    className="la-markdown-format-toolbar"
                    aria-label="文本格式工具栏">
                    <button
                        type="button"
                        aria-label="切换粗体"
                        title="粗体"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyMarker('**')}>
                        <Bold size={14} />
                    </button>
                    <button
                        type="button"
                        aria-label="切换斜体"
                        title="斜体"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyMarker('*')}>
                        <Italic size={14} />
                    </button>
                    <div className="la-markdown-color-group" aria-label="文本颜色">
                        <Palette size={14} aria-hidden="true" />
                        {COLORS.map((color) => (
                            <button
                                type="button"
                                aria-label={`设置${color.label}色`}
                                className="la-markdown-color-button"
                                key={color.value}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => applyColor(color.value)}
                                style={{ '--la-format-color': color.value } as React.CSSProperties}
                                title={`${color.label}色`}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        aria-label="编辑 Markdown 链接"
                        title="链接"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={openLinkEditor}>
                        <Link size={14} />
                    </button>
                </div>
            )}

            {linkDraft && (
                <div className="la-markdown-link-popover">
                    <label>
                        <span>显示文本</span>
                        <input
                            type="text"
                            value={linkDraft.text}
                            onChange={(event) =>
                                setLinkDraft({
                                    ...linkDraft,
                                    text: event.target.value,
                                })
                            }
                        />
                    </label>
                    <label>
                        <span>链接地址</span>
                        <input
                            type="text"
                            value={linkDraft.url}
                            onChange={(event) =>
                                setLinkDraft({
                                    ...linkDraft,
                                    url: event.target.value,
                                })
                            }
                            placeholder="https:// 或 Obsidian 内部路径"
                        />
                    </label>
                    <div className="la-markdown-link-actions">
                        {linkDraft.isExisting && (
                            <button
                                type="button"
                                className="is-danger"
                                aria-label="移除链接"
                                title="移除链接"
                                onClick={removeLinkDraft}>
                                <Trash2 size={14} />
                            </button>
                        )}
                        <button
                            type="button"
                            aria-label="关闭链接编辑"
                            title="关闭"
                            onClick={() => setLinkDraft(null)}>
                            <X size={14} />
                        </button>
                        <button type="button" onClick={saveLinkDraft}>
                            保存
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
