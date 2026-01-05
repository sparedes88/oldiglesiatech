import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicDesignDetailComponent } from './public-design-detail/public-design-detail.component';
import { PublicDesignHomeComponent } from './public-design-home/public-design-home.component';

const routes: Routes = [
  {
    path: ':idIglesia/list',
    component: PublicDesignHomeComponent
  },
  {
    path: ':idIglesia/list/detail/:id',
    component: PublicDesignDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicDesignRoutingModule { }
