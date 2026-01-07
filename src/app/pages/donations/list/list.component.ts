import { FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { iglesia_tech_base_64 } from 'src/app/models/Utility';
import {
  Column, FilterSettingsModel, GridComponent, PageSettingsModel, PdfQueryCellInfoEventArgs
}
  from '@syncfusion/ej2-angular-grids';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { PdfStandardFont, PdfFontFamily, PdfFontStyle } from '@syncfusion/ej2-pdf-export';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { ToastType } from 'src/app/login/ToastTypes';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ManualDonationFormComponent } from '../manual-donation-form/manual-donation-form.component';
import { StripeInfoModel } from '../donation.model';

export enum FREQUENCIES {
  'once' = 'Única vez',
  'weekly' = 'Semanal',
  'biweekly' = 'Cada 2 semanas',
  'monthly' = 'Mensual'
}
@Component({
  selector: 'app-donations-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListComponent implements OnInit {

  @ViewChild('manual_donation_form') manual_donation_form: ManualDonationFormComponent;
  @Input('stripe_info') stripe_info: StripeInfoModel;
  @Input('is_embed') is_embed: boolean;

  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();
  params: any;

  constructor(private api: ApiService,
    private userService: UserService,
    public route: ActivatedRoute,
    private form_builder: FormBuilder,
    private currency_pipe: CurrencyPipe
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }
  pageSettings: PageSettingsModel = {
    pageSize: 10,
    pageSizes: true
  }
  donation
  first_name = ''
  last_name = ''
  email = ''
  date: Date | string = new Date()
  currentUser: any; // Interfaces
  filterOptions: FilterSettingsModel = {
    showFilterBarOperator: true,
    showFilterBarStatus: true
  };
  public fields: object = { text: 'name', value: 'name' };
  public height = '220px';
  public dropdata: string[] = [];
  linkLang: String = 'en'
  //toolbar = ['ExcelExport', 'PdfExport'];
  @ViewChild('grid') public grid: GridComponent;
  @ViewChild('canvas') public canvas;
  public donations: any = [];
  summary: any[] = [];
  public totals: any

  contacts: any[] = [];
  categories: any[] = [];

  show_input: boolean = false;

  selectOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'email',
    textField: 'full_name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true
  };

  selectCategoriesOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idDonationCategory',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true
  };

  donation_form: FormGroup = this.form_builder.group(
    {
      idUser: new FormControl([]),
      idDonation: new FormControl(),
      idDonationCategory: new FormControl(),
    }
  );

  donation_filter_form: FormGroup = this.form_builder.group({
    from: new FormControl(moment().startOf('month').format('YYYY-MM-DD')),
    to: new FormControl(moment().endOf('month').format('YYYY-MM-DD')),
    category: new FormControl(''),
    search: new FormControl()
  });


  ngOnInit() {
    if (JSON.stringify(this.route.snapshot.queryParams) != '{}') {
      console.log(this.route.snapshot.queryParams);
      this.params = this.route.snapshot.queryParams;
      console.log(this.params);
    }
    if (!this.stripe_info) {
      this.checkStripeInfo();
    }
    this.getDonations()
    this.getContacts(this.currentUser.idIglesia);
    this.getDonationCategories();
  }

  get filtered_donations() {
    if (this.donation_filter_form.value.search) {
      const search_value: string = this.donation_filter_form.value.search;
      const lower = search_value.toLowerCase();

      return this.donations.filter(x => {
        return x.category_name.toLowerCase().includes(lower)
          || x.complete_name.toLowerCase().includes(lower)
          || x.email.toLowerCase().includes(lower)
          || x.amount.toString().includes(lower)
          || x.donation_type.toLowerCase().includes(lower)
      });
    }
    return this.donations;
  }

  getDonationCategories() {
    this.api.get(
      `donations/categories`,
      {
        idIglesia: this.currentUser.idIglesia
      }
    ).subscribe(
      (data: any) => {
        this.categories = data.categories;
      },
      err => { console.error(err); }
    );
  }


  getContacts(idIglesia: number) {
    this.api.get(`getUsuarios`, { idIglesia })
      .subscribe(
        (contacts: any) => {
          this.contacts = contacts.usuarios.filter(u => u.estatus === true);
          let categories = [];
          this.contacts.forEach(element => {
            element.full_name = `${element.nombre} ${element.apellido} (${element.email})`;
          });
        }, err => {
          console.error(err)
        });
  }

  validateEmail(email) {
    if (email) {
      var re = /\S+@\S+\.\S+/;
      return re.test(email);
    } else {
      return true
    }
  }
  getDonations() {
    const search_payload: Partial<{
      from: string;
      to: string;
      category: number;
      search: string;
      idUser: number;
      idIglesia: number;
    }> = {};
    const payload = this.donation_filter_form.value;
    console.log(search_payload)
    search_payload.idIglesia = this.currentUser.idIglesia;
    Object.keys(payload).forEach(x => {
      if (payload[x]) {
        search_payload[x] = payload[x];
      }
    });
    this.api
      .get(`donations_v2/organization/search`, search_payload)
      // this.api
      //   .get(`donations/getIglesiaDonations`, { idIglesia: this.currentUser.idIglesia })
      .subscribe((data: any) => {
        if (data.donations) {
          this.donations = data.donations;
          this.donations.forEach(element => {
            element.covered_fee == 1 ? element.is_covered = 'Yes' : element.is_covered = 'No'
            element.is_manual == 1 ? element.manual = 'Manual' : element.manual = 'Standard'
            element.user_assigned == 1 ? element.is_user_assigned = 'Yes' : element.is_user_assigned = 'No'
            element.date = String(element.date).split('T')[0] + ' ' + String(element.date).split('T')[1].split('.')[0]
            element.frequency = FREQUENCIES[element.frequency_key];
          });
          (this.grid.columns[1] as Column).width = '120'

          this.donations.sort(function (a, b) {
            return (a.date > b.date) ? -1 : ((a.date < b.date) ? 1 : 0);
          });
          this.totals = data.totals
        }
        this.getDonationsSummary();
      });
  }

  getDonationsSummary() {
    const search_payload: Partial<{
      from: string;
      to: string;
      category: number;
      search: string;
      idUser: number;
      idIglesia: number;
    }> = {};
    const payload = this.donation_filter_form.value;
    console.log(search_payload)
    search_payload.idIglesia = this.currentUser.idIglesia;
    Object.keys(payload).forEach(x => {
      if (payload[x]) {
        search_payload[x] = payload[x];
      }
    });
    this.api
      .get(`donations_v2/organization/summary`, search_payload)
      .subscribe((data: any) => {
        this.summary = data.totals;
      });
  }

  saveManualDonation() {
    const email = this.email ? this.email : this.currentUser.email
    const first_name = this.first_name ? this.first_name : this.currentUser.nombre
    const last_name = this.last_name ? this.last_name : this.currentUser.apellido
    let idDonationCategory;
    if (Array.isArray(this.donation_form.value.idDonationCategory)) {
      if (this.donation_form.value.idDonationCategory.length > 0) {
        idDonationCategory = this.donation_form.value.idDonationCategory[0].idDonationCategory;
      }
    }
    this.api
      .post(`donations/saveDonation`, {
        email: email,
        first_name: first_name,
        last_name: last_name,
        idIglesia: this.currentUser.idIglesia,
        amount: this.donation,
        date: this.date,
        idDonationCategory
      })
      .subscribe(
        (data: any) => {
          this.getDonations()
          this.donation = undefined
          this.first_name = ''
          this.last_name = ''
          this.email = ''
          this.date = new Date()
          this.api.showToast('Success', ToastType.success);
          this.donation_form.reset();
        },
        (err) => {
        }
      );
  }
  pdfExportComplete(): void {
    (this.grid.columns[0] as Column).visible = true;
    (this.grid.columns[1] as Column).visible = true;
    this.grid.refreshColumns();
  }
  onChange(event) {
    if (event.value) {
      if (event.value === 'None') {
        this.grid.dataSource = this.donations.filter(user => !user.categories || user.categories.length === 0);
      } else if (event.value === 'All') {
        this.grid.dataSource = this.donations;
      } else {
        this.grid.dataSource = this.donations.filter(user =>
          user.categories.filter(cat => cat.name.toLowerCase().includes(event.value.toLowerCase())).length > 0
        );
      }
    } else {
      this.grid.dataSource = this.donations;
    }
  }
  queryCellInfo(args: any): void {
    if (args.column.field === 'name') {
      args.cell.color = '#1abb9c';
    }

    // if (args.column.field === 'amount') {
    //   args.data.amount = this.currency_pipe.transform(args.data.amount, '$', 'symbol', '1.2-2');
    //   console.log(args);
    //   // args.style.fontSize = 16;
    // }
  }
  onColumnMenuClick(event) {
    this.grid.refreshColumns();
  }
  dataBound() {
    /*console.log(this.grid.width)
    this.grid.autoFitColumns();
    this.grid.autoFitColumns(['email', 'complete_name'])*/

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
    if (args.column.field === 'amount') {
      args.value = this.currency_pipe.transform(args.value, '$', 'symbol', '1.2-2');
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
  getCompanyLogo() {
    let url;
    if (this.currentUser && this.currentUser.logoPic) {
      return `${environment.serverURL}${this.currentUser.logoPic}`;
    }

    return 'assets/img/default-image.jpg';
  }
  getResize(original_obj: { base_64: string, height: number, width: number }) {
    const desired_height = 130;
    const percent = desired_height / original_obj.height;
    original_obj.height = original_obj.height * percent;
    original_obj.width = original_obj.width * percent;
    return original_obj;
  }
  toolbarClick(args: ClickEventArgs): void {
    switch (args.item.text) {
      case 'PDF Export':
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
        this.grid.excelExport();
        break;
      case 'CSV Export':
        this.grid.csvExport();
        break;
    }
  }
  get iframeCode() {
    return {
      entry_point: `<div style="width: 100%;">
      <div style="display: table; margin: 0 auto">
        <iframe
          src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/donations/organization/`+ this.currentUser.idIglesia + `?lang=${this.linkLang}"
          style="width: 704px; height: 404px; overflow:hidden;"
        >
        </iframe>
      </div>
    </div>`
    };
  }

  setEmail(event) {
    if (this.donation_form.get('idUser').value.length > 0) {
      const selection = this.donation_form.get('idUser').value[0];
      const user = this.contacts.find(x => x.email == selection.email);
      if (user) {
        this.first_name = user.nombre;
        this.last_name = user.apellido;
      }
    }
    this.email = event.email;
  }

  deleteDonation(id_donation) {
    if (confirm(`Are you sure yo want to delete this donation? This action can't be undone and the data will be missed.`)) {
      this.api.delete(`donations_v2/manual/${id_donation}`, { deleted_by: this.currentUser.idUsuario })
        .subscribe(response => {
          // this.getGroup();
          this.getDonations();
          this.api.showToast(`Donation deleted.`, ToastType.success);
        }, error => {
          console.error(error);
          this.api.showToast(`Error deleting donation.`, ToastType.error);
        });
    }
  }

  editDonation(donation) {
    // this.email = donacion.email;
    // this.first_name = donacion.first_name;
    // this.last_name = donacion.last_name;
    // this.date = moment(donacion.date).utc().format('YYYY-MM-DD');
    // this.donation = donacion.amount;
    // const user = this.contacts.filter(x => x.email === donacion.email);
    // if (user.length > 0) {
    //   this.donation_form.get('idUser').setValue(user);
    // }
    // const category = this.categories.filter(x => x.idDonationCategory === donacion.idDonationCategory);
    // if (category.length > 0) {
    //   this.donation_form.get('idDonationCategory').setValue(category);
    // } else {
    //   this.donation_form.get('idDonationCategory').setValue([]);
    // }
    // this.donation_form.get('idDonation').setValue(donacion.idDonacion);
    // this.donation_form.get('idDonation').setValue(donacion.idDonacion);
    this.show_input = true;
    setTimeout(() => {

      this.manual_donation_form.setDonation(donation);
    }, 100);
  }

  updateDonacion() {
    const email = this.email ? this.email : this.currentUser.email
    const first_name = this.first_name ? this.first_name : this.currentUser.nombre
    const last_name = this.last_name ? this.last_name : this.currentUser.apellido
    let idDonationCategory;
    if (Array.isArray(this.donation_form.value.idDonationCategory)) {
      if (this.donation_form.value.idDonationCategory.length > 0) {
        idDonationCategory = this.donation_form.value.idDonationCategory[0].idDonationCategory;
      }
    }
    if (this.donation_form.value)
      this.api
        .post(`donations/updateDonation`, {
          idDonacion: this.donation_form.get('idDonation').value,
          email: email,
          first_name: first_name,
          last_name: last_name,
          idIglesia: this.currentUser.idIglesia,
          amount: this.donation,
          date: this.date,
          idDonationCategory
        })
        .subscribe(
          (data: any) => {
            this.getDonations()
            this.donation = undefined
            this.first_name = ''
            this.last_name = ''
            this.email = ''
            this.date = new Date()
            this.api.showToast('Success', ToastType.success);
            this.donation_form.reset();
          },
          (err) => {
          }
        );
  }

  cancelDonation() {
    this.donation_form.get('idDonation').setValue(undefined);
    this.email = undefined;
    this.first_name = undefined;
    this.last_name = undefined;
    this.donation = undefined;
    this.donation_form.reset();
  }

  getWidth(grid) {
    const cols = grid.columns.filter(col => col.visible);
    const size_visible = cols.length;
    return `${size_visible * 220}px`
  }

  openForm() {
    this.show_input = true;
  }

  closeFormEvent(event) {
    this.show_input = false;
    if (event) {
      this.getDonations();
    }
  }


  async checkStripeInfo() {
    const response: any = await this.api.get('iglesias/getIglesiasProvidedTokens', { idIglesia: this.currentUser.idIglesia })
      .toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      const keys_info = response.iglesia;
      this.stripe_info = {
        hasPublicKey: keys_info.hasPublicKey,
        hasSecretKey: keys_info.hasSecretKey,
        is_possible_client: keys_info.is_possible_client
      }

    }
  }

  goBack(){
    this.on_close.emit();
  }

}
