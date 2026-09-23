import { Router } from "express";

import { getAllPlantsController, getPlantController, createPlantController, deletePlantController, updatePlantController } from "../index";
import { authenticate, validateId } from "../middlewares";

export const router = Router();

router.get("/plants", getAllPlantsController);
router.post("/plants", authenticate, createPlantController);

router.get("/plants/:id", authenticate, validateId("id", "plant"), getPlantController);

router.patch("/plants/:id", authenticate, validateId("id", "plant"), updatePlantController);
router.delete("/plants/:id", authenticate, validateId("id", "plant"), deletePlantController);