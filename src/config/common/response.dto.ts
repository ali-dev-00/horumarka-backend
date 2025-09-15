import { ApiProperty } from '@nestjs/swagger';

export class ServerResponse<T> {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;
  data: T | null;

  @ApiProperty({ required: false, example: { page: 1, limit: 10, total: 42 } })
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}