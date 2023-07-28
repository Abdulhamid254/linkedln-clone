/* eslint-disable prettier/prettier */
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationParameters {
  @IsOptional()
  @IsNumber() // value by default is a string we transform it into a number
  @Transform(({ value }) => Number.parseInt(value))
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  skip?: number;
}
