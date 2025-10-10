// import express from 'express';
// import { PaymentController } from '';
// import { authMiddleware } from '../../middleware/authMiddleware';

// // Dependencies
// import { RazorpayService } from '';
// import { MongoPaymentRepository } from '';
// import { MongoUserProfileRepository } from '../../../infrastructure/db/MongoUserProfileRepository';
// import { MongoCoinTransactionRepository } from '../../../infrastructure/db/MongoCoinTransactionRepository';
// import { CreatePaymentOrderUseCase } from '';
// import { VerifyPaymentUseCase } from '../../../application/usecases/coins/VerifyPaymentUseCase';

// const router = express.Router();

// // Repository instances
// const razorpayService = new RazorpayService();
// const paymentRepository = new MongoPaymentRepository();
// const userProfileRepository = new MongoUserProfileRepository();
// const coinTransactionRepository = new MongoCoinTransactionRepository();

// // Use case instances
// const createPaymentOrderUseCase = new CreatePaymentOrderUseCase(razorpayService, paymentRepository);
// const verifyPaymentUseCase = new VerifyPaymentUseCase(
//     razorpayService,
//     paymentRepository,
//     userProfileRepository,
//     coinTransactionRepository
// );

// // Controller instance
// const paymentController = new PaymentController(createPaymentOrderUseCase, verifyPaymentUseCase);

// // Routes
// router.post('/create-order', authMiddleware, paymentController.createOrder);
// router.post('/verify', authMiddleware, paymentController.verifyPayment);

// export default router;
