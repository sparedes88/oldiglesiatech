import { PackageModel, PackageVersionModel, VersionModel } from './../../../models/VersionModel';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { Socket } from 'ngx-socket-io';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { VersionFormComponent } from '../version-form/version-form.component';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ResourceModel } from 'src/app/models/RessourceModel';
import { NgxDropzoneComponent, NgxDropzoneImagePreviewComponent } from 'ngx-dropzone';

@Component({
  selector: 'app-version-panel-manager',
  templateUrl: './version-panel-manager.component.html',
  styleUrls: ['./version-panel-manager.component.scss']
})
export class VersionPanelManagerComponent implements OnInit {

  @ViewChild('version_form') version_form: VersionFormComponent;
  @ViewChild('drop_112') drop_112: NgxDropzoneComponent;
  @ViewChild('preview') preview: NgxDropzoneImagePreviewComponent;

  currentUser: User;

  idIdentifier: number;
  versions: VersionModel[] = [];
  app_package: PackageVersionModel;

  loading: boolean = true;
  wait_for_response: boolean = false;

  form_group: FormGroup = this.form_builder.group({
    idOrganization: new FormControl(undefined, [Validators.required]),
    organizations: new FormControl([]),
    lockIdOrganization: new FormControl(undefined, [Validators.required]),
    lockOrganizations: new FormControl([]),
    android_id: new FormControl('', []),
    apple_id: new FormControl('', []),
    versions: new FormArray([])
  });
  show_package_form: boolean = false;
  handle_as_lock: boolean = false;
  show_note_form: boolean = false;

