const responseData = (payload: unknown): unknown => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data;
  }
  return payload;
};

export const getApiDataArray = <T>(payload: unknown, label: string): T[] => {
  const data = responseData(payload);
  if (!Array.isArray(data)) {
    throw new Error(`Format data ${label} dari server tidak valid.`);
  }
  return data as T[];
};

export const getApiDataObject = <T extends object>(payload: unknown, label: string): T => {
  const data = responseData(payload);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`Format data ${label} dari server tidak valid.`);
  }
  return data as T;
};
