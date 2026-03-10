type WritingElement = {
  id: string;
  status: string;
  dependencies: string;
  difficulty: number;
  orderIndex: number;
};

export function pickNextElement(elements: WritingElement[]) {
  const byId = new Map(elements.map((e) => [e.id, e]));

  const candidates = elements
    .filter((e) => e.status !== "done")
    .filter((e) => {
      const deps = JSON.parse(e.dependencies) as string[];
      return deps.every((dep) => byId.get(dep)?.status === "done");
    })
    .sort((a, b) => a.difficulty - b.difficulty || a.orderIndex - b.orderIndex);

  return candidates[0] || null;
}

export function completionRate(total: number, done: number) {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}
