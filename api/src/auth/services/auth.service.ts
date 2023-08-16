import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { FindOneOptions, Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.interface';
// import { User } from '../models/user.class';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 12));
  }

  registerAccount(user: User): Observable<User> {
    const { firstName, lastName, email, password } = user;
    // switchMap we use it to transform the observable hash pwd which is of type string to a new observableq
    return this.hashPassword(password).pipe(
      switchMap((hashedPassword: string) => {
        return from(
          this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashedPassword,
          }),
        ).pipe(
          // map helps us return non asynchronous data eh objects strings arrays etc...delete here is becoz we dont want our user object to have a password
          map((user: User) => {
            delete user.password;
            return user;
          }),
        );
      }),
    );
  }

  // validating user & jwt
  // select enabls us to select everything we get back from the user table except for the logs
  validateUser(email: string, password: string): Observable<User> {
    // const userRepository = getRepository(UserEntity);

    const options: FindOneOptions<UserEntity> = {
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
      // exclude: ['logs'], // Exclude the 'logs' column from the query result
    };
    return from(this.userRepository.findOne(options)).pipe(
      // comparing the initial password with hashed password
      // we want to return a user bt we check if password is correct first
      switchMap((user: User) => {
        if (!user) {
          throw new HttpException(
            { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
            HttpStatus.FORBIDDEN,
          );
        }
        return from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              // delete function here is bcoz we want to not get user password in the user object for safety
              delete user.password;
              return user;
            }
          }),
        );
      }),
    );
  }

  // loggin user
  login(user: User): Observable<string> {
    const { email, password } = user;
    // before we make the request we want to validate user
    return this.validateUser(email, password).pipe(
      switchMap((user: User) => {
        if (user) {
          // create JWT - credentials
          // return a promise then we wrap it inside from to change it to an observable
          return from(this.jwtService.signAsync({ user }));
        } else {
          throw new HttpException(
            { status: HttpStatus.NOT_FOUND, error: 'User Not Found' },
            HttpStatus.NOT_FOUND,
          );
        }
      }),
    );
  }

  getJwtUser(jwt: string): Observable<User | null> {
    return from(this.jwtService.verifyAsync(jwt)).pipe(
      map(({ user }: { user: User }) => {
        return user;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }

  // finding the user by Id
  findUserById(id: number): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: { id },
        relations: ['feedPosts'],
      }),
    ).pipe(
      map((user: User) => {
        delete user.password;
        return user;
      }),
    );
  }
}
