export interface PaginatedResponse<T> {
  data: T[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export async function* paginateResults<T>(
  fetchFn: (cursor?: string) => Promise<PaginatedResponse<T>>,
  limit?: number
): AsyncGenerator<T[], void, unknown> {
  let cursor: string | undefined;
  let totalFetched = 0;

  while (true) {
    const response = await fetchFn(cursor);
    
    if (response.data.length === 0) break;

    yield response.data;
    totalFetched += response.data.length;

    if (limit && totalFetched >= limit) break;
    if (!response.paging?.cursors?.after) break;

    cursor = response.paging.cursors.after;
  }
}