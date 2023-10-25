export async function fetchSearchData(
  query: string | undefined,
  offset: number | undefined
): Promise<any> {
  const data = {
    query: query || "",
    offset: offset || "",
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
}
