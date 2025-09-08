


import { IJudge0Service } from '../../interfaces/IJudge0Service';
import { RunCodeDto, RunCodeResponseDto } from '../../dto/submissions/RunCodeDto';

export class RunCodeUseCase {

  constructor(private judge0Service: IJudge0Service) {}

  async execute(runCodeDto: RunCodeDto): Promise<RunCodeResponseDto> {
    
    try {
      // Submit code for execution
      const judge0Response = await this.judge0Service.submitCode({
        source_code: runCodeDto.sourceCode,
        language_id: runCodeDto.languageId,
        stdin: runCodeDto.stdin,
        cpu_time_limit: runCodeDto.timeLimit || 5,
        memory_limit: runCodeDto.memoryLimit || 128000
      });

      // Poll for result (in production, use webhooks or background jobs)
      let result = await this.judge0Service.getSubmissionResult(judge0Response.token);
      
      // Simple polling mechanism (replace with proper queue system in production)
      let attempts = 0;
      while (result.status.id <= 2 && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = await this.judge0Service.getSubmissionResult(judge0Response.token);
        attempts++;
      }

      return {
        output: result.stdout,
        error: result.stderr || result.compile_output,
        executionTime: result.time ? parseFloat(result.time) : undefined,
        memoryUsage: result.memory,
        status: result.status.description,
        compileOutput: result.compile_output,
        verdict: this.getVerdict(result.status.id)
      };
    } catch (error) {
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  private getVerdict(statusId: number): string {
    const verdictMapping = {
      3: 'Accepted',
      4: 'Wrong Answer',
      5: 'Time Limit Exceeded',
      6: 'Compilation Error'
    };
    return verdictMapping[statusId] || 'Runtime Error';
  }
}
