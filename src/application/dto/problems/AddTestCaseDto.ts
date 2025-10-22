export interface AddTestCasePayload {
  inputs: Record<string, any>;
  expectedOutput: any;
  isSample: boolean;
}
