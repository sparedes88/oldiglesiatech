import { Component, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { DesignRequestService } from 'src/app/services/design-request.service';

import { ToastType } from './../../../login/ToastTypes';
import {
  DesignRequestImageModel,
  DesignRequestModel,
  DesignRequestStatusModel,
  DesignRequestTypesModel,
} from './../../../models/DesignRequestModel';
import { OrganizationService } from './../../../services/organization/organization.service';
import { UserService } from './../../../services/user.service';
import { IDropdownSettings, MultiSelectComponent } from 'ng-multiselect-dropdown';


@Component({
  selector: 'app-public-design-form',
  templateUrl: './public-design-form.component.html',
  styleUrls: ['./public-design-form.component.scss']
})
export class PublicDesignFormComponent implements OnInit {

  today;

  currentUser: any;

  designRequest: DesignRequestModel;
  selected_status: DesignRequestStatusModel;
  dropdowns: {
    iglesias: any[],
    statuses: DesignRequestStatusModel[],
    types: DesignRequestTypesModel[],
    priorities: DesignRequestTypesModel[];
    modules: DesignRequestTypesModel[];
  } = {
      iglesias: [],
      statuses: [],
      types: [],
      priorities: [],
      modules: []
    };
  users: any[] = [];

  iglesia: any;
  isEdit: boolean = false;

  serverBusy = false;

  @Output('onDismiss') onDismiss = new EventEmitter();
  @ViewChild('multi_select') multi_select: MultiSelectComponent;
  @ViewChild('multi_select_users') multi_select_users: MultiSelectComponent;

  selectOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,

  };

  selectUsersOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idUsuarioSistema',
    textField: 'fullName',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,

  };

  fixIdProject(event) {
    this.designRequest.idIglesia = event.idIglesia;
    this.onSelectIglesia(event.idIglesia);
  }

  fixIdUser(event) {
    this.designRequest.assignedTo = event.idUsuarioSistema;
  }

  constructor(
    private designRequestService: DesignRequestService,
    private domSanitizer: DomSanitizer,
    private ngZone: NgZone,
    private userService: UserService,
    private organizationService: OrganizationService
  ) {
    this.today = moment().format('YYYY-MM-DD');
    this.designRequest = new DesignRequestModel();
    // this.isEdit = this.navParams.get('isEdit');
    this.dropdowns.iglesias = [];
    this.dropdowns.statuses = [];
    this.dropdowns.types = [];
    this.dropdowns.priorities = [];
    this.dropdowns.modules = [];
  }

  ngOnInit() {
    this.selected_status = undefined;
    this.currentUser = this.userService.getCurrentUser();
    this.currentUser.isSuperUser = false;
    const promises = [];
    promises.push(this.designRequestService.getDesignRequestDropdown().toPromise());
    if (this.currentUser.isSuperUser || this.designRequest.is_help_request) {
      promises.push(this.organizationService.getUsers().toPromise());
    } else {
      promises.push(this.getUsersAsPromise());
    }
    this.multi_select.selectedItems = [];
    this.multi_select_users.selectedItems = [];
    Promise.all(promises)
      .then((response: any) => {
        const status = new DesignRequestStatusModel();
        status.idDesignRequestStatus = 0;
        status.name = '-- Select --';
        const type = new DesignRequestTypesModel();
        type.idDesignRequestType = 0;
        type.id = 0;
        type.name = '-- Select --';
        this.dropdowns.iglesias = response[0].iglesias;
        if (!this.currentUser.isSuperUser) {
          this.dropdowns.iglesias = this.dropdowns.iglesias.filter(x => x.idIglesia === this.currentUser.idIglesia);
          this.multi_select.writeValue(this.dropdowns.iglesias.filter(x => x.idIglesia === this.currentUser.idIglesia));
          this.fixIdProject({ idIglesia: this.currentUser.idIglesia });
        }
        this.dropdowns.statuses = response[0].statuses;
        this.dropdowns.statuses.unshift(status);
        this.dropdowns.types = response[0].types;
        this.dropdowns.types.unshift(type);
        this.dropdowns.priorities = response[0].priorities;
        this.dropdowns.priorities.unshift(type);
        this.dropdowns.modules = response[0].modules;
        this.dropdowns.modules.unshift(type);

        if (response[1].msg.Code === 200) {
          this.users = response[1].users;
        } else {
          this.users = [];
        }
        const user = {
          idUserType: 0,
          idUsuarioSistema: 0,
          nombre: '-- Select',
          apellido: ' All --',
          fullName: '-- Select All --'
        };
        this.users.unshift(user);
        if (this.isEdit) {
          this.multi_select.writeValue(this.dropdowns.iglesias.filter(x => x.idIglesia === this.designRequest.idIglesia));
          this.multi_select_users.writeValue(this.users.filter(x => x.idUsuarioSistema === this.designRequest.assignedTo));
          this.selected_status = this.dropdowns.statuses.find(x => x.idDesignRequestStatus == this.designRequest.idDesignRequestStatus);
        }
      }, err => {
        console.error(err);
        this.designRequestService.api.showToast('Something failed trying to get the data... Please try again.', ToastType.error);
      });
  }

  addQuantity(qty: number) {
    this.designRequest.quantity += qty;
  }

  dismiss(response?) {
    this.multi_select.selectedItems = [];
    this.multi_select_users.selectedItems = [];
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
  }

  onSelectIglesia(event) {
    this.iglesia = this.dropdowns.iglesias.filter(iglesia => {
      return iglesia.idIglesia === Number(event);
    })[0];
  }

  validateInputs(designRequest: DesignRequestModel) {
    const validate = {
      success: false,
      message: 'Success'
    };

    if (designRequest.title === '') {
      validate.message = 'You have to add a title of the design.';
    } else if (designRequest.idIglesia === 0) {
      validate.message = 'You need to select a Church/Organization.';
    } else if (designRequest.idDesignRequestStatus === 0) {
      validate.message = 'You need to select a Status.';
    } else if (designRequest.idDesignRequestType === 0) {
      validate.message = 'You need to select a type of request.';
    } else if (designRequest.description === '') {
      validate.message = 'You have to add a note/description of the design.';
    } else if (designRequest.quantity <= 0) {
      validate.message = 'The requests quantity should has to be greater than 0.';
    } else if (!designRequest.idUser && designRequest.idUser !== undefined) {
      validate.message = 'There is something wrong with your user';
    } else {
      if (this.selected_status.idDesignRequestParentStatus === 1) {
        if (designRequest.quantity <= 0) {
          validate.message = 'The requests quantity should has to be greater than 0.';
          return validate;
        }
        if (!designRequest.designerCriteria) {
          if (designRequest.specifiedColors === '') {
            validate.message = `You have to write the specified colores when you don't select the 'Designer Criteria' option.`;
            return validate;
          }
        }
        if (designRequest.idDesignRequestType === 7) {
          if (designRequest.other === '') {
            validate.message = 'You have to write the other type.';
            return validate;
          }
        }
      } else {
        if (designRequest.platform == '') {
          validate.message = `You need to select a platform`;
          return validate;
        }
        if (designRequest.idDesignRequestModule === 0) {
          validate.message = `You need to select a module.`;
          return validate;
        }
      }
      if (designRequest.description === '') {
        validate.message = 'You have to add a note/description of the design.';
        return validate;
      }
      validate.success = true;
    }
    return validate;
  }

  checkCriteria(event) {
    if (event) {
      if (this.designRequest.specifiedColors !== '') {
        const confirmation = confirm(`The specified colors will be lose. Continue?`);
        if (confirmation) {
          this.designRequest.specifiedColors = '';
        } else {
          setTimeout(() => {
            this.designRequest.designerCriteria = false;
          });
        }
      }
    }
  }

  fixUrl(image: DesignRequestImageModel) {
    if (image.type === 'image') {
      if (image.blob) {
        return image.blob;
      } else {
        return image.url;
      }
    } else {
      return '/assets/img/file-image.png';
    }
  }

  removeImage(imageArray: DesignRequestImageModel[], image: DesignRequestImageModel) {
    const index = imageArray.indexOf(image);
    imageArray.splice(index, 1);
  }

  showActionSheet(idDesignRequestImageType: number, input_file) {
    const a = new DesignRequestImageModel();
    a.idDesignRequestImageType = idDesignRequestImageType;

    this.ngZone.run(() => {
      if (input_file) {
        input_file.onchange = (event: { target: { files: FileList } }) => {

          Array.from(event.target.files).forEach(file => {
            a.file = file;
            a.idUser = this.currentUser.idUsuario;
            if (file.type.includes('image')) {
              a.type = 'image';
            } else {
              a.type = 'file';
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
              a.blob = reader.result as any;
              if (idDesignRequestImageType === 1) {
                this.designRequest.useImages.push(a);
              } else {
                this.designRequest.referenceImages.push(a);
              }
            };
          });
        };
      }
      input_file.click();
    });
  }

  submit(designRequest: DesignRequestModel) {
    this.serverBusy = true;
    designRequest.idUser = this.currentUser.idUsuario;
    const validate = this.validateInputs(designRequest);
    if (validate.success) {
      const promises = [];
      this.designRequest.images = [];
      if (!this.isEdit) {

        // tslint:disable-next-line: max-line-length
        this.designRequest.images = this.designRequest.images.concat(this.designRequest.useImages).concat(this.designRequest.referenceImages);

        this.designRequest.images.forEach(image => {
          promises.push(new Promise((resolve, reject) => {
            const indexPoint = (image.file.name as string).lastIndexOf('.');
            const extension = (image.file.name as string).substring(indexPoint);
            const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
            ).toString(36);
            const myUniqueFileName = ticks + extension;
            return resolve(this.organizationService.uploadFile(image.file, this.iglesia, myUniqueFileName, 'designRequest'));
          }));
        });
      }
      Promise.all(promises)
        .then(responses => {
          for (let index = 0; index < responses.length; index++) {
            this.designRequest.images[index].url = `${responses[index].file_info.src_path}`;
            this.designRequest.images[index].blob = undefined;
          }
          if (!this.isEdit) {
            this.designRequestService.addDesignRequest(designRequest)
              .subscribe(response => {
                this.designRequestService.api.showToast('Record saved correctly', ToastType.success);
                this.dismiss(response);
                this.serverBusy = false;
              }, err => {
                console.error(JSON.stringify(err));
                this.designRequestService.api.showToast('Error saving the designRequest', ToastType.error);
                /** CLEANING IMAGES */
                const images = [];
                responses.forEach(imgResponse => {
                  const img = {
                    url: imgResponse.response
                  };
                  images.push(img);
                });
                this.organizationService.deleteImages(images)
                  .subscribe(respnseDel => { });
              });
            this.serverBusy = false;
          } else {
            this.designRequestService.updateDesignRequest(designRequest)
              .subscribe(response => {
                this.designRequestService.api.showToast('Record saved correctly', ToastType.success);
                this.dismiss(response);
                this.serverBusy = false;
              }, err => {
                console.error(err);
                this.designRequestService.api.showToast('Error saving the designRequest', ToastType.error);
                this.serverBusy = false;
              });
          }
        }).catch(errors => {
          console.error(JSON.stringify(errors));
          this.serverBusy = false;
        });
    } else {
      this.serverBusy = false;
      this.designRequestService.api.showToast(validate.message, ToastType.info, 'Ups!');
    }
  }

  getUsersAsPromise() {
    return new Promise((resolve, reject) => {
      this.organizationService.api.get('getUsuarios', { idIglesia: this.currentUser.idIglesia })
        .subscribe((data: any) => {
          data.usuarios.map(user => {
            user.idUsuarioSistema = user.idUsuario;
            user.fullName = `${user.nombre} ${user.apellido}`;
          });
          data.users = data.usuarios;
          return resolve(data);
        }, error => {
          return reject([]);
        });
    });
  }

  setSelectedStatus() {
    this.selected_status = this.dropdowns.statuses.find(x => x.idDesignRequestStatus == this.designRequest.idDesignRequestStatus);
  }

}
