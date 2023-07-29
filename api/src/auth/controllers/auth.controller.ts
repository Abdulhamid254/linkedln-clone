import { Body, Controller, Post } from '@nestjs/common';

import { Observable, map } from 'rxjs';
import { User } from '../models/user.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // registering the user
  @Post('register')
  register(@Body() user: User): Observable<User> {
    return this.authService.registerAccount(user);
  }
  // pipe operator below is because we want to change the asynchronous observable to non asynchronous so as to acess jwt key and value pair
  // map operator helps us return non-asymchronous data
  //login in the user
  @Post('login')
  login(@Body() user: User): Observable<{ token: string }> {
    return this.authService
      .login(user)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }
}
