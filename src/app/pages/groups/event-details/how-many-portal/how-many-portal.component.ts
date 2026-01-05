import { FormGroup } from '@angular/forms';
import { User } from './../../../../interfaces/user';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { GroupEventModel } from 'src/app/models/GroupModel';

@Component({
  selector: 'app-how-many-portal',
  templateUrl: './how-many-portal.component.html',
  styleUrls: ['./how-many-portal.component.scss']
})
export class HowManyPortalComponent implements OnInit {

  @Input() currentUser: User;
  @Input() group_event: GroupEventModel;
  @Input() full_form: FormGroup;
  @Input() additional_form: FormGroup;

  @Output() cancel_login = new EventEmitter();
  @Output() accept_response = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  addQuantity(qty: number) {
    const original_qty = this.additional_form.get('guests').value;
    this.additional_form.get('guests').setValue(original_qty + qty);
  }

  toggleAcceptace(form_group: FormGroup, field: string) {
    const actual_value = form_group.get(field).value;
    form_group.get(field).setValue(!actual_value);
  }

  acceptInvitation() {
    if (this.additional_form.valid) {
      const additional_form_value = this.additional_form.value;
      this.accept_response.emit(additional_form_value);
    }
  }

}
