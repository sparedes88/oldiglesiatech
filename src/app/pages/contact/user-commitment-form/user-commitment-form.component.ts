import { UserCommitmentsManageModel } from './../../../models/UserLogModel';
import { GroupsService } from 'src/app/services/groups.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserCommitmentsModel } from 'src/app/models/UserLogModel';
import { Observable } from 'rxjs';
import { FrequencyModel } from 'src/app/models/GroupModel';
import * as moment from 'moment';

@Component({
  selector: 'app-user-commitment-form',
  templateUrl: './user-commitment-form.component.html',
  styleUrls: ['./user-commitment-form.component.scss']
})
export class UserCommitmentFormComponent implements OnInit {

  @Output('onDismiss') onDismiss = new EventEmitter();
  @Input() member: User;

  currentUser: User;
  // basicInfoForm: FormGroup;
  selected_frequency: FrequencyModel;
  commitment: UserCommitmentsManageModel;
  serverBusy: boolean = false;
  frequencies: FrequencyModel[] = [];

  public eventFormGroup: FormGroup = this.formBuilder.group({
    // idGroupEvent: [''],
    // idGroup: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    idFrequency: new FormControl(0, [
      Validators.required,
      Validators.pattern(/[^0]+/),
      Validators.min(0)
    ]),
    // event_as_range: [false],
    commitment_date: [undefined],
    repeat_until_date: [undefined],
    days: this.formBuilder.array([]),
    created_by: [''],
    is_exact_date: []
  });

  dias_form = [
    {
      id: 1,
      name: 'dia_lunes'
    },
    {
      id: 2,
      name: 'dia_martes'
    },
    {
      id: 3,
      name: 'dia_miercoles'
    },
    {
      id: 4,
      name: 'dia_jueves'
    },
    {
      id: 5,
      name: 'dia_viernes'
    },
    {
      id: 6,
      name: 'dia_sabado'
    },
    {
      id: 7,
      name: 'dia_domingo'
    }
  ];

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private groupService: GroupsService
  ) {
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.initForm();
  }

  initForm() {
    this.eventFormGroup = this.formBuilder.group({
      // idGroupEvent: [''],
      // idGroup: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      idFrequency: new FormControl(0, [
        Validators.required,
        Validators.pattern(/[^0]+/),
        Validators.min(0)
      ]),
      // event_as_range: [false],
      commitment_date: [undefined],
      repeat_until_date: [undefined],
      created_by: [''],
      is_exact_date: []
    });
    if (this.commitment) {
      this.eventFormGroup.addControl('idUserCommitmentManage', new FormControl(this.commitment.idUserCommitmentManage,
        [
          Validators.required
        ]));

      this.eventFormGroup.patchValue(this.commitment);
      this.onSelectFrequency();
      if (!this.selected_frequency.is_exact_date) {
        const current_until = moment(this.commitment.commitment_date).utc().format('YYYY-MM-DD');
        this.eventFormGroup.get('commitment_date').setValue(current_until);
        const repeat_until = moment(this.commitment.repeat_until_date).utc().format('YYYY-MM-DD');
        this.eventFormGroup.get('repeat_until_date').setValue(repeat_until);
        // this.eventFormGroup.get('repeat_until_date').setValue(this.commitment.repeat_until_date);
      }
    }
  }

  dismiss(response?: any) {
    this.commitment = undefined;
    this.initForm();
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
  }

  submitLog() {
    this.serverBusy = true;
    const payload: UserCommitmentsManageModel = this.eventFormGroup.value;
    let subscription: Observable<any>;
    let success_message: string;
    let error_message: string;

    payload.quantity = this.selected_frequency.quantity;
    payload.segment = this.selected_frequency.segment;
    // payload.id = this.selected_frequency.segment;
    payload.created_by = this.currentUser.idUsuario;
    payload.idUserOrganization = this.member.idUserOrganization;
    if (payload.idUserCommitmentManage) {
      // update
      subscription = this.userService.updateUserCommitment(payload);
      success_message = `Commitment updated successfully.`;
      error_message = `Error updating commitment.`;
    } else {
      // add
      subscription = this.userService.addUserCommitment(payload);
      success_message = `Commitment added successfully.`;
      error_message = `Error adding commitment.`;
    }

    subscription.subscribe(response => {
      this.userService.api.showToast(`${success_message}`, ToastType.success);
      this.dismiss(response);
      this.serverBusy = false;
    }, error => {
      console.error(error);
      this.userService.api.showToast(`${error_message}`, ToastType.error);
      this.serverBusy = false;
    });
  }

  onSelectFrequency() {
    const id_temp = +this.eventFormGroup.get('idFrequency').value;
    if (id_temp === 0) {
      // if (this.dias.length > 0) {
      //   const confirmation = confirm(`You add some days and these will be loose. Are you sure to continue?`);
      //   if (!confirmation) {
      //     this.eventFormGroup.get('idFrequency').setValue(this.selected_frequency.id);
      //     return;
      //   }
      //   this.dias = [];
      //   this.eventFormGroup.get('idFrequency').setValue(id_temp);
      //   this.days_on_form.controls.forEach(control => {
      //     const index = this.days_on_form.controls.indexOf(control);
      //     this.days_on_form.removeAt(index);
      //   });
      // } else {
      //   this.selected_frequency = undefined;
      // }
      return;
    }
    const freq_temp = this.frequencies.find(x => x.id === id_temp);
    // if (freq_temp.is_exact_date && this.dias.length > 0) {
    //   const confirmation = confirm(`You add some days and these will be loose. Are you sure to continue?`);
    //   if (!confirmation) {
    //     this.eventFormGroup.get('idFrequency').setValue(this.selected_frequency.id);
    //     return;
    //   }
    // }
    const idFrequency = +this.eventFormGroup.get('idFrequency').value;
    this.selected_frequency = this.frequencies.find(x => x.id === idFrequency);

    if (this.selected_frequency.is_exact_date) {
      // this.dias = [];
      this.eventFormGroup.get('repeat_until_date').setValue(undefined);
      this.eventFormGroup.get('repeat_until_date').setValidators([Validators.required]);

      // const is_range = this.eventFormGroup.get('event_as_range').value;
      // Clear event_start_date and end
      // this.eventFormGroup.addControl('commitment_date', new FormControl('', Validators.required));

    } else {
      this.eventFormGroup.get('repeat_until_date').setValidators([]);
      // this.eventFormGroup.removeControl('commitment_date');
    }
  }

  loadFrequencies() {
    return new Promise((resolve, reject) => {
      this.groupService.getFrequencies()
        .subscribe((data: any) => {
          this.frequencies = data.frecuencias_v2;
          // if (!this.show_groups_dropdown) {
          //   this.eventFormGroup.patchValue({ idGroup: this.group_event.idGroup });
          // }
          return resolve(true);
        }, error => {
          console.error(error);
          return reject(false);
        });
    });
  }

}
