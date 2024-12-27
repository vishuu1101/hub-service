import { Injectable } from '@nestjs/common';
import { ResponseDTO } from 'src/dto/response.dto';

@Injectable()
export class ResponseUtil {
  successResponse<T>(code: number, data: T): ResponseDTO<T> {
    return new ResponseDTO<T>(code, 'SUCCESS', data);
  }
}
