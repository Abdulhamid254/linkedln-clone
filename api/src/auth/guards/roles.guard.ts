import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../models/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  // needing to access the role metadta we use a reflector
  // we want to get the required roles
  //ACCESSING THE ROLES USING THE ROLES_KEY
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      // context provides the absolute location where the guard is used and the method we are targeting
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    // when we are getting the user here is because when we login we get the jwt the jwt is needed in order to create a post and from there the jwt we are able to get whom the author of the post is
    const { user } = context.switchToHttp().getRequest();
    // check to see if the roles we passed in the controller are here if they are it returns true
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
