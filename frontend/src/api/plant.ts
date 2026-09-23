import { SHOPPING_URL } from "./config";

export type PlantSort = "alphabetical" | "cheapest" | "expensive";
export type PlantFamily = "Araceae" | "Moraceae" | "all";

export type Plant = {
  id: string;
  name: string;
  description: string;
  family: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export async function getAllPlants(
  limit: number,
  offset: number,
  sort?: PlantSort,
  family?: PlantFamily
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  if (sort) {
    params.set("sort", sort);
  };

  if (family) {
    params.set("family", family);
  };

  const response = await fetch(`${SHOPPING_URL}/plants?${params}`);

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error || "Failed to get plants");
  };

  const result = await response.json();

  return result.data;
};