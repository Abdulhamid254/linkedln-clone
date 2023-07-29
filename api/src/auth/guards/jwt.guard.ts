import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// this passport auth guard needs authstrategy
// we are using guard provided by passport of type jwt
export class JwtGuard extends AuthGuard('jwt') {}
