import { Router } from "express";

import { getAllPlantsController, getPlantController, createPlantController, deletePlantController, updatePlantController, getRarePlantsController } from "../index";
import { authenticate, requireAdmin, validateId } from "../middlewares";

export const router = Router();

router.get("/plants", getAllPlantsController);
router.get("/plants/rare", getRarePlantsController);

router.post("/plants", authenticate, requireAdmin, createPlantController);

router.get("/plants/:id", validateId("id", "plant"), getPlantController);

router.patch("/plants/:id", authenticate, requireAdmin, validateId("id", "plant"), updatePlantController);
router.delete("/plants/:id", authenticate, requireAdmin, validateId("id", "plant"), deletePlantController);