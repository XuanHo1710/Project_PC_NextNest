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
    if (cat.parent && cat.parent._id) {
      const parent = idToNodeMap.get(cat.parent._id);
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
