import { MatExpansionPanel } from '@angular/material';
import { CheckRequirementsComponent } from './../../component/check-requirements/check-requirements.component';
import { SeeStepDetailComponent } from './../contact/see-step-detail/see-step-detail.component';
import { UserCommitmentsModel } from 'src/app/models/UserLogModel';
import { GroupEventModel } from './../../models/GroupModel';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';
import { GroupMemberModel } from 'src/app/models/GroupModel';
import { FileUploadService } from 'src/app/services/file-upload.service';
import *  as moment from 'moment';
import { CalendarEvent } from 'angular-calendar';
import { random_color } from 'src/app/models/Utility';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  public userFormGroup: FormGroup = new FormGroup({});
  public editMode: boolean = false;
  tempPhoto: any;

  events: CalendarEvent[] = [];
  viewDate: Date = new Date();
  viewDateNext: Date = new Date();
  events_original: CalendarEvent[] = [];
  events_clear: any[] = [];
  commitments: UserCommitmentsModel[] = [];
  niveles: any[] = [];

  constructor(
    public api: ApiService,
    public route: ActivatedRoute,
    public modal: NgxSmartModalService,
    public userService: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    public uploadService: FileUploadService,
  ) {
    this.memberId = Number(this.route.snapshot.params.id);
    this.currentUser = this.userService.getCurrentUser();
  }

  public serverUrl: string = 'https://iglesia-tech-api.e2api.com';

  // member data
  public currentUser: any = {};
  public actualUserId: any;
  public memberId: any;
  public member: any = {};
  public categories: any[] = [];
  public levels: any[] = [];
  public ministries: any[] = [];
  public groups: any[] = [];
  public donations: any[] = [];
  processes: any[] = [];

  // UI
  public loadingMember: boolean = true;
  public loadingMinistries: boolean = true;
  public loadingGroups: boolean = true;
  public loadingEvents: boolean = true;
  public uploading: Boolean = false;

  ngOnInit() {
    this.viewDate = moment().startOf('month').toDate();
    this.viewDateNext = moment(this.viewDate).add(1, 'M').toDate();
    this.getDonations()
    if (this.memberId !== this.currentUser.idUsuario) {
      setTimeout(() => {
        this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
        this.memberId = this.currentUser.idUsuario;
        this.ngOnInit();
      }, 1200);
      return;
    } else {
      this.getMemberProfile();
    }
  }
  getDonations() {
    console.log(this.currentUser)
    this.api
      .get(`iglesias/getUserDonations`, { idUser: this.currentUser.idUsuario, idIglesia: this.currentUser.idIglesia })
      .subscribe((data: any) => {
        console.log(data)
        if (data) {
          this.donations = data
          this.donations.forEach(iglesia => {
            iglesia.donations.forEach(element => {
              element.covered_fee == 1 ? element.is_covered = 'Yes' : element.is_covered = 'No'
              element.is_manual == 1 ? element.manual = 'Manual' : element.manual = 'Standard'
              element.date = String(element.date).split('T')[0] + ' ' + String(element.date).split('T')[1].split('.')[0]
            })
            iglesia.donations.sort(function (a, b) {
              return (a.date > b.date) ? -1 : ((a.date < b.date) ? 1 : 0);
            });
          });
        }
      });
  }
  get photoUrl() {
    if (this.member.foto && this.member.foto !== 'null') {
      return `${this.serverUrl}${this.member.foto}`
    }

    return '/assets/img/img_avatar.png';
  }

  getMemberProfile() {
    this.loadingMember = true;
    this.api.get(`users/getUser/${this.memberId}`, {
      idIglesia: this.currentUser.idIglesia
    })
      // this.api.get("getUsergetUserByIdV2/" + this.memberId, {})
      .subscribe(
        (data: any) => {
          this.member = data.user;
          // Check which id to use
          if (data.isNewUser) {
            this.actualUserId = data.idUser;
          } else {
            this.actualUserId = data.idUsuario;
          }
          // Load ministries when user is ready
          // this.getMinistries()
          this.getGroups();
          this.getEvents();
          this.getCategoryAndLevels();
          this.getCommitmentsByUser();
          this.initForm();
        },
        error => {
          console.error(error);
          this.loadingMember = false;
        },
        () => this.loadingMember = false
      );
  }

  getCommitmentsByUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userService.getCommitmentsByUser(this.memberId, this.currentUser.idIglesia)
        .subscribe((response: any) => {
          this.commitments = response.commitments;
          this.commitments.forEach(commitment => {
            commitment.commitment_date = moment(commitment.commitment_date).utc().format('YYYY-MM-DD');
          });
          return resolve(this.commitments);
        }, error => {
          this.commitments = [];
          return resolve(this.commitments);
        });
    });
  }

  getEvents() {
    this.loadingEvents = true;
    this.userService.getNextEvents(this.memberId, this.currentUser.idIglesia)
      .subscribe((response: any) => {
        this.printEvents(response.events);
        this.loadingEvents = false;
      }, error => {
        this.loadingEvents = false;
      });
  }

  printEvents(raw_events: GroupEventModel[]) {
    this.events = [];

    const events = raw_events.concat([]);

    const events_clear = events
      .map(e => e.idGroupEvent)
      .map((e, index, final) => final.indexOf(e) === index && index)
      .filter(e => events[e]).map(e => events[e]);

    let i = 0;
    // iterate clean array to filter raw events and use the same color for each event.
    events_clear.forEach(event_clear => {
      const color = { primary: random_color(), secondary: random_color() };
      event_clear.color = color;
      events
        .filter(event => event.idGroupEvent === event_clear.idGroupEvent)
        // iterate filtered arrays
        .forEach(event => {
          let event_end;
          if (event.event_as_range) {
            // is range
            if (event.event_date_end) {
              event_end = (event.event_date_end as string).substring(0, 10) + ' ';
              event_end += event.event_time_end;
              event_end = moment(event_end).toDate();
            }
          } else {
            if (event.is_exact_date) {
              event_end = (event.event_date_ as string).substring(0, 10) + ' ';
              event_end += event.event_time_end;
              event_end = moment(event_end).toDate();
            }
          }
          let event_actual_date = moment(event.event_date_).toDate();
          const last_day_of_end = moment(this.viewDateNext).endOf('month').toDate();
          // const last_day_of_end = lastDayOfMonth(this.viewDateNext);
          do {
            let event_end_to_others;
            if (!event_end) {
              // Fix event_end for events without range and not exact date.
              event_end_to_others = moment(event_actual_date).format('YYYY-MM-DD hh:mm').substring(0, 10) + ' ';
              event_end_to_others += event.event_time_end;
              event_end_to_others = moment(event_end_to_others).toDate();
            }
            const event_fixed: CalendarEvent = {
              id: i++,
              color,
              title: event.name,
              start: moment(event_actual_date).toDate(),
              end: event_end ? event_end : event_end_to_others ? event_end_to_others : undefined,
              allDay: false,
              resizable: {
                beforeStart: false,
                afterEnd: false
              },
              draggable: false,
              meta: {
                idGroup: event.idGroup,
                idGroupEvent: event.idGroupEvent,
                name: event.name,
                description: event.description,
                attendances_count: event.attendances_count,
                attendances_total: event.attendances_total,
                picture: event.picture
              }
            };
            event_end_to_others = undefined;
            if (
              // Check that month and year is same.
              (event_actual_date.getMonth() === this.viewDate.getMonth() &&
                event_actual_date.getFullYear() === this.viewDate.getFullYear()) ||
              (event_actual_date.getMonth() === this.viewDateNext.getMonth() &&
                event_actual_date.getFullYear() === this.viewDateNext.getFullYear()) ||
              (moment(event_actual_date).isSameOrAfter(this.viewDate, 'minute') &&
                moment(event_actual_date).isSameOrBefore(this.viewDateNext, 'minute'))
            ) {
              if (event.repeat_until_date) {
                // Has until_date field
                if (moment(event.repeat_until_date).isSameOrAfter(event_actual_date, 'day')) {
                  // Validate that repeat until is same of after to add it to calendar.
                  this.events.push(event_fixed);
                }
              } else {
                // Added to calendar cause there isn't limit.
                this.events.push(event_fixed);
              }
            }
            event_actual_date = moment(event_actual_date).add(event.quantity, this.parseSegment(event.segment)).toDate();
          } while (event_actual_date < last_day_of_end && event.quantity > 0);
        });
    });
    // Sort array for start date
    this.events.sort((a, b) => {
      return a.start > b.start ? 1 : -1;
    });

    // Fix id's to use it ascending
    let j = 0;
    this.events.forEach(x => {
      x.id = j++;
    });

    // Create copy temp to filter.
    this.events_original = [...this.events];

    // Get only colors to clean.
    const colors_clear = this.events_original
      .map(e => e.color.primary)
      // store the keys of the unique objects
      .map((e, index, final) => final.indexOf(e) === index && index)
      // eliminate the dead keys & store unique objects
      .filter(e => this.events_original[e]).map(e => this.events_original[e]);

    // Copy to events
    this.events_clear = [...colors_clear];
  }

  parseSegment(segment: string): moment.unitOfTime.DurationConstructor {
    switch (segment) {
      case 'day':
        return 'day';
      case 'month':
        return 'month';
      case 'year':
        return 'year';
      default:
        return 'day';
    }
  }

  initForm() {
    if (!this.member.fechaNacimiento) {
      this.member.fechaNacimiento = '';
    }
    if (!this.member.fechaMembresia) {
      this.member.fechaMembresia = '';
    }
    // init form
    // this.userFormGroup = this.formBuilder.group({
    //   idIglesia: this.currentUser.idIglesia,
    //   idUsuario: this.member.idUser,
    //   nombre: [this.member.name, Validators.required],
    //   apellido: [this.member.lastName, Validators.required],
    //   sexo: [this.member.gender, Validators.required],
    //   telefono: [this.member.telefono, Validators.required],
    //   email: [this.member.email, Validators.required],
    //   ciudad: [this.member.city, Validators.required],
    //   calle: [this.member.street, Validators.required],
    //   provincia: [this.member.state, Validators.required],
    //   zip: this.member.zipCode,
    //   estadoCivil: this.member.civilStatus,
    //   fechaNacimiento: this.member.birthday.split('T')[0],
    //   fechaMembresia: this.member.membershipDate? this.member.membershipDate.split('T')[0] : '',
    //   fotoUrl: this.member.picture,
    //   idUserType: this.currentUser.idUserType,
    //   photo: [''],
    //   categorias: [''],
    //   niveles: ['']
    // })

    this.userFormGroup = this.formBuilder.group({
      idIglesia: this.member.idIglesia,
      idUsuario: this.member.idUsuario,
      nombre: [this.member.nombre, Validators.required],
      apellido: [this.member.apellido, Validators.required],
      sexo: [this.member.sexo, Validators.required],
      telefono: [this.member.telefono, Validators.required],
      email: [this.member.email, Validators.required],
      ciudad: [this.member.ciudad, Validators.required],
      calle: [this.member.calle, Validators.required],
      provincia: [this.member.provincia, Validators.required],
      zip: this.member.zip,
      estadoCivil: this.member.estadoCivil,
      fechaNacimiento: this.member.fechaNacimiento.split('T')[0],
      fechaMembresia: this.member.fechaMembresia.split('T')[0],
      fotoUrl: this.member.fotoUrl,
      idUserType: this.member.idUserType,
      photo: [''],
      categorias: [''],
      niveles: ['']
    });
  }

  getCategoryAndLevels() {
    const promises: Promise<any>[] = [];
    promises.push(this.api.get('getCategoriasAndNivelesByIdUsuario',
      {
        idUsuario: this.memberId, idIglesia: this.currentUser.idIglesia
      }).toPromise());

    promises.push(this.api.get('processes/getProcessForUser',
      {
        idUsuario: this.memberId,
        idIglesia: this.currentUser.idIglesia
      }
    ).toPromise());
    Promise.all(promises)
      .then((responses: any[]) => {
        const data = responses[0];
        this.categories = data.categoriasMiembros;
        // Remove duplicated
        this.levels = data.niveles.filter((v, i, a) => a.findIndex(t => (t.idNivel === v.idNivel)) === i);
        // Remove
        this.processes = responses[1].processes;
        this.member.processes = [];
        this.member.fixed_proccesses = data.process;
        data.process.forEach(process => {
          this.member.processes.push(process.idProcess);
          this.niveles = (this.niveles as any[]).concat(process.levels);
          if (this.niveles) {
            this.niveles.map(nivel => {
              nivel.requisitosCumplidos = nivel.requisitos.filter(item => {
                return item.cumplido;
              });
            });
            const unique = [...this.niveles];

            this.niveles = unique
              .map(e => e.idNivel)
              // store the keys of the unique objects
              .map((e, i, final) => final.indexOf(e) === i && i)
              // eliminate the dead keys & store unique objects
              .filter(e => unique[e]).map(e => unique[e]);
          } else {
            this.niveles = [];
          }
        });
      },
        err => { console.error(err); }
      );
  }

  getGroups() {
    this.loadingGroups = true;
    this.api.get('groups/getGroupsByIdUsuario', {
      idUser: this.memberId,
      idIglesia: this.currentUser.idIglesia
    })
      .subscribe(
        (data: any) => {
          this.groups = data.groups;
        },
        err => {
          console.error(err);
          this.loadingGroups = false;
          this.loadingMinistries = false;
          // this.loadingEvents = false;
        },
        () => {
          this.loadingGroups = false;
          this.loadingMinistries = false;
          // this.loadingEvents = false;
        }
      );
  }

  goToGroupDetail(group: GroupMemberModel) {
    if (group.status) {
      this.router.navigateByUrl(`/group/detail/${group.idGroup}`);
    }
  }

  goToGroupEventDetail(group_event: GroupEventModel) {
    this.router.navigateByUrl(`group/events/detail/${group_event.idGroupEvent}`);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.tempPhoto = undefined;
    // Patch form
    this.userFormGroup.patchValue({
      niveles: this.levels,
      categorias: this.categories,
      // telefono: this.telefono
    });
  }

  submitUpdate(form: FormGroup) {
    this.uploading = true;

    if (form.value.photo) {
      this.uploadService.uploadFile(form.value.photo, true)
        .subscribe(
          (res: any) => {
            form.patchValue({ fotoUrl: `${res.file_info.src_path}` });
            form.patchValue({ foto: `${res.file_info.src_path}` });
            // Clean payload
            const payload = this.removeEmptyParams(form.value);
            this.updateUser(payload);
          },
          err => {
            alert(`Can't upload photo!`);
          }
        );
    } else {
      if (form.value.fotoUrl) {
        form.patchValue({ fotoUrl: this.uploadService.cleanPhotoUrl(form.value.fotoUrl) });
        form.patchValue({ foto: this.uploadService.cleanPhotoUrl(form.value.fotoUrl) });
        // clean payload
        const payload = this.removeEmptyParams(form.value);
        this.updateUser(payload);
      } else {
        const payload = this.removeEmptyParams(form.value);
        this.updateUser(payload);
      }
    }
  }

  updateUser(data: any) {
    data.idIglesia = this.currentUser.idIglesia;
    // Insert data on categories
    if (data.categorias && data.categorias.length) {
      data.categorias.map(cat => {
        cat.idUsuario = data.idUsuario;
      });
    }

    this.api.post(`updateUsuario`, data)
      .subscribe(
        (res: any) => {
          if (res.phone_warning) {
            this.api.showToast(`The phone provided is already in use and will not be updated`, ToastType.info);
          }
          // this.telefono = data.telefono
          this.getMemberProfile();
          this.toggleEditMode();
          // Update values
          this.getCategoryAndLevels();
          // this.getLevels()
          // this.getCategories()
          // this.telefono = data.telefono
          this.uploading = false;
        },
        err => {
          alert(`Can't Update profile`);
          this.uploading = false;
        }
      );
  }


  removeEmptyParams(data: any) {
    const payload: any = Object.assign({}, data);

    // Remove empty params
    Object.keys(payload).map(key => {
      if (!payload[key]) {
        delete payload[key];
      }
    });

    return payload;
  }

  handleFileInput(files: FileList) {
    const file = files.item(0);
    if (file) {
      this.userFormGroup.patchValue({ photo: file });
      // Preview file
      const reader = new FileReader();
      reader.readAsDataURL(file);
      // tslint:disable-next-line: variable-name
      reader.onload = (_event) => {
        this.tempPhoto = reader.result;
      };
    }
  }

  logout() {
    const confirmation = confirm(`Are you sure you want to log out?`);
    if (confirmation) {
      this.userService.logout();
      this.router.navigate(['/login']);
      console.log('Logout Bye!');
    }
  }

  checkDate(start, end) {
    return moment(end).isAfter(moment(start), 'day');
  }

  openModalDetail(
    see_step_detail_modal: NgxSmartModalComponent,
    see_step_detail_form: SeeStepDetailComponent,
    step
  ) {
    see_step_detail_form.step = step;
    see_step_detail_form.ngOnInit();
    see_step_detail_modal.open();
  }

  onModalEditDidDismiss(user_log_modal: NgxSmartModalComponent, response) {
    user_log_modal.close();
    if (response) {
      this.getMemberProfile();
    }
  }

  openRequirements(
    form_check_modal: NgxSmartModalComponent,
    check_requirements_form: CheckRequirementsComponent,
    nivel: any,
    index: number
  ) {
    nivel.index = index;
    check_requirements_form.nivel = nivel;
    check_requirements_form.requisitos = nivel.requisitos ? nivel.requisitos : [];
    check_requirements_form.initRequisitos();
    form_check_modal.open();
  }

  onModalCheckDidDismiss(modal: NgxSmartModalComponent, response) {
    modal.close();
    if (response) {
      this.loadingEvents = true;
      this.loadingMember = true;
      this.loadingGroups = true;
      this.loadingMinistries = true;
      const nivel = response.nivel;
      const requisitos = response.requisitos;
      nivel.requisitos = requisitos;
      nivel.requisitosCumplidos = requisitos.filter(item => {
        return item.cumplido;
      });
      const found_level = this.niveles.find(n => {
        return n.idNivel === nivel.idNivel;
      });
      if (found_level) {
        const index = this.niveles.indexOf(found_level);
        this.niveles[index] = nivel;
      }
      const usuario = this.member;
      usuario.categorias = this.categories;
      usuario.niveles = this.niveles;

      if (usuario.foto) {
        usuario.foto = this.uploadService.cleanPhotoUrl(usuario.foto);
      }
      usuario.created_by = this.currentUser.idUsuario;
      const process = [...usuario.fixed_proccesses];
      usuario.processes = [];
      process.forEach(process_in_array => {
        usuario.processes.push(process_in_array.idProcess);
      });
      this.api.post('updateUsuario', usuario)
        .subscribe((response_update: any) => {
          if (response_update.phone_warning) {
            this.api.showToast(`The phone provided is already in use and will not be updated`, ToastType.info);
          }
          this.api.showToast(`Requirements updated successfully.`, ToastType.success);
          this.getMemberProfile();
        }, err => {
          this.api.showToast(`Error updating requirements.`, ToastType.error);
        });
    }
  }

  verRequisitos(nivel, accordion: MatExpansionPanel) {
    if (nivel.requisitos.length === 0) {
      accordion.expanded = false;
      return;
    }

    if (!accordion.expanded) {
      // Closed
      return;
    }
  }

}
