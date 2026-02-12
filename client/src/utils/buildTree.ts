import { ICategory } from "@/types/category";

export const buildCategoryTree = (flatCategories: ICategory[]): ICategory[] => {
  const idToNodeMap = new Map<string, ICategory>();

  // Bản sao để tránh đụng dữ liệu gốc
  const categoriesCopy = flatCategories.map((cat) => ({
    ...cat,
    children: [],
  }));

  // Map id → node
  categoriesCopy.forEach((cat) => {
    if (cat._id) {
      idToNodeMap.set(cat._id, cat);
    }
  });

  const tree: ICategory[] = [];

  categoriesCopy.forEach((cat) => {
    if (cat.parentId) {
      const parentKey =
        typeof cat.parentId === "string" ? cat.parentId : cat.parentId._id;
      const parent = idToNodeMap.get(parentKey);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(cat);
      }
    } else {
      tree.push(cat); // root node
    }
  });

  return tree;
};
