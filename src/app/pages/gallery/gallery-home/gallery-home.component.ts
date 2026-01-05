import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-gallery-home',
  templateUrl: `./gallery-home.component.html`,
  styleUrls: ['./gallery-home.component.scss']
})
export class GalleryHomeComponent implements OnInit {

  supported_params = [
    { index: 0, key: 'galleries' },
    { index: 1, key: 'albums' }
  ]
  view: 'galleries' | 'albums' = 'galleries';
  current_user: User;

  constructor(
    private router: Router,
    private activated_route: ActivatedRoute,
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
    const view_param = this.activated_route.snapshot.queryParams['tab'];
    if (view_param) {
      if (this.supported_params.find(x => x.key === view_param)) {
        this.view = view_param;
      }
    }
  }

  get index() {
    return this.supported_params.find(x => x.key === this.view) ? this.supported_params.find(x => x.key === this.view).index : 0;
  }

  ngOnInit() {
  }

  changedTab(event) {
    const key = this.supported_params.find(x => x.index == event.index);
    if (key) {
      this.view = key.key as any;
      const params = { tab: key.key };
      this.router.navigate([], {
        relativeTo: this.activated_route,
        queryParams: params
      });
    }
  }

}
