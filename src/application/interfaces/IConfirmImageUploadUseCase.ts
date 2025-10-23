export interface IConfirmImageUploadUseCase {
    execute(userId: string, imageKey: string, publicUrl: string, imageType: string): Promise<void>;
}