  iglesias: any[] = [];
  selectCatOptions: any = {
    singleSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  resources_form: FormGroup = this.form_builder.group({
    errors: new FormGroup({
      icon: new FormControl(false),
      splash: new FormControl(false),
      android_graph: new FormControl(false),
      icon_512: new FormControl(false),
      icon_112: new FormControl(false),
      iphone_55: new FormControl(false),
      iphone_65: new FormControl(false),
      ipad: new FormControl(false)
    }),
    new: new FormGroup({
      icon: new FormControl(),
      splash: new FormControl(),
      android_graph: new FormControl(),
      icon_512: new FormControl(),
      icon_112: new FormControl(),
      iphone_55: new FormArray([]),
      iphone_65: new FormArray([]),
      ipad: new FormArray([]),
    }),
    previous: new FormGroup({
      icon: new FormControl(),
      splash: new FormControl(),
      android_graph: new FormControl(),
      icon_512: new FormControl(),
      icon_112: new FormControl(),
      iphone_55: new FormArray([]),
      iphone_65: new FormArray([]),
      ipad: new FormArray([]),
      res_iphone_55: new FormArray([]),
      res_iphone_65: new FormArray([]),
      res_ipad: new FormArray([]),
    }),
    previous_to_delete: new FormGroup({
      icon: new FormControl(),
      splash: new FormControl(),
      android_graph: new FormControl(),
      icon_512: new FormControl(),
      icon_112: new FormControl()
    })
  });

  constructor(
    private activated_route: ActivatedRoute,
    private api: ApiService,
    private form_builder: FormBuilder,
    private user_service: UserService,
    private socket: Socket,
    private modal_service: NgxSmartModalService,
    private fus: FileUploadService
  ) {
    this.idIdentifier = this.activated_route.snapshot.params.idIdentifier;
    this.currentUser = this.user_service.getCurrentUser();
  }
  get is_incomplete() {
    const new_group = this.resources_form.get('new') as FormGroup;
    const prev_group = this.resources_form.get('previous') as FormGroup;
    let incomplete = false;
    const new_value = new_group.value;
    const prev_value = prev_group.value;

    if (
      !new_value.splash && !prev_value.splash
      || (!new_value.icon && !prev_value.icon)
      || (!new_value.icon_112 && !prev_value.icon_112)
      || (!new_value.icon_512 && !prev_value.icon_512)
      || (!new_value.android_graph && !prev_value.android_graph)
    ) {
      return true;
    }
    if (new_value.iphone_65.concat(prev_value.iphone_65).length < 3) {
      return true;
    }
    if (new_value.iphone_55.concat(prev_value.iphone_55).length < 3) {
      return true;
    }
    if (new_value.ipad.concat(prev_value.ipad).length < 3) {
      return true;
    }
    return incomplete;
  }

  get is_ready() {
    if (this.app_package) {
      if (this.app_package.resources) {
        return this.app_package.resources.is_ready;
      }
    }
    return false;
  }

  get first_reason() {
    const new_group = this.resources_form.get('new') as FormGroup;
    const prev_group = this.resources_form.get('previous') as FormGroup;
    const new_value = new_group.value;
    const prev_value = prev_group.value;

    if (!new_value.splash && !prev_value.splash) {
      return 'Splash';
    }
    if (!new_value.icon && !prev_value.icon) {
      return 'Icon (1024x1024)';
    }
    if (!new_value.icon_112 && !prev_value.icon_112) {
      return 'Icon (112x112)';
    }
    if (!new_value.icon_512 && !prev_value.icon_512) {
      return 'Icon (512x512)';
    }
    if (!new_value.android_graph && !prev_value.android_graph) {
      return 'Android Graph';
    }
    if (new_value.iphone_65.concat(prev_value.iphone_65).length < 3) {
      return 'At least 3 screens for iPhone 6.5"';
    }
    if (new_value.iphone_55.concat(prev_value.iphone_55).length < 3) {
      return 'At least 3 screens for iPhone 5.5"';
    }
    if (new_value.ipad.concat(prev_value.ipad).length < 3) {
      return 'At least 3 screens for iPad"'
    }
  }

  get versions_array() {
    return this.form_group.get('versions') as FormArray;
  }

  get errors() {
    return this.resources_form.get('errors').value as {
      icon: boolean;
      splash: boolean;
      android_graph: boolean;
      icon_512: boolean;
      icon_112: boolean;
      iphone_55: boolean;
      iphone_65: boolean;
      ipad: boolean;
    }
  }

  get splash() {
    if (this.resources_form.get('new').get('splash').value) {
      return this.resources_form.get('new').get('splash').value as File;
    } else if (this.resources_form.get('previous').get('splash').value) {
      return this.resources_form.get('previous').get('splash').value as File;
    } else {
      return;
    }
  }
  set splash(file: File) {
    const prev_value = this.resources_form.get('previous').get('splash').value;

    this.resources_form.get('new').get('splash').setValue(file);
  }

  get icon() {
    if (this.resources_form.get('new').get('icon').value) {
      return this.resources_form.get('new').get('icon').value as File;
    } else if (this.resources_form.get('previous').get('icon').value) {
      return this.resources_form.get('previous').get('icon').value as File;
    } else {
      return;
    }
  }
  set icon(file: File) {
    this.resources_form.get('new').get('icon').setValue(file);
  }
  get icon_512() {
    if (this.resources_form.get('new').get('icon_512').value) {
      return this.resources_form.get('new').get('icon_512').value as File;
    } else if (this.resources_form.get('previous').get('icon_512').value) {
      return this.resources_form.get('previous').get('icon_512').value as File;
    } else {
      return;
    }
  }
  set icon_512(file: File) {
    this.resources_form.get('new').get('icon_512').setValue(file);
  }
  get icon_112() {
    if (this.resources_form.get('new').get('icon_112').value) {
      return this.resources_form.get('new').get('icon_112').value as File;
    } else if (this.resources_form.get('previous').get('icon_112').value) {

      return this.resources_form.get('previous').get('icon_112').value as File;
    } else {
      return;
    }
  }
  set icon_112(file: File) {
    this.resources_form.get('new').get('icon_112').setValue(file);
  }
  get android_graph() {
    if (this.resources_form.get('new').get('android_graph').value) {
      return this.resources_form.get('new').get('android_graph').value as File;
    } else if (this.resources_form.get('previous').get('android_graph').value) {
      return this.resources_form.get('previous').get('android_graph').value as File;
    } else {
      return;
    }
  }
  set android_graph(file: File) {
    this.resources_form.get('new').get('android_graph').setValue(file);
  }

  ngOnInit() {
    this.getPackageDetail();
    this.getIglesias();
  }

  async getPackageDetail() {
    this.loading = true;
    const response: any = await this.api.get(`versions/packages/${this.idIdentifier}`).toPromise()
      .catch(error => {
        this.loading = false;
        console.error(error);
        return;
      });
    if (response) {
      this.app_package = response;
      this.form_group.get('apple_id').setValue(this.app_package.apple_id);
      this.form_group.get('android_id').setValue(this.app_package.android_id);
      this.cleanVersionArray();
      this.app_package.versions.forEach(version => {
        const group = this.form_builder.group({
          id: new FormControl(version.id, [Validators.required]),
          ready_for_apple: new FormControl(version.ready_for_apple),
          ready_for_android: new FormControl(version.ready_for_android),
          change_log: new FormControl(version.change_log),
          version: new FormControl(version.version),
          major: new FormControl(version.major),
          minor: new FormControl(version.minor),
          patch: new FormControl(version.patch),
          is_mandatory: new FormControl(version.is_mandatory)
        });
        group.patchValue(group);
        this.versions_array.push(group);
      });
      if (this.app_package.organization) {
        this.form_group.get('idOrganization').setValue(this.app_package.organization.idOrganization);
        this.form_group.get('lockIdOrganization').setValue(this.app_package.organization.idOrganization);
        const organizations = this.iglesias.filter(x => x.idIglesia === this.app_package.organization.idOrganization);
        this.form_group.get('organizations').setValue(organizations);
        this.form_group.get('lockOrganizations').setValue(organizations);
      }
      if (this.app_package.resources) {
        const keys = Object.keys(this.app_package.resources);
        const array_keys = ['iphone_65', 'iphone_55', 'ipad'];
        for (const key of keys) {
          if (key != 'id' && key != 'is_ready' && key != 'partial_ready') {
            if (array_keys.includes(key)) {
              const array = this.resources_form.get('previous').get(key) as FormArray;
              const res_array = this.resources_form.get('previous').get(`res_${key}`) as FormArray;
              while (array.length > 0) {
                array.removeAt(0);
                res_array.removeAt(0);
              }
              for (let file of this.app_package.resources[key]) {
                const file_element: ResourceModel = file;
                if (JSON.stringify(file_element) !== '{}') {
                  const file = await this.convertSourceToBlob(file_element);
                  // const fixed_key = this.indexes[key];
                  // this.resources_form.get('previous').get(fixed_key).setValue(file);
                  const group = new FormControl(file, []);
                  let idScreenSize: number;
                  if (key === 'iphone_65') {
                    idScreenSize = 1;
                  } else if (key === 'iphone_55') {
                    idScreenSize = 2;
                  } else if (key === 'ipad') {
                    idScreenSize = 3;
                  }
                  const res_group = new FormControl(
                    {
                      idScreenSize,
                      idResource: file_element.id,
                    }, [])
                  array.push(group);
                  res_array.push(res_group);
                }
              }
            } else {
              const file_element: ResourceModel = this.app_package.resources[key];
              if (JSON.stringify(file_element) !== '{}') {
                const file = await this.convertSourceToBlob(file_element);
                const fixed_key = this.indexes[key];
                this.resources_form.get('previous').get(fixed_key).setValue(file);
              }
            }
          }
        };
      }

      this.loading = false;
    }
  }

  async convertSourceToBlob(file_element: ResourceModel) {
    let response = await fetch(`${environment.serverURL}${file_element.src_path}`);
    let data = await response.blob();
    let metadata = {
      type: file_element.mime_type
    };
    let file = new File([data], file_element.filename, metadata);
    return file;
  }

  async getIglesias() {
    const response: any = await this.api.get(`iglesias/getIglesias`, { minimal: true }).toPromise();
    if (response) {
      this.iglesias = response.iglesias;
      if (this.app_package) {
        if (this.app_package.organization) {
          this.form_group.get('idOrganization').setValue(this.app_package.organization.idOrganization);
          this.form_group.get('lockIdOrganization').setValue(this.app_package.organization.idOrganization);
          const organizations = this.iglesias.filter(x => x.idIglesia === this.app_package.organization.idOrganization);
          this.form_group.get('organizations').setValue(organizations);
          this.form_group.get('lockOrganizations').setValue(organizations);
        }
      }
    }
  }

  cleanVersionArray() {
    while (this.versions_array.length > 0) {
      this.versions_array.removeAt(0);
    }
  }

  async toggle(platform: 'apple' | 'android', record, i) {
    this.wait_for_response = true;
    const version_obj = record.value as PackageVersionModel;
    let key = `ready_for_${platform}`;
    const value = version_obj[key];
    const response: any = await this.api.post(`versions/packages/${this.idIdentifier}/version/${version_obj.id}/release/${platform}`, {
      value,
      created_by: this.currentUser.idUsuario
    }).toPromise()
      .catch(error => {
        console.error(error);
        this.wait_for_response = false;
        return;
      });
    if (response) {
      const data = {
        platform,
        version: version_obj.version,
        value
      }
      const package_obj = {
        app_package: this.app_package.app_package
      }
      this.socket.emit('new-version-available', package_obj, data);
      await this.getPackageDetail()
      this.wait_for_response = false;
    }
  }

  getPicture(picture: string) {
    if (!picture) {
      return 'assets/img/logoColor_jpg.jpg';
    }
    return `${environment.serverURL}${picture}`;
  }

  setOrganization() {
    if (this.handle_as_lock) {
      const selected_organization = this.form_group.get('lockOrganizations').value.map(x => x.idIglesia);
      if (selected_organization.length > 0) {
        this.form_group.get('lockIdOrganization').setValue(selected_organization[0]);
      } else {
        this.form_group.get('lockIdOrganization').setValue(undefined);
      }
    } else {
      const selected_organization = this.form_group.get('organizations').value.map(x => x.idIglesia);
      if (selected_organization.length > 0) {
        this.form_group.get('idOrganization').setValue(selected_organization[0]);
      } else {
        this.form_group.get('idOrganization').setValue(undefined);
      }
    }
  }

  cancelForm() {
    this.show_package_form = false;
    this.handle_as_lock = false;
  }

  async save() {
    const payload: PackageModel = this.form_group.value;
    payload.created_by = this.currentUser.idUsuario;
    const call_obj: Partial<{
      method: Observable<any>,
      msg_success: string,
      msg_error: string;
    }> = {};
    call_obj.method = this.api.patch(`versions/packages/${this.idIdentifier}`, payload);

    const response = await call_obj.method.toPromise()
      .catch(error => {
        this.api.showToast(call_obj.msg_error, ToastType.error);
        return;
      });
    if (response) {
      this.api.showToast(call_obj.msg_success, ToastType.success);
      // this.close();
      this.getPackageDetail();
      this.show_package_form = false;
    }

  }

  async handleSaveClick() {
    if (this.handle_as_lock) {
      this.toggleLock(true);
    } else {
      await this.save();
    }
  }

  setState(type: 'cancel' | 'maintainance') {
    let condition: boolean = type == 'cancel' ? this.app_package.configuration.isCancelled : this.app_package.configuration.isMaintained;
    if (condition) {
      this.toggleCancelApp('activate', type, false);
    } else {
      this.toggleCancelApp('cancel', type, true);
    }
  }

  setLock() {
    if (this.app_package.configuration.isLocked) {
      this.toggleLock(false)
    } else {
      this.show_package_form = true;
      this.handle_as_lock = true;
    }
  }

  toggleCancelApp(socket_event: 'activate' | 'cancel', type: 'cancel' | 'maintainance', value: boolean) {
    const event = `${socket_event}-application`;
    let estatus_identificador_text, traduccionKey, idEstatusIdentificador;
    if (type == 'cancel') {
      estatus_identificador_text = 'isCancelled';
      traduccionKey = 'Aplicacion_Estado_Cancelled';
      idEstatusIdentificador = 2;
    } else {
      estatus_identificador_text = 'isMaintained';
      traduccionKey = 'Aplicacion_Estado_Maintained';
      idEstatusIdentificador = 3;
    }
    const app_configuration = {
      hideChangeIglesia: false,
      app_package: this.app_package.app_package
    }
    const estatus_identificador = {
      value,
      traduccionKey,
      idEstatusIdentificador,
      estatus_identificador: estatus_identificador_text,
      canClose: false,
      isPersistent: true
    }
    this.socket.emit(event, app_configuration, estatus_identificador);
    if (type == 'cancel') {
      this.app_package.configuration.isCancelled = value;
    } else {
      this.app_package.configuration.isMaintained = value;
    }
  }

  toggleLock(value: boolean) {
    let event_name: string = 'change-application';
    if (!value) {
      event_name = `unlock-${event_name}`;
    }
    const app_configuration = {
      hideChangeIglesia: false,
      app_package: this.app_package.app_package
    }
    var estatus_identificador = {
      estatus_identificador: 'isLocked',
      value: true,
      traduccionKey: 'Aplicacion_Estado_Locked',
      idEstatusIdentificador: 1,
      canClose: true,
      isPersistent: false
    }
    if (!value) {
      this.socket.emit(event_name, app_configuration, estatus_identificador);
      this.app_package.configuration.isLocked = value;
    } else {
      const idOrganization = this.form_group.get('lockIdOrganization').value;

      if (idOrganization) {
        var iglesia = {
          Nombre: "PRUEBA DE IGLESIA",
          idIglesia: idOrganization,
          topic: ""
        }
        this.socket.emit('change-iglesia', app_configuration, iglesia, estatus_identificador);
        this.app_package.configuration.isLocked = value;
        this.show_package_form = false;
        this.handle_as_lock = false;
      } else {
        this.api.showToast(`Please select an organization`, ToastType.info);
        return;
      }
    }
    this.getPackageDetail();
  }

  openNoteModal(record, i) {
    this.show_note_form = true;
    setTimeout(() => {
      if (this.version_form) {
        this.modal_service.get('form_note_edit_modal').open();
        this.version_form.setVersion(record.value);
      }
    }, 200);
  }

  closeModal(refresh: boolean) {
    this.modal_service.get('form_note_edit_modal').close();
    this.show_note_form = false;
    if (refresh) {
      this.getPackageDetail();
    }
  }

  async onSelect(idScreenSize: number, event: any) {
    let key: 'iphone_65' | 'iphone_55' | 'ipad';
    let resolution: {
      height: number;
      width: number;
    };
    if (idScreenSize == 1) {
      key = 'iphone_65';
      resolution = {
        height: 2778,
        width: 1284
      };
    } else if (idScreenSize === 2) {
      key = 'iphone_55';
      resolution = {
        height: 2208,
        width: 1242
      };
    } else {
      key = 'ipad';
      resolution = {
        height: 2732,
        width: 2048
      };
    }
    let files: File[] = [];
    let has_error = false;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const file: File = event.addedFiles[index];
      const img = await this.addImageProcess(file, resolution);
      if (img.pass) {
        files.push(file);
      } else {
        has_error = true;
      }
    }
    if (has_error) {
      this.api.showToast(`Some images hasn't the correct size screen. The images have to have the next resolution ${resolution.height} x ${resolution.width}.`, ToastType.error);
      this.resources_form.get('errors').get(`${key}`).setValue(true);
      setTimeout(() => {
        this.resources_form.get('errors').get(`${key}`).setValue(false);
      }, 5000);
    }
    // event.addedFiles.forEach(file => {
    // });
    const array = this.resources_form.get('new').get(key) as FormArray;
    files.forEach((file: File) => {
      const group = new FormControl(file, [])
      array.push(group);
    });
  }

