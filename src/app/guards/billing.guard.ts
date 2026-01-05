import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {UserService} from '../services/user.service';

@Injectable({providedIn: 'root'})
export class BillingAuthGuard implements CanActivate {


  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)  {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      // authorised so return
      return true;
    }

    // not logged in so redirect to login pages with the return url
    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
