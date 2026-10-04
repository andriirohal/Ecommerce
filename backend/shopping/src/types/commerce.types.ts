export type Plant = {
  id: string;
  name: string;
  description: string;
  family: string;
  price: number;
  stock: number;
  imageUrl: string;
  rare: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePlantInput = {
  name: string;
  description: string;
  family: string;
  price: number;
  stock: number;
  imageUrl: string;
};

export type UpdatePlantInput = {
  name: string | null;
  description: string | null;
  family: string | null;
  price: number | null;
  stock: number | null;
  imageUrl: string | null;
  rare: boolean;
};