  onRemove(idScreenSize: number, f) {
    let key: 'iphone_65' | 'iphone_55' | 'ipad';
    if (idScreenSize == 1) {
      key = 'iphone_65';
    } else if (idScreenSize === 2) {
      key = 'iphone_55';
    } else {
      key = 'ipad';
    }
    let form_array = this.resources_form.get('new').get(key) as FormArray;
    let array: File[] = form_array.value;
    let index = array.indexOf(f);
    if (index < 0) {
      form_array = this.resources_form.get('previous').get(key) as FormArray;
      array = form_array.value;
      index = array.indexOf(f);
      const previous_res = this.resources_form.get('previous').get(`res_${key}`) as FormArray;
      previous_res.removeAt(index);
    }
    form_array.removeAt(index);
  }

  async onSelectResources(key: 'icon' | 'splash' | 'icon_512' | 'icon_112' | 'android_graph', event: any, drop, preview) {
    let width, height: number;
    if (key === 'icon') {
      width = 1024;
      height = 1024;
    }
    if (key === 'splash') {
      width = 2732;
      height = 2732;
    }
    if (key === 'icon_512') {
      width = 512;
      height = 512;
    }
    if (key === 'icon_112') {
      width = 112;
      height = 112;
    }
    if (key === 'android_graph') {
      width = 1024;
      height = 500;
    }
    if (event.addedFiles.length > 0) {
      const resolution = {
        width,
        height
      };
      const file: File = event.addedFiles[0];
      const img = await this.addImageProcess(file, resolution);
      if (img.pass) {
        const previous_obj = this.resources_form.get('previous').get(key).value;
        this.resources_form.get('previous').get(key).setValue(undefined);
        this[key] = undefined;
        setTimeout(() => {
          this[key] = file;
          this.resources_form.get('previous').get(key).setValue(previous_obj);
        }, 100);
        this.resources_form.get('errors').get(key).setValue(false);
      } else {
        this.resources_form.get('errors').get(key).setValue(true);
      }
    }
  }

