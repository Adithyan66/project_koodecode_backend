
import { Router } from "express";

import { UserProblemController } from "../..***REMOVED***ontroller";
import { GetProblemByIdUseCase } from "../../..***REMOVED***mByIdUseCase";
import { GetProblemsListUseCase } from "../../..***REMOVED***msListUseCase";
import { MongoProblemRepository } from "../../..***REMOVED***y";

const router = Router()

const mongoProblemRepository = new MongoProblemRepository()

// const getProblemByIdUseCase = new GetProblemByIdUseCase(mongoProblemRepository)
const getProblemsListUseCase = new GetProblemsListUseCase(mongoProblemRepository)

const userProblemController = new UserProblemController(getProblemsListUseCase)

router.get("/get-problems", (req, res) => userProblemController.getProblemsWithFilters(req,res))


export default router