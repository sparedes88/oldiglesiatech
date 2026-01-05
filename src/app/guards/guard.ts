import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  free_version: boolean = true;
  is_possible_client: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    var currentUser = this.userService.getCurrentUser();
    console.log(currentUser);

    if (currentUser) {
      if (currentUser.is_valid == undefined) {
        await this.userService.getExpiration()
        currentUser = this.userService.getCurrentUser()
        console.log('You are here');
        console.log(currentUser);

      }
      // authorised so return
      if (currentUser.is_valid == true) {

        if (currentUser.isSuperUser) {
          return true;
        }
        await this.verifyOrganization();
        console.log(this.free_version);
        console.log(state.url);
        if (this.free_version) {

          if (state.url.startsWith('/user-profile/details/')) {
            return true;
          } else if (state.url.startsWith('/dashboard') && this.is_possible_client){
            return true;
          } else if(this.is_possible_client) {
            // this.router.navigate([`/register/${currentUser.idIglesia}/disclaimer`]);
            this.router.navigate([`/dashboard`]);
            return false;
          }
          return false;
        }
        return true;
      } else {
        if (currentUser.is_valid == false) {
          this.router.navigate([`/billing`]);
          return false;
        }
      }
    }

    // not logged in so redirect to login pages with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  async verifyOrganization() {
    const currentUser = this.userService.getCurrentUser();
    const response: any = await this.userService.api.get(`iglesias/getIglesiaProfileDetail`, { idIglesia: currentUser.idIglesia }).toPromise();
    console.log(response);

    this.free_version = response.iglesia.free_version;
    this.is_possible_client = response.iglesia.is_possible_client;
  }
}
