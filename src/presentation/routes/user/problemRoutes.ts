
import { Router } from "express";

import { UserProblemController } from "../../controllers/users/problems/UserProblemController";
import { GetProblemByIdUseCase } from "../../../application/usecases/problems/GetProblemByIdUseCase";
import { GetProblemsListUseCase } from "../../../application/usecases/problems/GetProblemsListUseCase";
import { MongoProblemRepository } from "../../../infrastructure/db/MongoProblemRepository";

const router = Router()

const mongoProblemRepository = new MongoProblemRepository()

// const getProblemByIdUseCase = new GetProblemByIdUseCase(mongoProblemRepository)
const getProblemsListUseCase = new GetProblemsListUseCase(mongoProblemRepository)

const userProblemController = new UserProblemController(getProblemsListUseCase)

router.get("/get-problems", (req, res) => userProblemController.getProblemsWithFilters(req,res))


export default router