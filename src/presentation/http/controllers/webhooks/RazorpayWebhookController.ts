import { injectable, inject } from "tsyringe";
import { HttpResponse } from "../../helper/HttpResponse";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { IHandleRazorpayWebhookUseCase } from "../../../../application/interfaces/IWebhookUseCase";
import { RazorpayWebhookPayload } from "../../../../application/dto/webhooks/RazorpayWebhookDto";
import { IHttpRequest } from "../../interfaces/IHttpRequest";

@injectable()
export class RazorpayWebhookController {

    constructor(
        @inject("IHandleRazorpayWebhookUseCase") private handleWebhookUseCase: IHandleRazorpayWebhookUseCase
    ) { }

    handleWebhook = async (httpRequest: IHttpRequest) => {
        try {
            const body = httpRequest.body as RazorpayWebhookPayload;
            const signature = httpRequest.headers?.['x-razorpay-signature'] as string;

            if (!signature) {
                return new HttpResponse(HTTP_STATUS.BAD_REQUEST, {
                    ...buildResponse(false, 'Missing webhook signature')
                });
            }

            const result = await this.handleWebhookUseCase.execute(body, signature);

            return new HttpResponse(HTTP_STATUS.OK, {
                ...buildResponse(result.success, result.message)
            });

        } catch (error) {
            console.error('Webhook processing error:', error);
            
            return new HttpResponse(HTTP_STATUS.OK, {
                ...buildResponse(false, 'Webhook received but processing failed')
            });
        }
    };
}