  removeResource(key: 'icon' | 'splash' | 'icon_512' | 'icon_112' | 'android_graph') {
    const previous_obj = this.resources_form.get('previous').get(key).value;
    this.resources_form.get('previous').get(key).setValue(undefined);

    const is_only_prev = previous_obj && !this[key];

    this[key] = undefined;
    setTimeout(() => {
      if (!is_only_prev) {
        this.resources_form.get('previous').get(key).setValue(previous_obj);
      } else {
        this.resources_form.get('previous_to_delete').get(key).setValue(true);
      }
    }, 100);
    if (this.errors[key]) {
      this.resources_form.get('errors').get(key).setValue(false);
    }
  }

  getFiles(idScreenSize: number) {
    let key: 'iphone_65' | 'iphone_55' | 'ipad';
    if (idScreenSize == 1) {
      key = 'iphone_65';
    } else if (idScreenSize === 2) {
      key = 'iphone_55';
    } else {
      key = 'ipad';
    }
    const prev_array = this.resources_form.get('previous').get(key) as FormArray;
    const array = this.resources_form.get('new').get(key) as FormArray;
    return prev_array.value.concat(array.value);
  }

  addImageProcess(file: File, resolution) {
    return new Promise<{
      height?: number;
      width?: number;
      pass?: boolean;
    }>((resolve, reject) => {
      let img = new Image()
      img.onerror = reject
      const fr = new FileReader();
      img.onload = () => {
        if (img.height === resolution.height && img.width === resolution.width) {
          resolve({
            height: img.height,
            width: img.width,
            pass: true
          });
        } else {
          resolve({
            pass: false
          });
        }
      }
      fr.onload = () => {
        img.src = fr.result as string;
      }
      fr.readAsDataURL(file);
    })
  }

