import { ToastType } from './../login/ToastTypes';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AdminOnlyGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
    private organizationService: OrganizationService) {
  }

  private currentUser: User;
  private allowedTypes: any[] = [1];

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.currentUser = this.userService.getCurrentUser();
    if (!this.currentUser.idIglesia) {
      setTimeout(() => {
        this.organizationService.api.showToast(`You need to select an organization, first. Please go to settings > Organizations and select one organization`, ToastType.info);
      });
      this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
    }
    return this.allowedTypes.includes(this.currentUser.idUserType) || this.currentUser.isSuperUser;
  }

}
