import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { PdfStandardFont, PdfFontFamily, PdfFontStyle } from '@syncfusion/ej2-pdf-export';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Column, ExcelQueryCellInfoEventArgs, FilterSettingsModel, GridComponent, PageSettingsModel, PdfQueryCellInfoEventArgs } from '@syncfusion/ej2-angular-grids';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { BreezeService } from 'src/app/services/breeze.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { iglesia_tech_base_64 } from 'src/app/models/Utility';
import * as moment from 'moment';
import { MaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-breeze-home',
  templateUrl: './breeze-home.component.html',
  styleUrls: ['./breeze-home.component.scss']
})
export class BreezeHomeComponent implements OnInit {

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
  loading: boolean = true;
  contacts: any[];

  api_form: FormGroup = this.form_builder.group({
    breeze_api_key: new FormControl('', [Validators.required]),
    breeze_sub_domain: new FormControl('', [Validators.required])
  });

  show_form: boolean = false;
  current_user: User;
  processing: boolean = false;

  constructor(
    private breeze: BreezeService,
    private form_builder: FormBuilder,
    private user_service: UserService,
    private mask: MaskPipe
    ) {
    // mask="(000) 000-0000"
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.getSetup();
  }

  async getSetup() {
    this.loading = true;
    const response = await this.breeze.getSetup().catch(error => {
      console.error(error);
      return;
    });
    if (response) {
      if (response.code == 200) {
        this.getPeople();
        console.log(response);
        this.api_form.patchValue({
          breeze_api_key: response.secret,
          breeze_sub_domain: response.subdomain
        });
      } else {
        this.breeze.api.showToast(`Your organization isn't connected to Breeze API.`, ToastType.info);
        this.show_form = true;
      }
    }
  }

  async saveSetup() {
    if (this.api_form.invalid) {
      this.breeze.api.showToast(`Please fill all the fields`, ToastType.info);
      return;
    }
    this.loading = true;
    const payload = this.api_form.value;
    const response = await this.breeze.saveSetup(payload).catch(error => {
      console.error(error);
      return;
    });
    if (response) {
      if (response.code == 200) {
        this.show_form = false;
        this.getSetup();
      }
    }
    this.loading = false;
  }

  closeForm() {
    this.show_form = false;
  }

  async getPeople() {
    this.loading = true;
    const response = await this.breeze.getPeople().catch(error => {
      console.error(error);
      return;
    });
    if (response) {
      console.log(response);
      this.contacts = response
    }
    this.loading = false;
  }

  dataBound() {
    this.grid.autoFitColumns();
  }

  getPhoto(photo: string, gender) {

    if (photo && photo !== 'null') {
      if (photo.startsWith('http')) {
        // console.log(photo);
        return photo;
      }
      return `${environment.serverURL}${photo}`;
    }
    if (this.current_user.logoPic) {
      return `${environment.serverURL}${this.current_user.logoPic}`;
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

  onColumnMenuClick(event) {
    this.grid.refreshColumns();
  }

  pdfExportComplete(): void {
    // (this.grid.columns[0] as Column).visible = true;
    (this.grid.columns[1] as Column).visible = true;
    (this.grid.columns[7] as Column).visible = true;
    this.grid.refreshColumns();
  }

  getCompanyLogo() {
    let url;
    if (this.current_user && this.current_user.logoPic) {
      return `${environment.serverURL}${this.current_user.logoPic}`;
    }
    console.log(this.current_user);

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


  getResize(original_obj: { base_64: string, height: number, width: number }) {
    const desired_height = 130;
    const percent = desired_height / original_obj.height;
    original_obj.height = original_obj.height * percent;
    original_obj.width = original_obj.width * percent;
    return original_obj;
  }

  onChange(event) {
    console.log(event);
    // if (event.value) {
    //   if (event.value === 'None') {
    //     this.grid.dataSource = this.contacts.filter(user => !user.categories || user.categories.length === 0);
    //   } else if (event.value === 'All') {
    //     this.grid.dataSource = this.contacts;
    //   } else {
    //     this.grid.dataSource = this.contacts.filter(user => user.categories.filter(cat => cat.name.toLowerCase().includes(event.value.toLowerCase())).length > 0);
    //   }
    // } else {
    //   this.grid.dataSource = this.contacts;
    // }
  }

  syncUserWithIglesiaTech(contact) {
    this.processing = true;
    console.log(contact);
    const group = this.getForm();

    // const country_code = this.coun

    console.log(group);
    if(contact.name){
      if(contact.name.first){
        group.get('nombre').setValue(contact.name.first);
      }
      if(contact.name.last){
        group.get('apellido').setValue(contact.name.last);
      }
    }
    if(contact.phones){
      if(contact.phones.length > 0){
        const phone = contact.phones[0].number;
        const form_control = new FormControl(phone);
        const format_phone = this.mask.transform(phone, '(000) 000-0000');
        console.log(phone);
        console.log(form_control);
        console.log(format_phone);
        group.get('telefono').setValue(format_phone);
      }
    }
    if(contact.email){
      if(contact.email.address){
        group.get('email').setValue(contact.email.address);
      }
    }
    console.log(group);

    setTimeout(() => {
      this.processing = false;
    }, 2500);
  }

  getForm(): FormGroup {
    return this.form_builder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      // tslint:disable-next-line: max-line-length
      email: ['', [Validators.required, Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required, Validators.minLength(6)]],
      pass: [''],
      reset_password: [false],
      calle: [''],
      ciudad: [''],
      provincia: [''],
      zip: [''],
      isSuperUser: false,
      isNewUser: false,
      login_type: '',
      idIglesia: new FormControl(this.current_user.idIglesia, [Validators.required]),
      telefono: ['', Validators.required],
      country_code: ['', Validators.required],
      idUserType: new FormControl(2, [Validators.required]),
      is_available: new FormControl(false, [Validators.required, Validators.pattern(/^(?:1|y(?:es)?|t(?:rue)?|on)$/i)])
    });
  }

}
