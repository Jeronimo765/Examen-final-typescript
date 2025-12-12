export function timeToMinutes(hhmm: string) {
    const [hh, mm] = hhmm.split(":").map(Number);
    return hh * 60 + mm;
}