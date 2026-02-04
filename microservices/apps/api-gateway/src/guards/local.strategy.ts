// import { Strategy } from 'passport-local';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//     constructor(
//         private authService: AuthService
//     ) {
//         super({
//             usernameField: 'IDEmp', // <-- Quan trọng
//             passwordField: 'password'
//         });
//     }

//     async validate(IDEmp: string, password: string): Promise<AccountEmployee> {
//         const account = await this.authService.signIn(IDEmp, password);
//         if (!account) {
//             throw new UnauthorizedException("Wrong ID Employee or Password");
//         }
//         return account;
//     }
// }
