import { SHOPPING_URL } from "./config";

export type Plant = {
  id: string;
  name: string;
  description: string;
  family: string;
  price: number;
  stock: number;
  imageUrl: string;
  rare: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getAllPlants(
  limit: number,
  offset: number
): Promise<Plant[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  const response = await fetch(`${SHOPPING_URL}/plants?${params}`);

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error || "Failed to get plants");
  };

  const result = await response.json();

  return result.data;
};

export async function getRarePlants(
  limit: number,
  offset: number
): Promise<Plant[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  const response = await fetch(`${SHOPPING_URL}/plants/rare?${params}`);

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error || "Failed to get rare plants");
  };

  const result = await response.json();

  return result.data;
};