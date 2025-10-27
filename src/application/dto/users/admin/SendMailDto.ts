export interface SendMailRequestDto {
  subject: string;
  message: string;
}

export interface SendMailResponseDto {
  success: boolean;
  message: string;
}