  indexes = {
    'icon': 'idResourceIcon',
    'splash': 'idResourceSplash',
    'icon_512': 'idResourceIcon512',
    'icon_112': 'idResourceIcon112',
    'android_graph': 'idResourceAndroidGraph',
    file_info_icon: 'icon',
    file_info_splash: 'splash',
    file_info_icon512: 'icon_512',
    file_info_icon112: 'icon_112',
    file_info_android_graph: 'android_graph',
  }

  async submitImages() {
    this.wait_for_response = true;
    const new_group = this.resources_form.get('new');
    const new_data = new_group.value;
    const excluded_elements = ['ipad', 'iphone_55', 'iphone_65'];
    const controls_with_data = Object.keys(new_data).filter(x => !excluded_elements.includes(x)).map(x => new_group.get(x).value ? { name: x, control: new_group.get(x) } : undefined).filter(x => !!x);
    const payload: any = {};

    for (const form_control of controls_with_data) {
      const file = form_control.control.value as File;
      const response: any = await this.fus.uploadFile(file, true, `resources`).toPromise();
      const id_key = this.indexes[form_control.name];
      payload[id_key] = response.file_info.id;
    }
    payload.screen_sizes = [];
    for (const key of excluded_elements) {
      const form_array = new_group.get(key) as FormArray;
      const pictures = form_array.value as File[];
      let idScreenSize: number;
      if (key === 'iphone_65') {
        idScreenSize = 1;
      } else if (key === 'iphone_55') {
        idScreenSize = 2;
      } else if (key === 'ipad') {
        idScreenSize = 3;
      }
      for (const file of pictures) {
        const response: any = await this.fus.uploadFile(file, true, `resources/${key}`).toPromise();
        payload.screen_sizes.push({
          idScreenSize,
          idResource: response.file_info.id
        });
      }

      const previous_res = this.resources_form.get('previous').get(`res_${key}`) as FormArray;

      payload.screen_sizes = payload.screen_sizes.concat(previous_res.value);
    }
    const to_delete_with_data = Object.keys(this.resources_form.get('previous_to_delete').value).map(x => this.resources_form.get('previous_to_delete').get(x).value ? { name: x, value: this.resources_form.get('previous_to_delete').get(x).value } : undefined).filter(x => !!x);
    payload.remove = {};
    for (const form_control of to_delete_with_data) {
      if (form_control.value) {
        const id_key = this.indexes[form_control.name];
        payload.remove[id_key] = true;
      }
    }
    payload.created_by = this.currentUser.idUsuario;
    const response = await this.api.patch(`versions/packages/${this.idIdentifier}/resources/${this.app_package.resources.id}`, payload).toPromise()
      .catch(error => {
        console.error(error);
        this.wait_for_response = false;
        return;
      });
    if (response) {
      for (const key of excluded_elements) {
        const form_array = this.resources_form.get('new').get(key) as FormArray;
        while (form_array.length > 0) {
          form_array.removeAt(0);
        }
      }
      this.resources_form.get('new').reset();
      this.api.showToast(`Resources saved`, ToastType.success);
      await this.getPackageDetail();
      this.wait_for_response = false;
    }
  }

