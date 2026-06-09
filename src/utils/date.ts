export const STORAGE_TIMESTAMP_FORMAT = 'YYYYMMDDHHmm';

const pad2 = (value: number): string => String(value).padStart(2, '0');

const createLocalDate = (
    year: string,
    month: string,
    day: string,
    hour: string,
    minute: string,
): Date | null => {
    const parsed = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
    );

    const isValid =
        parsed.getFullYear() === Number(year) &&
        parsed.getMonth() === Number(month) - 1 &&
        parsed.getDate() === Number(day) &&
        parsed.getHours() === Number(hour) &&
        parsed.getMinutes() === Number(minute);

    return isValid ? parsed : null;
};

export const formatTimestamp = (date: Date = new Date()): string =>
    [
        date.getFullYear(),
        pad2(date.getMonth() + 1),
        pad2(date.getDate()),
        pad2(date.getHours()),
        pad2(date.getMinutes()),
    ].join('');

export const parseTimestamp = (value?: string | null): Date | null => {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const compactMatch = trimmed.match(
        /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    );
    if (compactMatch) {
        const [, year, month, day, hour, minute] = compactMatch;
        return createLocalDate(year, month, day, hour, minute);
    }

    const readableMatch = trimmed.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/,
    );
    if (readableMatch) {
        const [, year, month, day, hour, minute] = readableMatch;
        return createLocalDate(year, month, day, hour, minute);
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const normalizeTimestampForStorage = (
    value?: string | Date | null,
): string | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return formatTimestamp(value);

    const parsed = parseTimestamp(value);
    return parsed ? formatTimestamp(parsed) : undefined;
};

export const formatTimestampForDisplay = (
    value?: string | Date | null,
): string => {
    const parsed = value instanceof Date ? value : parseTimestamp(value);
    if (!parsed) return '';

    return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(
        parsed.getDate(),
    )} ${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`;
};
