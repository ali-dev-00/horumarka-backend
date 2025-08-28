import { ApiProperty } from '@nestjs/swagger';

export class ServerResponse<T> {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  data: T | null;
}