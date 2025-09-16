

import cron from "node-cron";
import { ContestTimerService } from "../../application/services/ContestTimerService";

export class ContestCron {
    constructor(
        private timerService: ContestTimerService
    ) { }


    start() {

        cron.schedule("*/10 * * * * *", async () => {
            try {
                await this.timerService.updateContestStatuses();
                
            } catch (err) {
                console.error("[Cron Error] Failed to update contest statuses:", err);
            }
        });
    }
}
