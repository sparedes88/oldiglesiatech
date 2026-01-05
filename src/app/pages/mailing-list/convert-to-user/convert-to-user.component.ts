import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { UserLogModel } from 'src/app/models/UserLogModel';
import { GroupsService } from 'src/app/services/groups.service';
import { UserService } from 'src/app/services/user.service';

import { User } from './../../../interfaces/user';

@Component({
  selector: 'app-convert-to-user',
  templateUrl: './convert-to-user.component.html',
  styleUrls: ['./convert-to-user.component.scss']
})
export class ConvertToUserComponent implements OnInit {

  @Input('contact') selected_contact: any;
  @Input('mailing_list') mailing_list: any;
  @Input() currentUser: User;
  @Output() already_finished: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean = false;
  contact_form: FormGroup = this.form_builder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    last_name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    country_code: ['', [Validators.required]],
    phone: new FormControl('', [Validators.required]),
    notes: ['', [Validators.required]],
    groups: new FormGroup({
      first_row: new FormArray([]),
      second_row: new FormArray([])
    }),
    events: new FormGroup({
      first_row: new FormArray([]),
      second_row: new FormArray([])
    })
  }
  );

  groups = {
    first_row: [],
    second_row: []
  }
  events = {
    first_row: [],
    second_row: []
  }

  get groups_first_row() {
    return this.contact_form.get('groups').get('first_row') as FormArray;
  }

  get groups_second_row() {
    return this.contact_form.get('groups').get('second_row') as FormArray;
  }

  get events_first_row() {
    return this.contact_form.get('events').get('first_row') as FormArray;
  }

  get events_second_row() {
    return this.contact_form.get('events').get('second_row') as FormArray;
  }

  constructor(
    private form_builder: FormBuilder,
    private userService: UserService,
    private groupsService: GroupsService
  ) {

  }

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    console.log(this.selected_contact);
    const size = this.selected_contact.selected_groups.length / 2;
    this.groups = {
      first_row: (this.selected_contact.selected_groups as any[]).slice(0, size + 1),
      second_row: this.selected_contact.selected_groups.slice(size + 1)
    }
    const size_events = this.selected_contact.selected_events.length / 2;
    this.events = {
      first_row: (this.selected_contact.selected_events as any[]).slice(0, size_events + 1),
      second_row: this.selected_contact.selected_events.slice(size_events + 1)
    };

    console.log(this.groups);

    this.contact_form = this.form_builder.group(
      {
        name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        last_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(100)]),
        phone: new FormControl('', [Validators.required]),
        country_code: new FormControl('', [Validators.required]),
        notes: new FormControl('', [Validators.required]),
        groups: new FormGroup({
          first_row: new FormArray([]),
          second_row: new FormArray([])
        }),
        events: new FormGroup({
          first_row: new FormArray([]),
          second_row: new FormArray([])
        })
      }
    );

    if (this.selected_contact) {
      let notes = ``;
      notes = `Message: ${this.showAnswer(this.selected_contact.message, true)}`
      if (this.mailing_list.setup) {
        if (this.mailing_list.setup.display_e_group_question) {
          notes = `${notes}\n
${this.mailing_list.setup.question_1_text}:\n${this.showAnswer(this.selected_contact.question_1_answer, true)}`
        }
        if (this.mailing_list.setup.display_e_team_question) {
          notes = `${notes}\n
${this.mailing_list.setup.question_2_text}:\n${this.showAnswer(this.selected_contact.question_2_answer, true)}`
        }
        if (!this.mailing_list.setup.hide_custom_input) {
          notes = `${notes}\n
${this.mailing_list.setup.custom_text}:\n${this.selected_contact.custom_answer}`
        }
      }
      console.log(notes);
      this.selected_contact.notes = notes;
      this.selected_contact.groups = this.groups;
      console.log(this.selected_contact);

      this.contact_form.patchValue(this.selected_contact);
      console.log(this.contact_form);
      this.fillArrays();
      console.log(this.contact_form);
    }

  }

  fillArrays() {
    this.cleanArrays();
    this.groups.first_row.forEach(g => {
      this.groups_first_row.push(this.form_builder.group({
        id: [g.idGroup],
        name: [g.title],
        type: new FormControl('group'),
        checked: new FormControl(false)
      }));
    });
    this.groups.second_row.forEach(g => {
      this.groups_second_row.push(this.form_builder.group({
        id: [g.idGroup],
        name: [g.title],
        type: new FormControl('group'),
        checked: new FormControl(false)
      }));
    });
    this.events.first_row.forEach(g => {
      console.log(g);
      this.events_first_row.push(this.form_builder.group({
        id: [g.idGroupEvent],
        idGroupEvent: [g.idGroupEvent],
        name: [g.name],
        type: new FormControl('event'),
        checked: new FormControl(false),
        idGroup: [g.idGroup],
      }));
    });
    this.events.second_row.forEach(g => {
      this.events_second_row.push(this.form_builder.group({
        id: [g.idGroupEvent],
        idGroupEvent: [g.idGroupEvent],
        name: [g.name],
        type: new FormControl('event'),
        checked: new FormControl(false),
        idGroup: [g.idGroup],
      }));
    });
  }

  cleanArrays() {
    while (this.groups_first_row.controls.length > 0) {
      this.groups_first_row.removeAt(0);
    }
    while (this.groups_second_row.controls.length > 0) {
      this.groups_second_row.removeAt(0);
    }
    while (this.events_first_row.controls.length > 0) {
      this.events_first_row.removeAt(0);
    }
    while (this.events_second_row.controls.length > 0) {
      this.events_second_row.removeAt(0);
    }
  }

  showAnswer(answer, return_default?: boolean) {
    if (answer === undefined) {
      if (return_default) {
        return '--';
      }
      return;
    } else {
      if (answer) {
        if (return_default) {
          return answer;
        } else {
          return 'Yes';
        }
      } else {
        return 'No';
      }
    }
  }

  toggleAcceptace(group_name: string, array_name: string, index: number) {
    const group = this.contact_form.get(group_name);
    const array = group.get(array_name) as FormArray;
    const control = array.at(index);
    const checked = control.get('checked');
    const actual_value = checked.value;
    checked.setValue(!actual_value);
  }

  submit() {
    this.checkPhoneAndEmail('email');
  }

  checkPhoneAndEmail(type: string) {
    this.loading = true;
    let value_to_verify: string;
    if (type === 'email') {
      value_to_verify = this.contact_form.get('email').value;
    } else {
      value_to_verify = this.contact_form.get('phone').value;
    }
    const login_type = type;
    let idIglesia = this.mailing_list.idIglesia;

    this.userService.checkUserAvailable(value_to_verify, idIglesia, login_type)
      .subscribe((response: any) => {
        // this.loading = false;
        if (response.message && response.message === 'This user exists but not in your organization.') {
          this.contact_form.addControl('idUser', new FormControl(response.idUsuario));
          this.registerInOrganization()
            .then(resolve => {
              console.log(resolve);
              this.handleAfterRegister();
            })
            .catch(error => {
              console.error(error);
              this.loading = false;
            });
          return;
        }
        if (response.message && response.message === 'This user exist but was deleted.') {
          this.userService.api.showToast(`This user in this organization was deleted. Please contact the organization's admin.`, ToastType.error);
          return;
        }
        if (type === 'email') {
          this.checkPhoneAndEmail('phone');
        } else {
          this.continueWithRegister();
        }
        // this.user_status.emit('checked_ok');
      }, error => {
        console.error(error);
        // this.loading = false;
        if (!error.error.msg.Message) {
          // // this.user_status.emit('checked_not_available');
        } else {
          // // this.user_status.emit('checked_error');
        }
        this.userService.api.showToast(`An user with this ${type} already exists.`, ToastType.error);
        this.loading = false;
      });
  }

  registerInOrganization() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      const email = this.contact_form.get('email').value;
      const idIglesia = this.mailing_list.idIglesia;
      const idUserType = 2;
      const idUsuario = this.contact_form.get('idUser').value;

      const user = this.currentUser;
      let assigned_by_other = false;
      if (user.idUsuario !== 0) {
        assigned_by_other = true;
      }
      this.userService.checkUserAvailable(email, idIglesia)
        .subscribe((response: any) => {
          if (response.message) {
            if (response.message === 'This user exists but not in your organization.') {
              this.userService.registerUserInOrganization(assigned_by_other, user.idUsuario, response.idUsuario, idIglesia, idUserType)
                .subscribe(response_on_register => {
                  this.userService.api.showToast(`User added to ${this.currentUser.iglesia}.`, ToastType.success);
                  return resolve(response_on_register);
                }, error => {
                  console.error(error);
                  this.userService.api.showToast(`Error adding the user to ${this.currentUser.iglesia}`, ToastType.error);
                  return reject(error);
                });
            }
          } else {
            this.userService.registerUserInOrganization(assigned_by_other, user.idUsuario, response.idUsuario, idIglesia, 2)
              .subscribe(response_on_register => {
                this.userService.api.showToast(`User added to ${this.currentUser.iglesia}.`, ToastType.success);
                return resolve(response_on_register);
              }, error => {
                console.error(error);
                this.userService.api.showToast(`Error adding the user to ${this.currentUser.iglesia}`, ToastType.error);
                return reject(error);
              });
          }
        }, error => {
          this.loading = false;
          this.userService.api.showToast(`This user is already linked to this organization.`, ToastType.info);
          return reject(error);
        });
    });
  }

  handleAfterRegister() {
    this.loading = true;
    const member_id = this.contact_form.get('idUser').value;
    this.userService.api.get(`users/getUser/${member_id}`,
      {
        idIglesia: this.currentUser.idIglesia
      })
      .subscribe(
        (data: any) => {
          if (data.msg.Code === 200) {
            let member = data.user;
            // member.fechaNacimiento = this.fixBirdthDate(member.fechaNacimiento);
            member.telefono = data.user.telefono;
            // this.initForm();
            this.saveNotes(member);
            this.handleGroupsAndEvents(member);
          } else {
            const member = {};
          }
        },
        error => {
          console.error(error);
          this.loading = false;
        },
        () => this.loading = false
      );
  }

  handleGroupsAndEvents(member: any) {
    this.loading = true;
    const user = {
      idUsuario: this.contact_form.get('idUser').value
    }
    const selected_groups = (this.groups_first_row.value as any[]).filter(x => x.checked).concat((this.groups_second_row.value as any[]).filter(x => x.checked));
    console.log(selected_groups);
    const selected_events = (this.events_first_row.value as any[]).filter(x => x.checked).concat((this.events_second_row.value as any[]).filter(x => x.checked));
    console.log(selected_events);

    const promises = [];
    selected_groups.forEach(group => {
      promises.push(this.addMemberToGroup(user, group));
    });

    selected_events.forEach(group_event => {
      this.groupsService.checkMemberInEvent(user.idUsuario, group_event.id)
        .subscribe((response: any) => {
          console.log(response);
          promises.push(this.registerOnEvent(group_event, member));
        });
    });
    Promise.all(promises)
      .then(resolves => {
        console.log(resolves);
        this.loading = false;
        this.already_finished.emit({
          resolves,
          contact: Object.assign({}, this.selected_contact),
          idUser: this.contact_form.get('idUser').value
        });
      })
      .catch(errors => {
        console.log(errors);
        this.loading = false;
      });
  }

  addMemberToGroup(user: any, group: any) {
    return new Promise((resolve, reject) => {
      this.groupsService.addMember(user.idUsuario, group.id, undefined)
        .subscribe(response => {
          console.log(response);
          return resolve(response);
        }, error => {
          console.error(error);
          return resolve(error);
        });
    });
  }

  registerOnEvent(event: any, member) {
    const user = member;
    return new Promise((resolve, reject) => {
      console.log(user);
      if (user) {
        const additional_value = {
          covid_quest: false,
          guests: 0
        };
        this.groupsService.addMemberToEvent(user.idUsuario, event.idGroup, event.idGroupEvent, additional_value)
          .subscribe((response: any) => {
            event.confirmation_number = response.msg.confirmation_number;
            event.guests = response.msg.guests;
            // if (response.msg.Code === 409) {
            //   this.groupsService.api.showToast(response.msg.Message, ToastType.info);
            // } else {
            //   this.groupsService.api.showToast('You were added to this event.', ToastType.success);
            // }
            return resolve(response);
          }, error => {
            console.error(error);
            // this.groupsService.api.showToast('Error trying to add you to this event', ToastType.error);
            return resolve(error);
          });
      } else {
        // this.hideRegisterForm();
        return reject({});
      }
    });
  }

  saveNotes(member) {
    this.loading = true;
    const payload: UserLogModel = new UserLogModel();
    payload.idActivityType = 1;
    payload.idUserOrganization = member.idUserOrganization;
    payload.submitted_date = new Date();
    payload.note = this.contact_form.get('notes').value;
    payload.createdBy = this.currentUser.idUsuario;

    let subscription: Observable<any>;
    let success_message: string;
    let error_message: string;
    if (payload.idUserOrganizationLog) {
      // update
      subscription = this.userService.updateUserOrganizationLog(payload);
      success_message = `Note updated successfully.`;
      error_message = `Error updating note.`;
    } else {
      // add
      subscription = this.userService.addUserOrganizationLog(payload);
      success_message = `Note added successfully.`;
      error_message = `Error adding note.`;
    }

    subscription.subscribe(response => {
      this.userService.api.showToast(`${success_message}`, ToastType.success);
      // // this.dismiss(response);
      // this.loading = false;
    }, error => {
      console.error(error);
      this.userService.api.showToast(`${error_message}`, ToastType.error);
      this.loading = false;
    });

  }

  continueWithRegister() {
    /////// AFTER CREATE


    // this.saveNotes();
    // this.handleGroupsAndEvents();
    const member_form = this.form_builder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      // tslint:disable-next-line: max-line-length
      email: ['', [Validators.required, Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))]],
      password: ['no_pass_created', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['no_pass_created', [Validators.required, Validators.minLength(6)]],
      pass: [''],
      reset_password: [false],
      calle: [''],
      ciudad: [''],
      provincia: [''],
      zip: [''],
      isSuperUser: false,
      isNewUser: false,
      login_type: '',
      idIglesia: [Validators.required],
      telefono: ['', Validators.required],
      country_code: ['', Validators.required],
      idUserType: new FormControl(2, [Validators.required]),
      is_available: new FormControl(true, [Validators.required, Validators.pattern(/^(?:1|y(?:es)?|t(?:rue)?|on)$/i)])
    });
    const temp_value = this.contact_form.value;
    temp_value.telefono = temp_value.phone;
    temp_value.nombre = temp_value.name;
    temp_value.apellido = temp_value.last_name;
    temp_value.idIglesia = this.mailing_list.idIglesia;
    temp_value.isNewUser = true;

    member_form.patchValue(temp_value);
    if (member_form.invalid) {
      console.log(member_form);
      return;
    } else {
      const member = member_form.value;
      this.completeRegister(member);
    }
  }

  completeRegister(payload: any) {
    let message_success: string;
    let message_error: string;

    payload.pass = UserService.encryptPass(payload.password);

    if (Array.isArray(payload.idIglesia)) {
      if (payload.idIglesia.length > 0) {
        payload.idIglesia = payload.idIglesia[0].idIglesia;
      } else {
        this.groupsService.api.showToast(`Please select a valid organization.`, ToastType.info);
        this.loading = false;
        return;
      }
    } else if (payload.idIglesia == null) {
      this.groupsService.api.showToast(`Please select a valid organization.`, ToastType.info);
      this.loading = false;
      return;
    }
    if (payload.idIglesia === 0) {
      this.groupsService.api.showToast(`Please select a valid organization.`, ToastType.info);
      this.loading = false;
      return;
    }
    if (Array.isArray(payload.idUserType)) {
      if (payload.idUserType.length > 0) {
        payload.idUserType = payload.idUserType[0].idUserType;
      } else {
        this.groupsService.api.showToast(`Please select a valid role.`, ToastType.info);
        this.loading = false;
        return;
      }
    } else if (payload.idUserType == null) {
      this.groupsService.api.showToast(`Please select a valid role.`, ToastType.info);
      this.loading = false;
      return;
    }
    if (payload.idUserType === 0) {
      this.groupsService.api.showToast(`Please select a valid role.`, ToastType.info);
      this.loading = false;
      return;
    }
    if (payload.password !== payload.confirm_password) {
      this.groupsService.api.showToast(`Your passwords didn't match.`, ToastType.info);
      this.loading = false;
      return;
    }
    message_success = `User: ${payload.email}, created successfully.`;
    message_error = `Error creating user.`;
    // payload.created_by = this.currentUser.idUsuario;
    console.log(payload);

    this.groupsService.api.post_old(`registerUsuario`, payload)
      .subscribe((data: any) => {
        payload.idUsuario = data.idUsuario;
        const idUsuario = payload.idUsuario;
        // const iglesia = this.userConfig.getIglesia();
        // const topic = iglesia.topic;
        // const device = this.userConfig.getDevice();
        this.groupsService.api.showToast(`${message_success}. Please ask to user to reset the password.`, ToastType.success, 'Success', {
          timeOut: 5000
        });
        this.loading = false;

        // this.selectLoginUser(payload);

        // this.registerOnEvent(this.group_event);
        // this.dismiss(data);
        // this.register_response.emit(payload);
        this.contact_form.addControl('idUser', new FormControl(data.idUsuario));
        this.handleAfterRegister()
      }, err => {
        console.error(err);
        this.groupsService.api.showToast(`${message_error}`, ToastType.error);
        this.loading = false;
      });
  }
}