  async checkAsReady() {
    if (!this.is_incomplete) {

      const has_items_for_save = this.resources_form.get('new').value;
      if (
        has_items_for_save.splash
        || has_items_for_save.icon
        || has_items_for_save.icon_512
        || has_items_for_save.icon_112
        || has_items_for_save.android_graph
        || has_items_for_save.ipad.length > 0
        || has_items_for_save.iphone_55.length > 0
        || has_items_for_save.iphone_65.length > 0
      ) {
        this.submitImages();
      }
      const payload = {
        is_ready: true,
        created_by: this.currentUser.idUsuario
      }
      const response = await this.api.patch(`versions/packages/${this.idIdentifier}/resources/${this.app_package.resources.id}`, payload).toPromise()
        .catch(error => {
          console.error(error);
          this.wait_for_response = false;
          return;
        });
      if (response) {
        this.getPackageDetail();
      }
    }
  }

  async checkAsSent() {
    if (!this.is_incomplete) {

      const has_items_for_save = this.resources_form.get('new').value;
      if (
        has_items_for_save.splash
        || has_items_for_save.icon
        || has_items_for_save.icon_512
        || has_items_for_save.icon_112
        || has_items_for_save.android_graph
        || has_items_for_save.ipad.length > 0
        || has_items_for_save.iphone_55.length > 0
        || has_items_for_save.iphone_65.length > 0
      ) {
        this.submitImages();
      }
      const payload = {
        is_submitted: true,
        created_by: this.currentUser.idUsuario
      }
      const response = await this.api.patch(`versions/packages/${this.idIdentifier}/resources/${this.app_package.resources.id}`, payload).toPromise()
        .catch(error => {
          console.error(error);
          this.wait_for_response = false;
          return;
        });
      if (response) {
        this.getPackageDetail();
      }
    }
  }

