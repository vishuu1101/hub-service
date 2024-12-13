import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name);

    signIn(emailId: string, password: string): string{
        this.logger.log("allowing Email:"+emailId);
        return "success"
    }
}
