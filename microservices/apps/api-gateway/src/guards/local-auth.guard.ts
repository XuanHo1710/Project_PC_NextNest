import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


// Mot se co google, discord, facebook do thi lam o day....
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') { }