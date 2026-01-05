import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { ApiService } from 'src/app/services/api.service';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

export class DonationFormModel {
  id: number;
  name: string;
  setup?: DonationSetupModel;
  idOrganization: number;
  created_by: number;
  deleted_by?: number;
}

export class DonationSetupModel {
  defaultIdDonationCategory: number;
  header_background: string;
  header_text_color: string;
  header_give_title: string;
  active_background: string;
  active_text_color: string;
  donation_gift_type_label: string;
  donation_type_label: string;
  concept_message: string;
  thank_you_disclaimer: string;
  email_subject: string;
  frequency_disclaimer_header: string;
  default_amount: number;
}

@Component({
  selector: 'app-donation-form-list',
  templateUrl: './donation-form-list.component.html',
  styleUrls: ['./donation-form-list.component.scss']
})
export class DonationFormListComponent implements OnInit {

  @Input('is_embed') is_embed: boolean;

  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  records: DonationFormModel[] = [];
  categories: any[] = [];
  show_form: boolean = false;
  currentUser: User;
  selected_id: number;

  organization: OrganizationModel;

  donation_form_form: FormGroup = this.form_builder.group({
    id: new FormControl(),
    name: new FormControl('', [Validators.required]),
    idOrganization: new FormControl(),
    created_by: new FormControl(),
    setup: new FormGroup({
      defaultIdDonationCategory: new FormControl(),
      header_background: new FormControl('#3f3f3f'),
      header_text_color: new FormControl('#ffffff'),
      header_give_title: new FormControl('Dar', [Validators.required]),
      active_background: new FormControl('#ddd'),
      active_text_color: new FormControl('#000'),
      donation_gift_type_label: new FormControl('Tipo de regalo'),
      donation_type_label: new FormControl('Tipo de donación'),
      concept_message: new FormControl('Donación a {organization_name}'),
      thank_you_disclaimer: new FormControl('tu donación a {organization_name}.'),
      email_subject: new FormControl('Gracias por tu donación'),
      frequency_disclaimer_header: new FormControl('Tus donaciones serán'),
      default_amount: new FormControl(0.00),
    })
  });

  loading: boolean = false;
  is_loading: boolean = true;

  params: any;

  constructor(
    private api: ApiService,
    private form_builder: FormBuilder,
    private user_service: UserService,
    private organization_service: OrganizationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUser = this.user_service.getCurrentUser();
    this.donation_form_form.get('idOrganization').setValue(this.currentUser.idIglesia);
    this.donation_form_form.get('created_by').setValue(this.currentUser.idUsuario);
    if(JSON.stringify(this.route.snapshot.queryParams) != '{}'){
      this.params = this.route.snapshot.queryParams;
    }
  }

  get back_url(){
    if(this.params){
      if(this.params.origin){
        return `/${this.params.origin}`;
      }
    }
    return '/donations/list';
  }

  async ngOnInit() {
    await this.getOrganization();
    this.getForms();
    this.getCategories();
  }

  async getOrganization() {
    const response: any = await this.organization_service.getOrganizationMinimal(this.currentUser.idIglesia).toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.organization = response.iglesia;
    }
  }

  async getForms() {
    this.is_loading = true;
    const response: any = await this.api.get('donations_v2/forms',
      {
        idIglesia: this.currentUser.idIglesia
      }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.records = response;
    }
    this.is_loading = false;
  }
  async getCategories() {
    const response: any = await this.api.get(`donations/categories`, { idIglesia: this.currentUser.idIglesia })
      .toPromise()
      .catch(error => {
        this.categories = [];
        return;
      });
    if (response) {
      this.categories = response.categories || [];
    }
  }

  openAddForm() {
    this.show_form = true;
    this.donation_form_form.reset();
    this.donation_form_form.get('setup').patchValue({
      defaultIdDonationCategory: undefined,
      header_background: '#3f3f3f',
      header_text_color: '#ffffff',
      header_give_title: 'Dar',
      active_background: '#ddd',
      active_text_color: '#000',
      donation_gift_type_label: 'Tipo de regalo',
      donation_type_label: 'Tipo de donación',
      concept_message: 'Donación a {organization_name}'.replace('{organization_name}', this.organization.Nombre),
      thank_you_disclaimer: 'tu donación a {organization_name}.'.replace('{organization_name}', this.organization.Nombre),
      email_subject: 'Gracias por tu donación',
      frequency_disclaimer_header: 'Tus donaciones serán',
      default_amount: 0.00,
    });
    this.donation_form_form.get('idOrganization').setValue(this.currentUser.idIglesia);
    this.donation_form_form.get('created_by').setValue(this.currentUser.idUsuario);
  }

  async openEditForm(item: DonationFormModel) {
    const response = await this.api.get(`donations_v2/forms/${item.id}`).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.donation_form_form.patchValue(response);
      this.show_form = true;
    } else {
      this.api.showToast(`Error getting the form. Please try again later.`, ToastType.error);
    }
  }

  async submitForm() {
    if (this.donation_form_form.invalid) {
      this.api.showToast(`Please fill all the required fields.`, ToastType.info);
      return;
    }
    this.loading = true;
    const payload = this.donation_form_form.value;
    payload.created_by = this.currentUser.idUsuario;
    let subscription: Observable<any>;
    if (payload.id) {
      subscription = this.api.patch(`donations_v2/forms/${payload.id}`, payload);
    } else {
      subscription = this.api.post(`donations_v2/forms/`, payload);
    }
    const response: any = await subscription.toPromise()
      .catch(error => {
        console.error(error);
        this.api.showToast(`Error saving the info.`, ToastType.error);
        return;
      });
    if (response) {
      this.api.showToast(`Info saved successfully.`, ToastType.success);
      this.show_form = false;
      this.getForms();
    }
    this.loading = false;
  }

  async deleteItem(item) {
    if (confirm('Are you sure you want to delete this form')) {
      const response: any = await this.api.delete(`donations_v2/forms/${item.id}?idIglesia=${this.currentUser.idIglesia}&deleted_by=${this.currentUser.idUsuario}`).toPromise()
        .catch(error => {
          console.error(error);
          this.api.showToast(`Error deleting form.`, ToastType.error);
          return;
        });
      if (response) {
        this.getForms();
        this.api.showToast(`Form deleted successfully.`, ToastType.success);
      }
    }
  }

  async shareQR(qr_code) {
    const element = qr_code.qrcElement.nativeElement;
    const img_child = element.firstChild;
    try {
      const imgURL = img_child.src;
      const data = await fetch(imgURL);
      const blob = await data.blob();
      await window.navigator['clipboard'].write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      this.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }

  }

  get iframeCode() {
    return {
      link: `${environment.server_calendar}/donations/${this.currentUser.idIglesia}/v2/${this.selected_id}?login=true`,
      embed: `<iframe
      src="${environment.server_calendar}/donations/${this.currentUser.idIglesia}/v2/${this.selected_id}?login=true"
      frameborder="0"
      id="donation_frame"
      height="800px"
      width="100%"
    ></iframe>`
    };
  }

  close(data?){
    this.on_close.emit(data);
  }

  goBack(){
    if(this.is_embed){
      this.close();
    } else {
      this.router.navigate([this.back_url]);
    }
  }
}
