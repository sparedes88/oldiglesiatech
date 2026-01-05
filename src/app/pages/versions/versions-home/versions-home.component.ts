import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { PackageVersionModel, VersionModel } from 'src/app/models/VersionModel';
import { ApiService } from 'src/app/services/api.service';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: 'app-versions-home',
  templateUrl: './versions-home.component.html',
  styleUrls: ['./versions-home.component.scss']
})
export class VersionsHomeComponent implements OnInit {

  views = {
    show_new_version: false,
    show_new_package: false
  }

  versions: PackageVersionModel[] = [];
  iglesias: OrganizationModel[] = [];
  plans: {
    idCatalogoPlan: number;
    nombre: string;
  }[] = [];

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

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

  filtersForm: FormGroup = this.form_builder.group({
    idOrganization: new FormControl([]),
    idPlanType: new FormControl([]),
    is_ready: new FormControl('all'),
    platform_ready: new FormControl('unset'),
    only_available: new FormControl(false),
  });

  selectOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'idIglesia',
    textField: 'Nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectPlanOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'idCatalogoPlan',
    textField: 'nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  current_user: User;

  constructor(
    private api: ApiService,
    private form_builder: FormBuilder,
    private organization_service: OrganizationService,
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.getVersions();
    this.getIglesias();
    this.getPlans();
  }

  get is_any_form_open() {
    return Object.keys(this.views).find(x => this.views[x]) ? true : false;
  }

  get filtered_versions() {
    let versions = [...this.versions];
    const idOrganizations = this.filtersForm.get('idOrganization').value;
    if (idOrganizations.length > 0) {
      const ids = idOrganizations.map(x => x.idIglesia);
      versions = versions.filter(x => ids.includes(x.idOrganization));
    }
    const idPlans = this.filtersForm.get('idPlanType').value;
    if (idPlans.length > 0) {
      const ids = idPlans.map(x => x.idCatalogoPlan);
      versions = versions.filter(x => ids.includes(x.idCatalogoPlan));
    }
    const ready_status: 'all' | 'partial' | 'true' | 'both' | 'false' = this.filtersForm.get('is_ready').value;
    if (ready_status !== 'all') {
      if (ready_status == 'partial') {
        versions = versions.filter(x => x.partial_ready);
      } else if (ready_status == 'both') {
        versions = versions.filter(x => x.is_ready || x.partial_ready);
      } else {
        const bool_status: boolean = JSON.parse(ready_status);
        if (bool_status) {
          versions = versions.filter(x => x.is_ready);
        } else {
          versions = versions.filter(x => !x.is_ready);
        }
      }
    }
    const platform_status: 'unset' | 'none' | 'android' | 'apple' | 'both' = this.filtersForm.get('platform_ready').value;
    if (platform_status != 'unset') {
      if (platform_status == 'none') {
        versions = versions.filter(x => !x.ready_for_android && !x.ready_for_apple);
      } else if (platform_status === 'android') {
        versions = versions.filter(x => x.ready_for_android);
      } else if (platform_status === 'apple') {
        versions = versions.filter(x => x.ready_for_apple);
      } else {
        //both
        versions = versions.filter(x => x.ready_for_android && x.ready_for_apple);
      }
    }

    const only_available = JSON.parse(this.filtersForm.get('only_available').value);
    console.log(only_available);
    if (only_available) {
      const ids = [14, 15];
      versions = versions.filter(x => !ids.includes(x.idCatalogoPlan) && !x.is_maintained && !x.is_cancelled);
    }
    return versions;
  }

  isInactiveOrTest(idPlanType) {
    const ids = [14, 15];
    return ids.includes(idPlanType);
  }

  openAddVersionForm() {
    Object.keys(this.views).forEach(x => this.views[x] = false);
    this.views.show_new_version = true;
  }

  openAddPackageForm() {
    Object.keys(this.views).forEach(x => this.views[x] = false);
    this.views.show_new_package = true;
  }

  async getVersions() {
    // this.restartTable();
    const response: any = await this.api.get('versions/packages').toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.versions = response;
    }
    // this.dtTrigger.next();
  }

  restartTable() {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }

  }

  async getIglesias() {
    const response: any = await this.api.get(`iglesias/getIglesias`, { minimal: true }).toPromise();
    if (response) {
      this.iglesias = response.iglesias;
    }
  }
  async getPlans() {

    const response: any = await this.organization_service.getPlans().toPromise();
    if (response) {
      this.plans = response.plans;
    }
  }

  getPicture(picture: string) {
    if (!picture) {
      return 'assets/img/logoColor_jpg.jpg';
    }
    return `${environment.serverURL}${picture}`;
  }

  async downloadFiles(app_package: PackageVersionModel, is_partial?: boolean) {
    let url = `${environment.serverURL}/api/iglesiaTechApp/versions/packages/${app_package.idIdentificador}/resources/download`;
    if (is_partial) {
      url = `${url}-partial`
    }
    let response = await fetch(url);
    let blob = await response.blob();
    const fileBlob = new Blob([blob], { type: 'application/zip' });
    const fileData = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = fileData;
    let name = `resources_${app_package.app_package}.zip`;
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

  handleClose(key: string, response?: any) {
    if (response) {
      this.getVersions();
    }
    this.views[key] = false;
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
    const value = description.replace(/\[app\]/g, package_item.organization_name);
    const blob = new Blob([value], { type: 'text/plain' })
    await window.navigator['clipboard'].write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    this.api.showToast(`${value} copied`, ToastType.success);
  }

}
