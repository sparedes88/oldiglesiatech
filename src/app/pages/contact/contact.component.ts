import { GoogleAddressComponent } from './../../component/google-places/google-places.component';
import { iglesia_tech_base_64 } from './../../models/Utility';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { Observable, Subject } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { DesignRequestService } from 'src/app/services/design-request.service';
import { SimpleMemberFormComponent } from './simple-member-form/simple-member-form.component';
import { Router } from '@angular/router';
import { UserOrganizationBudgetModel } from 'src/app/models/OrganizationModel';
import { ToastType } from 'src/app/login/ToastTypes';
import { Column, ColumnType, ExcelQueryCellInfoEventArgs, FilterSettingsModel, GridComponent, IFilter, PageSettingsModel, PdfQueryCellInfoEventArgs } from '@syncfusion/ej2-angular-grids';
import { DataManager, Predicate, Query, DataUtil } from '@syncfusion/ej2-data';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { PdfStandardFont, PdfFontFamily, PdfFontStyle } from '@syncfusion/ej2-pdf-export';
import * as moment from 'moment';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnDestroy, OnInit {
  @ViewChild('grid') public grid: GridComponent;
  @ViewChild('canvas') public canvas;
  toolbar = ['ExcelExport', 'PdfExport'];
  pageSettings: PageSettingsModel = {
    pageSize: 10,
    pageSizes: true
  }
  filterOptions: FilterSettingsModel = {
    showFilterBarOperator: true,
    showFilterBarStatus: true
  };

  currentUser: User; // Interfaces
  iglesias: any[] = [];
  budget: UserOrganizationBudgetModel;
  show_budget_form: boolean = false;
  budget_displayed: boolean = false;

  budget_form: FormGroup = new FormGroup({
    budget: new FormControl(0, [Validators.required, Validators.min(0)]),
    idOrganization: new FormControl(undefined, [Validators.required]),
    created_by: new FormControl(undefined, [Validators.required]),
  });
  // Use in datatable
  public totalContact: number;
  public contacts: any = [];
  public selectedContact: any;
  public fotoEstado: string;

  public selectCatOptions: any = {
    singleSelection: false,
    idField: 'name',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  loading: boolean = true;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
    private designRequestService: DesignRequestService,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  // @ViewChild(DataTableDirective)
  // dtElement: DataTableDirective;

  // Datatables
  // dtTrigger: Subject<any> = new Subject();
  // dtOptions: any = {
  //   dom: 'Blfrtip',
  //   lengthMenu: [10, 25, 50, 100, 250, 500],
  //   buttons: [
  //     { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
  //     { extend: 'print', className: 'btn btn-outline-citric btn-sm', action: this.print.bind(this) },
  //     { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
  //   ]
  // };

  // TODO future add this method in contact service

  // Method for make request to api
  getContacts(idIglesia: number) {
    this.loading = true;
    this.api.get(`getUsuarios`, { idIglesia })
      .subscribe(
        (contacts: any) => {
          this.restartTable();
          this.contacts = contacts.usuarios.filter(u => u.estatus === true);
          let categories = [];
          this.contacts.forEach(element => {
            element.full_name = `${element.nombre} ${element.apellido}`;
            element.categories.forEach(category => {
              categories.push(category);
            });
            this.updateLocation(element);
            console.log(element);
            console.log(element.full_address);

          });
          categories = categories.filter((v, i, a) => a.findIndex(t => (t === v)) === i);
          console.log(categories);
          categories.unshift({
            name: 'None'
          });
          categories.unshift({
            name: 'All'
          });
          this.dropdata = DataUtil.distinct(categories, 'name', true) as string[];
          console.log(this.dropdata);
          this.totalContact = this.contacts.length;
          this.loading = false;
        }, err => {
          console.error(err);
          this.loading = false;
        },
        () => {
          // this.dtTrigger.next();
          this.loading = false;
          this.userService.getContactsBudget(idIglesia)
            .subscribe((budget: any) => {
              this.budget = budget.budget;
            }, error => {
              console.error(error);
            });
        });
  }
  async updateLocation(member: any) {
    member.full_address = GoogleAddressComponent.formatFullAddress(member, ['calle', 'ciudad', 'provincia', 'zip', 'country'])
    if (!member.lat || !member.lat) {
      const pin_info = await GoogleAddressComponent.convert(member.full_address).catch(error => {
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

  ngOnDestroy() {
    // Use in Datatable
    // this.dtTrigger.unsubscribe();
  }

  // load data the pages
  ngOnInit() {
    // Obtain the idIglesia from currentUser of user.service
    this.cancelBudgetForm();
    // this.getIglesias().then(response => {
    //   this.getContacts(this.currentUser.idIglesia);
    // });
    this.getContacts(this.currentUser.idIglesia);
  }

  getIglesias() {
    return new Promise((resolve, reject) => {
      this.designRequestService.getDesignRequestDropdown()
        .subscribe((response: any) => {
          this.iglesias = response.iglesias;

          if (!this.currentUser.isSuperUser) {
            this.iglesias = this.iglesias.filter(x => x.idIglesia === this.currentUser.idIglesia);
          }
          return resolve(this.iglesias);
        }, error => {
          this.iglesias = [{
            idIglesia: 0,
            Nombre: 'All'
          }];
          return resolve(this.iglesias);
        });
    });
  }

  restartTable(): void {
    // if (this.dtElement.dtInstance) {
    //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //     dtInstance.destroy();
    //   });
    // }
  }


  openEditModal(member: any) {
    this.selectedContact = member;
    this.modal.getModal('editModal').open();
  }

  deleteUsuario(idUsuario) {
    if (confirm(`Delete this contact?`)) {
      this.api.post('deleteReactivateUsuario',
        {
          idUsuario,
          estatus: false,
          idIglesia: this.currentUser.idIglesia
        })
        .subscribe((data) => {
          this.getContacts(this.currentUser.idIglesia);
        });
    }
  }

  getPhoto(photo: string, gender) {

    if (photo && photo !== 'null') {
      if (photo.startsWith('http')) {
        // console.log(photo);
        return photo;
      }
      return `${environment.serverURL}${photo}`;
    }
    if (this.currentUser.logoPic) {
      return `${environment.serverURL}${this.currentUser.logoPic}`;
    }
    if (gender) {
      if (gender.substring(0, 2) === 'Ma') {
        return '/assets/img/img_avatar.png';
      } else {
        return '/assets/img/img_avatar_female.png';
      }
    }
    return '/assets/img/img_avatar.png';
  }

  showLogs(contact) {
    this.api.get(`users/logs/getLogs`, {
      idUserOrganization: contact.idUserOrganization,
      idIglesia: contact.idIglesia,
      idUser: contact.idUsuario
    })
      .subscribe(data => {
      }, error => {
        console.error(error);
      });
  }

  print() {
    const path: string = `${environment.apiUrl}/users/pdf?idIglesia=${this.currentUser.idIglesia}`;
    const win = window.open(path, '_blank');
    win.focus();
  }

  onModalEditDidDismiss(formAddModal: NgxSmartModalComponent, response) {
    formAddModal.close();
    if (response) {
      this.getContacts(this.currentUser.idIglesia);
      this.router.navigate([`contact/details/${response.idUsuario}`]);
    }
  }

  onModalEditOnlyLoadDidDismiss(formAddModal: NgxSmartModalComponent, response) {
    formAddModal.close();
    this.getContacts(this.currentUser.idIglesia);
  }

  addUser(formAddModal: NgxSmartModalComponent, user_form: SimpleMemberFormComponent) {
    formAddModal.open();
    this.getIglesias();
    user_form.user = undefined;
    user_form.ngOnInit();
    if (user_form.custom_select_country) {
      user_form.custom_select_country.getCountryForOrganization();
    }
    if (!this.currentUser.isSuperUser) {
      user_form.disableUnusedFields();
    }
  }

  iframeLang: String = 'en'
  linkLang: String = 'en'

  get iframeCode() {
    return {
      entry_point: '<div id="appRegistration"></div>',
      direct_link: `https://iglesiatech.app/register/organization/${this.currentUser.idIglesia}?lang=${this.linkLang}`,
      scripts: `
      <script>
      var IDIGLESIA = ${this.currentUser.idIglesia}
      var LANG = '${this.iframeLang}'
      </script>
      <script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"
        rel="stylesheet"
      />
      <script src="https://unpkg.com/dayjs@1.8.21/dayjs.min.js"></script>
      <link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/styles" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bulma@0.8.1/css/bulma.min.css"
      />
      <script
        src="https://kit.fontawesome.com/a617da3919.js"
        crossorigin="anonymous"
      ></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/v-mask/dist/v-mask.min.js"></script>
      <script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/vueFacebookLoginComponent"></script>
      <script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/vueCountryCode"></script>
      <script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/registration/scripts"></script>
      <style>.field{margin-bottom:.75rem}.main-app{padding:6px}.citric{background-color:#e65100!important;color:#fff!important}img.responsive-img{width:100%;height:auto}.flex-centered{display:flex;justify-content:center;align-items:center}.pd-2{padding:2em}</style>`
    }
  }

  setBudgetOpenForm() {
    const idOrganization = this.currentUser.idIglesia;
    const created_by = this.userService.getCurrentUser().idUsuario;
    let payload: any = {
      idOrganization,
      created_by,
      budget: 0
    };
    if (this.budget.idUserOrganizationBudget) {
      payload = {
        idOrganization,
        created_by,
        budget: this.budget.budget,
        idUserOrganizationBudget: this.budget.idUserOrganizationBudget
      };
      this.budget_form.addControl('idUserOrganizationBudget', new FormControl(undefined, [Validators.required]));
    } else {
      this.budget_form.removeControl('idUserOrganizationBudget');
    }
    this.budget_form.patchValue(payload);
    this.show_budget_form = true;
  }

  cancelBudgetForm() {
    this.budget_form.reset();
    this.show_budget_form = false;
  }

  saveBudget() {
    const value = this.budget_form.value;
    console.log(value);
    if (this.budget_form.valid) {
      let subscription: Observable<any>;
      if (value.idUserOrganizationBudget) {
        subscription = this.userService.updateContactsBudget(value);
      } else {
        subscription = this.userService.addContactsBudget(value);
      }
      const subscriptable = subscription.subscribe(response => {
        this.ngOnInit();
        this.userService.api.showToast(`Budget saved successfully.`, ToastType.success);
      }, error => {
        this.userService.api.showToast(`Error saving the budget.`, ToastType.error);
      });
    } else {
      // get errors
      console.log(this.budget_form.errors);
    }
  }

  onColumnMenuClick(event) {
    this.grid.refreshColumns();
  }

  async toolbarClick(args: ClickEventArgs) {
    switch (args.item.text) {
      case 'PDF Export':
        (this.grid.columns[0] as Column).visible = false;
        (this.grid.columns[1] as Column).visible = false;
        (this.grid.columns[7] as Column).visible = false;
        this.toDataUrl(this.getCompanyLogo(), (base_64_obj) => {
          const base_64 = base_64_obj.base_64;
          const resize = this.getResize(base_64_obj);
          this.grid.pdfExport({
            theme: {
              header: {
                fontSize: 16,
                bold: true,
                fontName: 'Calibri',
                border: {
                  color: '#000000', dashStyle: 'Solid'
                },
                fontColor: '#e65100'
              },
            },
            header: {
              fromTop: 0,
              height: 160,
              contents: [
                {
                  type: 'Text' as any,
                  value: 'CONTACTS REPORT',
                  position: {
                    x: 10,
                    y: 65
                  },
                  size: {
                    height: 35,
                    width: 1100
                  },
                  style: {
                    hAlign: 'Left' as any,
                    fontSize: 22
                  },
                  font: new PdfStandardFont(PdfFontFamily.Helvetica, 20, PdfFontStyle.Bold) as any
                },
                {
                  type: 'Text' as any,
                  value: `DATE: ${moment().format('MMM/DD/YYYY')}`,
                  position: {
                    x: 10,
                    y: 95
                  },
                  size: {
                    height: 20,
                    width: 1100
                  },
                  style: {
                    hAlign: 'Left' as any,
                    fontSize: 12,
                    textBrushColor: '#808080'
                  },
                  font: new PdfStandardFont(PdfFontFamily.Helvetica, 12, PdfFontStyle.Regular) as any
                },
                {
                  type: 'Image' as any,
                  src: base_64,
                  position: {
                    x: 1000,
                    y: 10
                  },
                  size: {
                    height: resize.height,
                    width: resize.width
                  }
                }
              ]
            },
            footer: {
              fromBottom: 10,
              height: 80,
              contents: [
                {
                  type: 'Image' as any,
                  src: iglesia_tech_base_64,
                  position: {
                    x: 0,
                    y: 0
                  },
                  size: {
                    height: 50,
                    width: 84
                  },
                  style: {
                    vAlign: 'Middle'
                  }
                },
                {
                  type: 'PageNumber',
                  pageNumberType: 'Arabic',
                  format: 'Page {$current} of {$total}',
                  position: { x: 10, y: 60 },
                  style: { textBrushColor: '#585858', fontSize: 15 }
                },
              ]
            },
            pageOrientation: 'Landscape',
            pageSize: 'Legal',
          });
        })
        this.grid.refreshColumns();
        break;
      case 'Excel Export':
        (this.grid.columns[0] as Column).visible = false;
        (this.grid.columns[1] as Column).visible = false;
        (this.grid.columns[7] as Column).visible = false;
        await this.grid.excelExport({
          theme: {
            header: {
              fontSize: 16,
              bold: true,
              fontName: 'Calibri',
              fontColor: '#e65100'
            },
          },
        });
        break;
      case 'CSV Export':
        this.grid.csvExport();
        break;
    }
  }

  pdfExportComplete(): void {
    // (this.grid.columns[0] as Column).visible = true;
    (this.grid.columns[1] as Column).visible = true;
    (this.grid.columns[7] as Column).visible = true;
    this.grid.refreshColumns();
  }

  getResize(original_obj: { base_64: string, height: number, width: number }) {
    const desired_height = 130;
    const percent = desired_height / original_obj.height;
    original_obj.height = original_obj.height * percent;
    original_obj.width = original_obj.width * percent;
    return original_obj;
  }

  getCompanyLogo() {
    let url;
    if (this.currentUser && this.currentUser.logoPic) {
      return `${environment.serverURL}${this.currentUser.logoPic}`;
    }
    console.log(this.currentUser);

    return 'assets/img/default-image.jpg';
  }

  toDataUrl(url, callback) {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        const image = new Image();
        image.onload = () => {
          canvas.height = image.naturalHeight;
          canvas.width = image.naturalWidth;
          ctx.drawImage(image, 0, 0);
          const base_64 = canvas.toDataURL(`image/jpeg`) as string;
          const result = base_64.replace(`data:image/jpeg;base64,`, '');
          callback({
            base_64: result,
            height: image.naturalHeight,
            width: image.naturalWidth
          });
        }
        image.src = reader.result as string;
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  dataBound() {
    this.grid.autoFitColumns();
  }

  excelQueryCellInfo(args: ExcelQueryCellInfoEventArgs): void {
    args.style = {
      fontSize: 16
    }
    if (args.column.field === 'categories') {
      args.value = (args.data as any).categories.map(port => port.name).join(', ');
      // args.style.fontSize = 16;
    }
  }

  pdfQueryCellInfo(args: PdfQueryCellInfoEventArgs): void {
    args.style = {
      fontSize: 16
    };
    if (args.column.field === 'name') {
      args.style = {
        textBrushColor: '#1abb9c',
        fontSize: 16
      };
    }
    if (args.column.field === 'categories') {
      args.value = (args.data as any).categories.map(port => port.name).join(', ');
      // args.style.fontSize = 16;
    }
    if (args.column.field === 'production') {
      // pink
      args.style = {
        textBrushColor: '#ff1493',
      };
    }
    if (args.column.field === 'man_days_allotted') {
      args.style = {
        textBrushColor: '#1abb9c',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'mandays_spent') {
      // orange
      args.style = {
        textBrushColor: '#e75b26',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'man_days_remaining') {
      // red
      args.style = {
        textBrushColor: '#cc3030',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'regular_cost') {
      // blue
      args.style = {
        textBrushColor: '#3498db',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'overtime_cost') {
      args.style = {
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'estimated_cost_usd') {
      // green
      args.style = {
        textBrushColor: '#1abb9c',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'daily_produce_summary.labor_cost') {
      // blue
      args.style = {
        textBrushColor: '#3498db',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'labor_cost_remaining_usd') {
      // red
      args.style = {
        textBrushColor: '#cc3030',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'total_production') {
      // blue
      args.style = {
        textBrushColor: '#3498db',
      };
    }
    if (args.column.field === 'project_production') {
      // green
      args.style = {
        textBrushColor: '#1abb9c',
        textAlignment: 'Right'
      };
    }
    args.style.fontSize = 16;
  }

  queryCellInfo(args: any): void {
    if (args.column.field === 'name') {
      args.cell.color = '#1abb9c';
    }
  }

  formatManday = (field: string, data1: object, column: object) => {
    return `${data1[field]} MD`;
  }

  formatAggregateManday = (field: string, data1: object, column: object) => {
    return `${data1[field]} MD`;
  }

  public fields: object = { text: 'name', value: 'name' };
  public height = '220px';
  public dropdata: string[] = [];

  onChange(event) {
    console.log(event);
    if (event.value) {
      if (event.value === 'None') {
        this.grid.dataSource = this.contacts.filter(user => !user.categories || user.categories.length === 0);
      } else if (event.value === 'All') {
        this.grid.dataSource = this.contacts;
      } else {
        this.grid.dataSource = this.contacts.filter(user => user.categories.filter(cat => cat.name.toLowerCase().includes(event.value.toLowerCase())).length > 0);
      }
    } else {
      this.grid.dataSource = this.contacts;
    }
  }

  onFilterTextBoxChanged(event) {
    const query = event.target.value;
    if (query === "" || query === undefined) {
      this.grid.dataSource = this.contacts;
    } else {
      let predicate: Predicate;
      for (let index = 0; index < this.grid.columns.length; index++) {
        const column = this.grid.columns[index];
        if (index === 0) {
          predicate = new Predicate((column as Column).field, 'contains', query, true, true);
        } else {
          if ((column as Column).field) {
            if ((column as Column).visible) {
              predicate = predicate.or((column as Column).field, 'contains', query, true, true)
            }
          }
        }
      }
      new DataManager(this.contacts).executeQuery(new Query().where(predicate)).then((e: any) => {
        this.grid.dataSource = e.result;
      })
    }
  }
}
