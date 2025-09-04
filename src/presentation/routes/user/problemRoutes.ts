
import { Router } from "express";

import { UserProblemController } from "../..***REMOVED***ontroller";
import { GetProblemsListUseCase } from "../../..***REMOVED***msListUseCase";
import { MongoProblemRepository } from "../../..***REMOVED***y";
import { ProblemSolvingController } from '../..***REMOVED***ngController';
import { GetProblemByIdUseCase } from "../../..***REMOVED***mByIdUseCase";
import { Judge0Service } from "../../../infrastructure/services/Judge0Service";
import { MongoSubmissionRepository } from "../../..***REMOVED***tory";
import { ExecuteCodeUseCase } from "../../..***REMOVED***eCodeUseCase";
import { GetSubmissionResultUseCase } from "../../..***REMOVED***missionResultUseCase";
import { RunCodeUseCase } from "../../..***REMOVED***eUseCase";
import { GetLanguagesUseCase } from "../../..***REMOVED***guagesUseCase";

import { authMiddleware } from "../../middleware/authMiddleware";
import { app } from "../../../app";


const router = Router()



const mongoProblemRepository = new MongoProblemRepository()

const getProblemByIdUseCase = new GetProblemByIdUseCase(mongoProblemRepository)

const getProblemsListUseCase = new GetProblemsListUseCase(mongoProblemRepository)

const userProblemController = new UserProblemController(getProblemsListUseCase, getProblemByIdUseCase)






// Initialize dependencies (in production, use a DI container)
const judge0Service = new Judge0Service();
const submissionRepository = new MongoSubmissionRepository();
const problemRepository = new MongoProblemRepository();

const executeCodeUseCase = new ExecuteCodeUseCase(judge0Service, submissionRepository, problemRepository);
const getSubmissionResultUseCase = new GetSubmissionResultUseCase(judge0Service, submissionRepository);
const runCodeUseCase = new RunCodeUseCase(judge0Service);
const getLanguagesUseCase = new GetLanguagesUseCase(judge0Service);


const problemSolvingController = new ProblemSolvingController(
    executeCodeUseCase,
    getSubmissionResultUseCase,
    runCodeUseCase,
    getLanguagesUseCase
);


// app.use(authMiddleware())

router.get("/get-problems", authMiddleware(), (req, res) => userProblemController.getProblemsWithFilters(req, res))

router.get('/:problemId/detail', authMiddleware(),(req, res) => userProblemController.getProblemDetail(req, res));


// router.post('/submit', problemSolvingController.submitSolution.bind(problemSolvingController));

router.post('/submit',authMiddleware(), (req, res) => problemSolvingController.submitSolution(req, res));




router.get('/submissions/:submissionId', problemSolvingController.getSubmissionResult.bind(problemSolvingController));

router.post('/run', problemSolvingController.runCode.bind(problemSolvingController));
router.get('/languages', problemSolvingController.getLanguages.bind(problemSolvingController));



export default router