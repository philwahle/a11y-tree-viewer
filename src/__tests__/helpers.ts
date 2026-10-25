import type { A11yNode } from "../types/a11y";

export function flatten(nodes: A11yNode[]): A11yNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)]);
}

export function findAll(
  nodes: A11yNode[],
  pred: (n: A11yNode) => boolean,
): A11yNode[] {
  return flatten(nodes).filter(pred);
}

export function find(
  nodes: A11yNode[],
  pred: (n: A11yNode) => boolean,
): A11yNode {
  const hit = flatten(nodes).find(pred);
  if (!hit) throw new Error("Kein passender Knoten gefunden");
  return hit;
}

export const byTag = (tag: string) => (n: A11yNode) => n.tag === tag;
export const byRole = (role: string) => (n: A11yNode) =>
  n.roleInfo.role === role;
