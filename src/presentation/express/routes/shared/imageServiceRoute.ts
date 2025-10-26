import { Router } from "express";
import { authenticate } from "../../middlewares";
import { expressAdapter } from "../../../adaptors/ExpressAdaptor";
import { container } from "../../../../infrastructure/config/container";
import { ImageServiceController } from "../../../http/controllers/shared/ImageServiceController";

const router = Router()

const imageServiceController = container.resolve(ImageServiceController);

router.post('/upload-url/:type', authenticate, expressAdapter(imageServiceController.generateUploadUrl));
router.post('/confirm-upload', authenticate, expressAdapter(imageServiceController.confirmUpload));


export default router