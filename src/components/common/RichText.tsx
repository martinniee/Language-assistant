import React from 'react';

type RichTextColor = 'red' | 'blue' | 'green';

interface RichTextProps {
    text?: string | null;
    className?: string;
    as?: 'span' | 'div';
}

interface TokenMatch {
    index: number;
    end: number;
    priority: number;
    render: (key: string) => React.ReactNode;
}

const COLOR_TAG_PATTERN =
    /<\s*(span|font)\b([^>]*)>([\s\S]*?)<\s*\/\s*\1\s*>/i;

const COLOR_ALIASES: Record<string, RichTextColor> = {
    red: 'red',
    '#f00': 'red',
    '#ff0000': 'red',
    blue: 'blue',
    '#00f': 'blue',
    '#0000ff': 'blue',
    green: 'green',
    '#0f0': 'green',
    '#00ff00': 'green',
    '#008000': 'green',
};

function normalizeColor(value: string): RichTextColor | null {
    const normalized = value.trim().toLowerCase().replace(/\s+/g, '');
    return COLOR_ALIASES[normalized] || null;
}

function extractAllowedColor(attributes: string): RichTextColor | null {
    const styleMatch = attributes.match(
        /style\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    if (styleMatch) {
        const styleValue = styleMatch[1] || styleMatch[2] || styleMatch[3];
        const colorMatch = styleValue.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
        if (colorMatch) {
            const color = normalizeColor(colorMatch[1]);
            if (color) return color;
        }
    }

    const colorMatch = attributes.match(/color\s*=\s*["']?([^"'\s>]+)/i);
    return colorMatch ? normalizeColor(colorMatch[1]) : null;
}

function findColorToken(text: string): TokenMatch | null {
    let offset = 0;
    let rest = text;

    while (rest.length > 0) {
        const match = COLOR_TAG_PATTERN.exec(rest);
        if (!match || match.index < 0) return null;

        const color = extractAllowedColor(match[2]);
        if (color) {
            return {
                index: offset + match.index,
                end: offset + match.index + match[0].length,
                priority: 0,
                render: (key) => (
                    <span className={`la-rich-text-color-${color}`} key={key}>
                        {parseInlineRichText(match[3], key)}
                    </span>
                ),
            };
        }

        const nextOffset = match.index + match[0].length;
        offset += nextOffset;
        rest = rest.slice(nextOffset);
    }

    return null;
}

function findDelimitedToken(
    text: string,
    marker: string,
    priority: number,
    render: (content: string, key: string) => React.ReactNode,
): TokenMatch | null {
    let start = text.indexOf(marker);

    while (start !== -1) {
        const contentStart = start + marker.length;
        const end = text.indexOf(marker, contentStart);

        if (end !== -1 && end > contentStart) {
            return {
                index: start,
                end: end + marker.length,
                priority,
                render: (key) => render(text.slice(contentStart, end), key),
            };
        }

        start = text.indexOf(marker, contentStart);
    }

    return null;
}

function findSingleAsteriskToken(text: string): TokenMatch | null {
    for (let start = 0; start < text.length; start += 1) {
        if (text[start] !== '*') continue;
        if (text[start - 1] === '*' || text[start + 1] === '*') continue;

        for (let end = start + 1; end < text.length; end += 1) {
            if (text[end] !== '*') continue;
            if (text[end - 1] === '*' || text[end + 1] === '*') continue;
            if (end === start + 1) break;

            return {
                index: start,
                end: end + 1,
                priority: 3,
                render: (key) => (
                    <em key={key}>
                        {parseInlineRichText(text.slice(start + 1, end), key)}
                    </em>
                ),
            };
        }
    }

    return null;
}

/**
 * 校验 Markdown 链接地址，只允许常见安全协议，避免渲染脚本链接。
 */
function normalizeSafeUrl(value: string): string | null {
    const url = value.trim();

    if (!url) return null;

    try {
        const parsed = new URL(url);
        return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
            ? url
            : null;
    } catch {
        return null;
    }
}

function findMarkdownLinkToken(text: string): TokenMatch | null {
    for (let start = 0; start < text.length; start += 1) {
        if (text[start] !== '[' || text[start - 1] === '!') continue;

        const labelEnd = text.indexOf(']', start + 1);
        if (labelEnd <= start + 1 || text[labelEnd + 1] !== '(') continue;

        const urlEnd = text.indexOf(')', labelEnd + 2);
        if (urlEnd <= labelEnd + 2) continue;

        const label = text.slice(start + 1, labelEnd);
        const url = normalizeSafeUrl(text.slice(labelEnd + 2, urlEnd));
        if (!url) continue;

        return {
            index: start,
            end: urlEnd + 1,
            priority: 0,
            render: (key) => (
                <a
                    className="la-rich-text-link"
                    href={url}
                    key={key}
                    rel="noopener noreferrer"
                    target="_blank">
                    {parseInlineRichText(label, key)}
                </a>
            ),
        };
    }

    return null;
}

function pickFirstToken(tokens: Array<TokenMatch | null>): TokenMatch | null {
    return tokens
        .filter((token): token is TokenMatch => token !== null)
        .sort((a, b) => a.index - b.index || a.priority - b.priority)[0] || null;
}

function parseInlineRichText(text: string, keyPrefix = 'rt'): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    let rest = text;
    let index = 0;

    while (rest.length > 0) {
        const token = pickFirstToken([
            findMarkdownLinkToken(rest),
            findColorToken(rest),
            findDelimitedToken(rest, '***', 1, (content, key) => (
                <strong key={key}>
                    <em>{parseInlineRichText(content, key)}</em>
                </strong>
            )),
            findDelimitedToken(rest, '**', 2, (content, key) => (
                <strong key={key}>{parseInlineRichText(content, key)}</strong>
            )),
            findSingleAsteriskToken(rest),
        ]);

        if (!token) {
            nodes.push(rest);
            break;
        }

        if (token.index > 0) {
            nodes.push(rest.slice(0, token.index));
        }

        nodes.push(token.render(`${keyPrefix}-${index}`));
        rest = rest.slice(token.end);
        index += 1;
    }

    return nodes;
}

export default function RichText({
    text,
    className,
    as = 'span',
}: RichTextProps): React.ReactElement {
    const Component = as;
    const value = text || '';
    const classNames = ['la-rich-text', className].filter(Boolean).join(' ');

    return <Component className={classNames}>{parseInlineRichText(value)}</Component>;
}
