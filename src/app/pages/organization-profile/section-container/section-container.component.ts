import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-section-container',
  templateUrl: './section-container.component.html',
  styleUrls: ['./section-container.component.scss']
})
export class SectionContainerComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('iglesia') iglesia: any;
  @Input('containers') containers: any[] = [];
  @Input('init') init: boolean = false;
  @Input('selected_category_on_main') selected_category_on_main: any[] = [];
  @Input('grid_template_form') grid_template_form: FormGroup;

  @Output('refresh_meetings') refresh_meetings: EventEmitter<any> = new EventEmitter<any>();


  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    if (this.init) {
      this.api.get(`iglesias/profile/${(this.idOrganization)}`)
        .subscribe((data: any) => {
          console.log(data.profile);
          this.containers = data.profile.containers;
        });
    }
  }

}
