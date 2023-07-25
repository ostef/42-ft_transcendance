import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from "@nestjs/core";

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard("42") {
    constructor (private reflector: Reflector)
    {
        super ();
    }

}
