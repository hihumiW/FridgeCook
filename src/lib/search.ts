type SearchableItem = {
  name: string;
  aliases?: string[];
};

export function normalizeSearchKeyword(keyword: string) {
  return keyword.trim();
}

export function matchesKeyword(item: SearchableItem, keyword: string) {
  const normalizedKeyword = normalizeSearchKeyword(keyword);

  if (!normalizedKeyword) {
    return true;
  }

  return (
    item.name.includes(normalizedKeyword) ||
    item.aliases?.some((alias) => alias.includes(normalizedKeyword))
  );
}

export function uniqueSearchResultsById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}
