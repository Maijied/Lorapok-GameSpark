import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gamesRouter from "./games";
import scoresRouter from "./scores";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gamesRouter);
router.use(scoresRouter);

export default router;
