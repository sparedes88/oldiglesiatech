import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportPdfComponent } from './report-pdf.component';


const routes: Routes = [
  {
    path: '',
    component: ReportPdfComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportPdfRoutingModule { }
