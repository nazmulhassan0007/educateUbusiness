// The API's durations are free text ("2", "3 hours", "2 hourse").
export function tidyDuration(label: string | null) {
  const n = label?.match(/[\d.]+/)?.[0];
  return n ? `${n} hour${n === "1" ? "" : "s"}` : (label ?? "");
}
