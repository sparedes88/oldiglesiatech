import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EventsService } from 'src/app/events.service';
import { ToastType } from 'src/app/login/ToastTypes';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-event-form-v2',
  templateUrl: './event-form-v2.component.html',
  styleUrls: ['./event-form-v2.component.scss']
})
export class EventFormV2Component implements OnInit {

  main_form: FormGroup = this.form_builder.group({
    step_1_form: new FormGroup({
      title: new FormControl('', [Validators.required]),
      language: new FormControl('', [Validators.required]),
      timezone: new FormControl('', [Validators.required]),
      is_unique: new FormControl(undefined, [Validators.required]),
      is_location_virtual: new FormControl(undefined, [Validators.required]),
      fill: new FormControl(false)
    }),
    step_2_form: new FormGroup({
      fill: new FormControl(false)
    }),
    step_3_form: new FormGroup({
      fill: new FormControl(false)
    }),
    step_4_form: new FormGroup({
      fill: new FormControl(false)
    }),
  });

  get step_1() {
    return this.main_form.get('step_1_form') as FormGroup;
  }
  get step_2() {
    return this.main_form.get('step_2_form') as FormGroup;
  }
  get step_3() {
    return this.main_form.get('step_3_form') as FormGroup;
  }
  get step_4() {
    return this.main_form.get('step_4_form') as FormGroup;
  }

  get details_ready() {
    return this.step_1.get('fill').value && this.step_1.valid;
  }

  get register_ready() {
    return this.details_ready && this.step_2.get('fill').value && this.step_2.valid;
  }

  get publish_ready() {
    return this.register_ready && this.step_3.get('fill').value && this.step_3.valid;
  }

  constructor(
    private form_builder: FormBuilder,
    private events_service: EventsService
  ) { }

  ngOnInit() {

    console.log(moment.tz);
    console.log(moment.tz.countries());
    console.log(moment.tz.names());
    console.log(moment.tz.zonesForCountry('MX'));
    console.log(moment.tz.zone('America/Tijuana'))
    console.log(moment.tz('America/Tijuana').format('Z'));
    console.log(moment.tz('America/Tijuana').format('ZZ'));
    console.log(moment.tz('America/Tijuana').format('z'));
    console.log(moment.tz('America/Tijuana').format('zz'));

  }

  submit() {
    if (this.main_form.invalid) {
      this.events_service.api.showToast(`Please fill the form correctly.`, ToastType.error);
      return;
    } else {

    }
  }

}
