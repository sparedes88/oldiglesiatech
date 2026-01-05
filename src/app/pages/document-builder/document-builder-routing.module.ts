import { DocumentBuilderPreviewComponent } from './document-builder-preview/document-builder-preview.component';
import { DocumentBuilderFormComponent } from './document-builder-form/document-builder-form.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentBuilderHomeComponent } from './document-builder-home/document-builder-home.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentBuilderHomeComponent
  }, 
  {
    path: 'create',
    component: DocumentBuilderFormComponent
  },
  {
    path: 'update/:document_id',
    component: DocumentBuilderFormComponent
  },
  {
    path: 'detail/:document_id',
    component: DocumentBuilderPreviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentBuilderRoutingModule { }
