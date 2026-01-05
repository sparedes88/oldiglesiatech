import { User } from './../interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuperUserOnlyGuard implements CanActivate {

  private currentUser: User;

  constructor(
    private userService: UserService,
    private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.currentUser = this.userService.getCurrentUser();
    if (this.currentUser.isSuperUser) {
      return true;
    }
    if (this.currentUser.idUserType === 2) {
      this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
    } else {
      this.router.navigate(['home']);
    }
    return false;
  }



}
