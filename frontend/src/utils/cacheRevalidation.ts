const EXPENSE_REVALIDATION_UNTIL_KEY = 'billBuddy.expenseRevalidationUntil';
const EXPENSE_REVALIDATION_WINDOW_MS = 6 * 60 * 1000;

export function markExpenseDataChanged() {
  sessionStorage.setItem(
    EXPENSE_REVALIDATION_UNTIL_KEY,
    String(Date.now() + EXPENSE_REVALIDATION_WINDOW_MS),
  );
}

export function getExpenseRevalidationCacheMode(): RequestCache | undefined {
  const revalidateUntil = Number(
    sessionStorage.getItem(EXPENSE_REVALIDATION_UNTIL_KEY) ?? 0,
  );

  return Date.now() < revalidateUntil ? 'no-cache' : undefined;
}

export function withExpenseRevalidation(init: RequestInit = {}): RequestInit {
  if (init.cache) {
    return init;
  }

  const cache = getExpenseRevalidationCacheMode();
  return cache ? { ...init, cache } : init;
}
