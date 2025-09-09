
import { Router } from "express";

import { UserProblemController } from "../..***REMOVED***ontroller";
import { GetProblemsListUseCase } from "../../..***REMOVED***msListUseCase";
import { MongoProblemRepository } from "../../..***REMOVED***y";
import { ProblemSolvingController } from '../..***REMOVED***ngController';
import { GetProblemByIdUseCase } from "../../..***REMOVED***mByIdUseCase";
import { Judge0Service } from "../../../infrastructure/services/Judge0Service";
import { MongoSubmissionRepository } from "../../..***REMOVED***tory";
import { CreateSubmissionUseCase } from "../../..***REMOVED***SubmissionUseCase";
import { GetSubmissionResultUseCase } from "../../..***REMOVED***missionResultUseCase";
import { RunCodeUseCase } from "../../..***REMOVED***eUseCase";
import { GetLanguagesUseCase } from "../../..***REMOVED***guagesUseCase";
import { MongoTestCaseRepository } from "../../..***REMOVED***ry";
import { authMiddleware } from "../../middleware/authMiddleware";
import { CodeExecutionHelperService } from "../../..***REMOVED***rService";

const router = Router()



const mongoProblemRepository = new MongoProblemRepository()

const mongoTestCaseRepository = new MongoTestCaseRepository()

const getProblemByIdUseCase = new GetProblemByIdUseCase(mongoProblemRepository, mongoTestCaseRepository)

const getProblemsListUseCase = new GetProblemsListUseCase(mongoProblemRepository)

const userProblemController = new UserProblemController(getProblemsListUseCase, getProblemByIdUseCase)



const judge0Service = new Judge0Service();
const submissionRepository = new MongoSubmissionRepository();
const problemRepository = new MongoProblemRepository();
const codeExecutionHelperService = new CodeExecutionHelperService(judge0Service)

const createSubmissionUseCase = new CreateSubmissionUseCase(judge0Service, submissionRepository, problemRepository, mongoTestCaseRepository, codeExecutionHelperService);
const getSubmissionResultUseCase = new GetSubmissionResultUseCase(judge0Service, submissionRepository);
const runCodeUseCase = new RunCodeUseCase(judge0Service, problemRepository, mongoTestCaseRepository, codeExecutionHelperService,);
const getLanguagesUseCase = new GetLanguagesUseCase(judge0Service);
const problemSolvingController = new ProblemSolvingController(createSubmissionUseCase, getSubmissionResultUseCase, runCodeUseCase, getLanguagesUseCase);


// app.use(authMiddleware())

router.get("/get-problems", authMiddleware(), (req, res) => userProblemController.getProblemsWithFilters(req, res))

router.get('/:problemId/detail', authMiddleware(), (req, res) => userProblemController.getProblemDetail(req, res));

router.post('/test-case', authMiddleware(), (req, res) => problemSolvingController.runTestCase(req, res))

router.post('/submit', authMiddleware(), (req, res) => problemSolvingController.submitSolution(req, res));




router.get('/submissions/:submissionId', problemSolvingController.getSubmissionResult.bind(problemSolvingController));

router.get('/languages', problemSolvingController.getLanguages.bind(problemSolvingController));



export default router