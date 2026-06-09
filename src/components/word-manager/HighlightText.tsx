import React, { useMemo } from 'react';

interface HighlightTextProps {
    text: string;
    searchTerm: string;
}

const HighlightText: React.FC<HighlightTextProps> = React.memo(
    ({ text, searchTerm }) => {
        const highlightedContent = useMemo(() => {
            if (!searchTerm || !text) {
                return <span>{text}</span>;
            }

            const escapedTerm = searchTerm.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&',
            );
            const parts = text.split(new RegExp(`(${escapedTerm})`, 'gi'));

            return (
                <span>
                    {parts.map((part, index) =>
                        part.toLowerCase() === searchTerm.toLowerCase() ? (
                            <span
                                key={index}
                                className="la-highlight-match">
                                {part}
                            </span>
                        ) : (
                            <span key={index}>{part}</span>
                        ),
                    )}
                </span>
            );
        }, [text, searchTerm]);

        return highlightedContent;
    },
);

HighlightText.displayName = 'HighlightText';

export default HighlightText;
