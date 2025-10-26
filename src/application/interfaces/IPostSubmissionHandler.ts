export interface PostSubmissionData {
    userId: string;
    problemId: string;
    submissionId: string;
    isAccepted: boolean;
    languageId: number;
    executionTime?: number;
    submissionType: 'problem' | 'contest';
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface IPostSubmissionHandler {
    handleSubmission(data: PostSubmissionData): Promise<void>;
    handleFailedSubmission(data: PostSubmissionData): Promise<void>;
}
