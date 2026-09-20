export type TimetableRange = "day" | "week";

export function getRangeStart(range: TimetableRange, reference: Date): Date {
    if (range === "day") {
        return reference;
    }
    const day = reference.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    const offsetToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(reference);
    start.setDate(reference.getDate() + offsetToMonday);
    return start;
}

export function getRangeEnd(range: TimetableRange, reference: Date): Date {
    if (range === "day") {
        return reference;
    }
    const start = getRangeStart("week", reference);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
}


export function parseIsoDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return null;
    }
    const [, y, m, d] = match;
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    const isValid =
        date.getUTCFullYear() === Number(y) &&
        date.getUTCMonth() === Number(m) - 1 &&
        date.getUTCDate() === Number(d);
    return isValid ? date : null;
}

export function nextMonday(from: Date): Date {
    const day = from.getDay();
    const offset = ((8 - day) % 7) || 7;
    const result = new Date(from);
    result.setDate(from.getDate() + offset);
    return result;
}