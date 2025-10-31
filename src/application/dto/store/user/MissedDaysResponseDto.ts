export class MissedDaysResponseDto {
    public missedDays: string[];
    public currentMonth: string;
    public canUseTicket: boolean;

    constructor({
        missedDays,
        currentMonth,
        canUseTicket
    }: {
        missedDays: string[];
        currentMonth: string;
        canUseTicket: boolean;
    }) {
        this.missedDays = missedDays;
        this.currentMonth = currentMonth;
        this.canUseTicket = canUseTicket;
    }
}

