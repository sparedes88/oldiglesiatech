import { GoogleAddressComponent } from './../../../component/google-places/google-places.component';
import { SimpleMemberFormComponent } from './../simple-member-form/simple-member-form.component';
import { IDropdownSettings, MultiSelectComponent } from 'ng-multiselect-dropdown';
import { DesignRequestService } from 'src/app/services/design-request.service';
import { MemberFormComponent } from './../member-form/member-form.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { ToastType } from './../../../login/ToastTypes';
import { FormArray, FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { User } from './../../../interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-show-all-users',
  templateUrl: './show-all-users.component.html',
  styleUrls: ['./show-all-users.component.scss']
})
export class ShowAllUsersComponent implements OnInit, OnDestroy {

  currentUser: User; // Interfaces

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChild('multi_select') multi_select: MultiSelectComponent;

  // Datatables
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
    ]
  };

  contacts: any[] = [];
  iglesias: any[] = [];
  iglesias_filtered: any[] = [];

  public membertTypeForm: FormGroup = this.formBuilder.group({
    members: this.formBuilder.array([])
  });

  filtersForm: FormGroup = this.formBuilder.group({
    isSuperUser: new FormControl(null),
    idOrganization: new FormControl(0),
    idUserType: new FormControl(0)
  });

  selectOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  filtered: boolean = false;
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private designRequestService: DesignRequestService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    // this.getContacts(this.currentUser.idIglesia);
    this.designRequestService.getDesignRequestDropdown()
      .subscribe((response: any) => {
        this.iglesias = response.iglesias;
        this.iglesias.unshift({
          idIglesia: 0,
          Nombre: 'All'
        });

        if (!this.currentUser.isSuperUser) {
          this.iglesias = this.iglesias.filter(x => x.idIglesia === this.currentUser.idIglesia);
          this.multi_select.writeValue(this.iglesias.filter(x => x.idIglesia === this.currentUser.idIglesia));
        } else {
          this.multi_select.writeValue(this.iglesias.filter(x => x.idIglesia === 0));
        }
      }, error => {
        this.iglesias = [{
          idIglesia: 0,
          Nombre: 'All'
        }];
      });
  }

  ngOnDestroy() {
    // Use in Datatable
    this.dtTrigger.unsubscribe();
  }


  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.membertTypeForm = this.formBuilder.group({
        members: this.formBuilder.array([])
      });
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  // getContacts(idIglesia: number) {
  //   const promises = [];
  //   promises.push(this.getUsers().toPromise());
  //   promises.push(this.designRequestService.getDesignRequestDropdown().toPromise());
  //   Promise.all(promises)
  //     .then((contacts: any) => {
  //       this.restartTable();
  //       this.contacts = contacts[0].users;
  //       this.iglesias = contacts[1].iglesias;
  //       this.iglesias.unshift({
  //         idIglesia: 0,
  //         Nombre: 'All'
  //       });
  //       this.multi_select.writeValue(this.iglesias.filter(x => x.idIglesia === 0));

  //       this.contacts.forEach((member, index) => {
  //         const control = this.membertTypeForm.controls.members as FormArray;
  //         control.push(this.formBuilder.group({
  //           status: new FormControl(member.status, [Validators.required]),
  //           isSuperUser: new FormControl(member.isSuperUser, [Validators.required]),
  //           organizations: this.formBuilder.array([]),
  //           new_organization: new FormControl('')
  //         }));

  //         const organizations = this.members_on_form.controls[index].get('organizations') as FormArray;
  //         member.organizations.forEach(user_organization => {
  //           organizations.push(this.formBuilder.group({
  //             idUserType: new FormControl(user_organization.idUserType, [Validators.required])
  //           }));
  //         });
  //       });
  //       this.dtTrigger.next();
  //       this.loading = false;
  //     }, error => {
  //       console.error(error);
  //     })
  //     .catch(error => {
  //       console.error(error);
  //     });
  // }

  getPhoto(photo) {
    if (photo) {
      return `${environment.serverURL}${photo}`;
    }
    return '/assets/img/img_avatar.png';
  }

  get members_on_form(): FormArray {
    return this.membertTypeForm.get('members') as FormArray;
  }

  get_organization_in_member(member_index: number): FormArray {
    return (this.membertTypeForm.get('members') as FormArray).controls[member_index].get('organizations') as FormArray;
  }

  checkChange(control: FormControl, user_organization: any) {
    if (Number(JSON.parse(control.value)) === user_organization.idUserType) {
      control.markAsPristine();
    }
  }

  checkChangeWithTag(control: FormControl, user_organization: any, tag: string) {
    if (Boolean(JSON.parse(control.value)) === user_organization[tag]) {
      control.markAsPristine();
    }
  }

  parseStatus(value: string) {
    return Boolean(JSON.parse(value));
  }

  resetMemberForm(control: FormGroup, user_organization: any) {
    control.get('idUserType').setValue(user_organization.idUserType);
    control.get('idUserType').markAsPristine();
  }

  resetMemberFormWithTag(control: FormGroup, user_organization: any, tag: string) {
    control.get(tag).setValue(user_organization[tag]);
    control.get(tag).markAsPristine();
  }


  updateMemberType(control: FormGroup, user_organization: any) {
    const member_temp = Object.assign({}, user_organization);
    member_temp.idUserType = Number(JSON.parse(control.get('idUserType').value));
    if (member_temp.idUserType === user_organization.idUserType) {
      control.get('idUserType').setValue(user_organization.idUserType);
      control.get('idUserType').markAsPristine();
    } else {
      this.api.post(`users/updateUserOrganizationType`,
        {
          idUserOrganization: user_organization.idUserOrganization,
          idUserType: member_temp.idUserType
        })
        .subscribe(response => {
          this.api.showToast(`Role updated.`, ToastType.info);
          user_organization.idUserType = member_temp.idUserType;
          control.get('idUserType').setValue(member_temp.idUserType);
          control.get('idUserType').markAsPristine();
        }, error => {
          console.error(error);
          this.api.showToast(`Error updating the user's role. Reversing changes...`, ToastType.error);
          control.get('idUserType').setValue(user_organization.idUserType);
          control.get('idUserType').markAsPristine();
        });
    }

  }

  updateMemberWithTag(control: FormGroup, user: any, tag: string) {
    const member_temp = Object.assign({}, user);
    member_temp[tag] = Boolean(JSON.parse(control.get(tag).value));
    if (member_temp[tag] === user[tag]) {
      control.get(tag).setValue(user[tag]);
      control.get(tag).markAsPristine();
    } else {
      let subscription;
      if (tag === 'isSuperUser') {
        subscription = this.userService.registerAsSuperUser(user.idUser, member_temp[tag]);
      } else {
        subscription = this.userService.reactivateUser(user.idUser, member_temp[tag]);
      }
      subscription
        .subscribe(response => {
          this.api.showToast(`User updated.`, ToastType.info);
          control.get(tag).setValue(member_temp[tag].toString());
          user[tag] = member_temp[tag];
          control.get(tag).markAsPristine();
        }, error => {
          console.error(error);
          this.api.showToast(`Error updating the user. Reversing changes...`, ToastType.error);
          control.get(tag).setValue(user[tag]);
          control.get(tag).markAsPristine();
        });
    }

  }

  deleteUsuario(idUser) {
    if (confirm(`Are you sure yo want to delete this user?`)) {
      this.deleteUser(idUser)
        .subscribe(response => {
          // this.getGroup();
          this.api.showToast(`User deleted.`, ToastType.info);
        }, error => {
          console.error(error);
          this.api.showToast(`Error deleting user.`, ToastType.error);
        });
    }
  }

  getUsers(isSuperUser?: boolean, idOrganization?: number, idUserType?: number, filterByIglesia?: boolean) {
    this.loading = true;
    const resp = this.api.get('users/getAllUsers',
      // Params
      {
        isSuperUser,
        idOrganization,
        idUserType,
        filterByIglesia
      }
      // reqOptions
    );
    this.filtered = true;
    return resp;
  }

  deleteUser(idUser) {
    const resp = this.api.post('users/deleteUser',
      // Params
      { idUser }
      // reqOptions
    );
    return resp;
  }

  clearFilters() {
    this.filtersForm.patchValue({
      isSuperUser: null,
      idOrganization: this.iglesias.filter(x => x.idIglesia === 0),
      idUserType: 0
    });
  }

  searchWithFilters() {
    const isSuperUser = this.filtersForm.get('isSuperUser').value;
    const org_array: any[] = this.filtersForm.get('idOrganization').value;
    let idOrganization = 0;
    if (this.currentUser.isSuperUser) {
      if (org_array.length > 0) {
        idOrganization = Number(JSON.parse(org_array[0].idIglesia));
      }
    } else {
      idOrganization = this.currentUser.idIglesia;
    }
    const idUserType = Number(JSON.parse(this.filtersForm.get('idUserType').value));
    const filterByIglesia = !this.currentUser.isSuperUser;
    this.getUsers(isSuperUser, idOrganization, idUserType, filterByIglesia)
      .subscribe((contacts: any) => {
        this.restartTable();
        this.contacts = contacts.users;
        this.contacts.forEach((member, index) => {
          const control = this.membertTypeForm.controls.members as FormArray;
          control.push(this.formBuilder.group({
            status: new FormControl(member.status, [Validators.required]),
            isSuperUser: new FormControl(member.isSuperUser, [Validators.required]),
            organizations: this.formBuilder.array([]),
            show_organization: false
          }));

          const organizations = this.members_on_form.controls[index].get('organizations') as FormArray;
          member.organizations.forEach(user_organization => {
            organizations.push(this.formBuilder.group({
              idUserType: new FormControl(
                {
                  disabled: !user_organization.status,
                  value: user_organization.idUserType
                },
                Validators.required)
            }));
          });
          this.updateLocation(member);
        });
        this.dtTrigger.next();
        this.loading = false;
      }, error => {
        console.error(error);
      },
        () => {
          // this.dtTrigger.next();
        });
  }

  async updateLocation(member: any) {
    member.location = this.formatFullAddress(member);
    if (!member.lat || !member.lat) {
      const pin_info = await GoogleAddressComponent.convert(member.location).catch(error => {
        console.error(error);
        return error;
      });
      if (JSON.stringify(pin_info) !== '{}') {
        const address = pin_info.address;
        address.idUser = member.idUser;
        this.api
          .post(`users/updateAddress`, address)
          .subscribe(response => {
          });
      }
    }
  }

  addUser(formAddModal: NgxSmartModalComponent, user_form: SimpleMemberFormComponent) {
    formAddModal.open();
    user_form.user = undefined;
    user_form.ngOnInit();
    if (user_form.custom_select_country) {
      user_form.custom_select_country.getCountryForOrganization();
    }
    if (!this.currentUser.isSuperUser) {
      user_form.disableUnusedFields();
    }
  }

  onModalEditDidDismiss(formAddModal: NgxSmartModalComponent, response) {
    formAddModal.close();
    if (response) {
      this.searchWithFilters();
    }
  }

  updateUsuario(contact, formAddModal: NgxSmartModalComponent, user_form: SimpleMemberFormComponent) {
    user_form.ngOnInit();
    console.log(contact);

    user_form.setUser(contact);
    formAddModal.open();
  }

  showNewOrganization(control: FormGroup, contact) {
    control.get('show_organization').setValue(true);
    control.addControl('new_organization', new FormControl('', [Validators.required]));
    const organizations = contact.organizations.map(({ idOrganization }) => idOrganization);
    const organizations_filtered = this.iglesias.filter(x => {
      return !organizations.includes(x.idIglesia) && x.idIglesia !== 0;
    });
    control.addControl('organizations_unused', new FormControl(organizations_filtered, [Validators.required]));
  }

  resetNewOrganizationForm(control: FormGroup) {
    control.get('show_organization').setValue(false);
    control.removeControl('new_organization');
  }

  registerInOrganization(control: FormGroup, contact) {
    const organization = control.get('new_organization').value[0];
    const idUser = contact.idUser;
    this.api.post(`users/registerUserInOrganization`,
      {
        idUser,
        idIglesia: organization.idIglesia,
        created_by: this.currentUser.idUsuario,
        idUserType: 2
      }
    ).subscribe(response => {
      this.api.showToast(`User added to ${organization.Nombre}.`, ToastType.success);
      this.searchWithFilters();
    }, error => {
      console.error(error);
      if (error.error.msg.Code === 422) {
        this.api.showToast(`${error.error.msg.Message}`, ToastType.info);
      } else {
        this.api.showToast(`Error adding user.`, ToastType.error);
      }
    });
  }

  reAddMember(control: FormGroup, user_organization: any) {
    console.log(user_organization);
    this.api.post(`users/updateUserOrganizationType`,
      {
        idUserOrganization: user_organization.idUserOrganization,
        idUserType: user_organization.idUserType
      })
      .subscribe(response => {
        this.api.showToast(`User reactivated.`, ToastType.info);
        user_organization.status = true;
        control.get('idUserType').setValue(user_organization.idUserType);
        control.get('idUserType').markAsPristine();
        control.get('idUserType').enable();
      }, error => {
        console.error(error);
        this.api.showToast(`Error updating the user's role. Reversing changes...`, ToastType.error);
        control.get('idUserType').setValue(user_organization.idUserType);
        control.get('idUserType').markAsPristine();
      });

  }

  formatFullAddress(user: any): string {
    let full_address = ``;
    if (user.street) {
      full_address = `${user.street}`
    }
    if (user.city) {
      full_address = `${full_address}, ${user.city}`
    }
    if (user.state) {
      full_address = `${full_address}, ${user.state}`
    }
    if (user.country) {
      full_address = `${full_address}, ${user.country}`
    }
    if (user.zip_code) {
      full_address = `${full_address}, ${user.zip_code}`
    }
    if (user.zipCode) {
      full_address = `${full_address}, ${user.zipCode}`
    }
    return full_address;
  }

}
