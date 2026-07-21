export const extractOrderError = (payload: unknown): string => {
  const messages: string[] = [];

  const visit = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      messages.push(value.trim());
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === 'object') {
      Object.values(value as Record<string, unknown>).forEach(visit);
    }
  };

  if (payload && typeof payload === 'object') {
    const response = payload as Record<string, unknown>;
    visit(response.message);
    visit(response.errors);
  } else {
    visit(payload);
  }

  return Array.from(new Set(messages)).join('\n');
};

export const orderStatusLabel = (order: any): string => {
  if (order?.order_status) return String(order.order_status);
  const ordered = Number(order?.ordered_quantity ?? order?.total_qty ?? order?.quantity ?? 0);
  const shipped = Number(order?.dispatched_quantity ?? order?.shipped_qty ?? 0);
  if (shipped <= 0) return 'Pending';
  if (ordered > 0 && shipped < ordered) return 'Partially Dispatched';
  return 'Dispatched';
};