  async createResourcesCall() {
    this.wait_for_response = true;
    const response: any = await this.api.post(`versions/packages/${this.idIdentifier}/resources/`, {
      created_by: this.currentUser.idUsuario
    })
      .toPromise()
      .catch(error => {
        console.error(error);
        this.wait_for_response = false;
        return;
      });
    if (response) {
      this.wait_for_response = false;
      this.getPackageDetail();
    }
  }

  async downloadFiles(is_partial?: boolean) {
    console.log(this.app_package);
    let url = `${environment.serverURL}/api/iglesiaTechApp/versions/packages/${this.idIdentifier}/resources/download`;
    if (is_partial) {
      url = `${url}-partial`
    }
    let response = await fetch(url);
    let blob = await response.blob();
    const fileBlob = new Blob([blob], { type: 'application/zip' });
    const fileData = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = fileData;
    let name = `resources_${this.app_package.app_package}.zip`;
    if (is_partial) {
      name = `partial_${name}`;
    }
    link.download = name;
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    setTimeout(() => {
      // For Firefox it is necessary to delay revoking the ObjectURL
      link.remove();
    }, 100);
  }

  async copyValue(value: any) {
    const blob = new Blob([value], { type: 'text/plain' })
    await window.navigator['clipboard'].write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    this.api.showToast(`${value} copied`, ToastType.success);
  }

  async copyDescription(package_item: any, is_long: boolean) {
    let description = `Accede a la aplicación móvil de [app]. Conéctate con ellos vía mobile e internet. Recibe las últimas prédicas, fotos, eventos y noticias de tu iglesia — en cualquier momento y cualquier lugar.`
    if (is_long) {
      description = `${description}

La app de [app] te facilita…
  * Ver los últimos sermones de [app].
  * Crear tu propio perfil para que puedas ver su crecimiento dentro de la iglesia.
  * Ver e interactuar con los eventos y ministerios.
  * Descubre maneras de involucrarte en [app].`;
    }
    const value = description.replace(/\[app\]/g, package_item.organization.name);
    const blob = new Blob([value], { type: 'text/plain' })
    await window.navigator['clipboard'].write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    this.api.showToast(`${value} copied`, ToastType.success);
  }
}
