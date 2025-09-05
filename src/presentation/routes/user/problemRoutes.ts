
import { Router } from "express";

import { UserProblemController } from "../../controllers/users/problems/UserProblemController";
import { GetProblemsListUseCase } from "../../../application/usecases/problems/GetProblemsListUseCase";
import { MongoProblemRepository } from "../../../infrastructure/db/MongoProblemRepository";
import { ProblemSolvingController } from '../../controllers/users/problems/ProblemSolvingController';
import { GetProblemByIdUseCase } from "../../../application/usecases/problems/GetProblemByIdUseCase";
import { Judge0Service } from "../../../infrastructure/services/Judge0Service";
import { MongoSubmissionRepository } from "../../../infrastructure/db/MongoSubmissionRepository";
import { ExecuteCodeUseCase } from "../../../application/usecases/submissions/ExecuteCodeUseCase";
import { GetSubmissionResultUseCase } from "../../../application/usecases/submissions/GetSubmissionResultUseCase";
import { RunCodeUseCase } from "../../../application/usecases/submissions/RunCodeUseCase";
import { GetLanguagesUseCase } from "../../../application/usecases/submissions/GetLanguagesUseCase";
import { MongoTestCaseRepository } from "../../../infrastructure/db/MongoTestCaseRepository";
import { authMiddleware } from "../../middleware/authMiddleware";


const router = Router()



const mongoProblemRepository = new MongoProblemRepository()

const mongoTestCaseRepository = new MongoTestCaseRepository()

const getProblemByIdUseCase = new GetProblemByIdUseCase(mongoProblemRepository, mongoTestCaseRepository)

const getProblemsListUseCase = new GetProblemsListUseCase(mongoProblemRepository)

const userProblemController = new UserProblemController(getProblemsListUseCase, getProblemByIdUseCase)






// Initialize dependencies (in production, use a DI container)
const judge0Service = new Judge0Service();
const submissionRepository = new MongoSubmissionRepository();
const problemRepository = new MongoProblemRepository();

const executeCodeUseCase = new ExecuteCodeUseCase(judge0Service, submissionRepository, problemRepository, mongoTestCaseRepository);
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

router.get('/:problemId/detail', authMiddleware(), (req, res) => userProblemController.getProblemDetail(req, res));


// router.post('/submit', problemSolvingController.submitSolution.bind(problemSolvingController));

router.post('/submit', authMiddleware(), (req, res) => problemSolvingController.submitSolution(req, res));




router.get('/submissions/:submissionId', problemSolvingController.getSubmissionResult.bind(problemSolvingController));

router.post('/run', problemSolvingController.runCode.bind(problemSolvingController));
router.get('/languages', problemSolvingController.getLanguages.bind(problemSolvingController));



export default router