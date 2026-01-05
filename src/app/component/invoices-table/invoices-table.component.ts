import { EventEmitter, Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { ChatLogService } from 'src/app/chat-log.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { StripeErrors } from 'src/app/pages/donations/donations-v2/donations-v2.component';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-invoices-table',
  templateUrl: './invoices-table.component.html',
  styleUrls: ['./invoices-table.component.scss']
})
export class InvoicesTableComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('hide_title') hide_title: boolean;
  @Input('origin') origin: string;

  @Output('on_add') on_add: EventEmitter<any> = new EventEmitter<any>();

  options = {
    dates: {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      idField: 'value',
      textField: 'name'
    },
    organizations: {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      idField: 'idIglesia',
      textField: 'Nombre'
    },
  }

  dropdowns: {
    organizations: OrganizationModel[],
    dates: {
      name: string;
      value: string;
    }[];
  } = {
      organizations: [],
      dates: []
    }

  invoices: any[] = [];

  filter_form: FormGroup = this.form_builder.group({
    period: new FormControl(undefined, Validators.required),
    selected_period: new FormControl(),
    organization: new FormControl(undefined, Validators.required),
    selected_organization: new FormControl(undefined),
    status: new FormControl('unpaid')
  });

  email_setup_form: FormGroup = this.form_builder.group({
    email: new FormControl(undefined, [Validators.required])
  });

  loading: boolean = true;
  processing: boolean = false;

  constructor(
    private chat_log_service: ChatLogService,
    private form_builder: FormBuilder,
    private modal_service: NgxSmartModalService,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.idOrganization) {
      this.filter_form.get('selected_organization').setValue(this.idOrganization);
    }
    this.getDropdows();
    this.getInvoices();
  }

  async getInvoices() {
    this.loading = true;
    const filter = this.filter_form.value;
    const payload: Partial<{
      status: string;
      idOrganization: number;
      period: string;
    }> = {}
    if (filter.status) {
      payload.status = filter.status;
    }
    if (filter.selected_organization) {
      payload.idOrganization = filter.selected_organization;
    }
    if (filter.selected_period) {
      payload.period = filter.selected_period;
    }
    const response: any = await this.chat_log_service.getInvoices(payload).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.invoices = response;
    }
    this.loading = false;
  }

  async getDropdows() {
    const response: any = await this.chat_log_service.getDashboardDropdows().toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.dropdowns = response;
      // const actual_period = this.dropdowns.dates.find(x => x.value === period);
      // if (!actual_period) {
      //   this.dropdowns.dates.unshift({
      //     name: moment.utc().format('MMM YYYY'),
      //     value: period
      //   });
      // }
      // this.filter_form.get('period').setValue(this.dropdowns.dates.filter(x => x.value === period))
    }
  }

  setValue(event, key: 'organization' | 'period') {
    this.filter_form.get(`selected_${key}`).setValue(key === 'organization' ? event.idIglesia : event.value);
  }
  clearValue(key: 'organization' | 'period') {
    this.filter_form.get(`selected_${key}`).setValue(undefined);
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${environment.serverURL}${image}`;
    }
    return '/assets/img/default-image.jpg';
  }

  selected_id_organization: number;
  has_more_cards: boolean = false;
  invoice_to_attempt: any;
  available_emails: { email: string }[] = [];

  async payInvoice(invoice) {
    this.processing = true;
    const response: any = await this.chat_log_service.payInvoice(invoice).toPromise()
      .catch(async error => {
        console.error(error);
        if (error.error.status_code == 422) {
          let decline_message = StripeErrors[error.error.message];
          this.chat_log_service.api.showToast(decline_message, ToastType.error);
          this.selected_id_organization = invoice.idOrganization;

          this.has_more_cards = error.error.payment_methods > 0;
          this.invoice_to_attempt = invoice;
          await this.getPaymentMethods();
          this.modal_service.get('choose_after_action').open();
        }
        return;
      });
    if (response) {
      if (response.undelivered) {
        this.available_emails = await this.chat_log_service.api.get(`iglesias/contact_info/available_emails`, {
          idOrganization: invoice.idOrganization,
        }).toPromise<any>();
        let message = `This organization does not have a default email address to send your receipt to.`;
        if (this.available_emails.length !== 0) {
          message = `${message} Please select one from the list.`;
          this.modal_service.get('setup_email').open();
          this.invoice_to_attempt = invoice;
          this.selected_type = 'receipt';
        }
        this.selected_id_organization = invoice.idOrganization;
        this.chat_log_service.api.showToast(message, ToastType.info);
      }
      this.getInvoices();
      if (invoice.retry) {
        this.handleModalClose(this.modal_service.get('choose_after_action'));
      }
    }
    this.processing = false;
  }

  async sendInvoice(invoice) {
    this.processing = true;
    const response: any = await this.chat_log_service.sendInvoice(invoice).toPromise()
      .catch(async error => {
        console.error(error);
        if (error.error.status_code == 422) {
          this.available_emails = await this.chat_log_service.api.get(`iglesias/contact_info/available_emails`, {
            idOrganization: invoice.idOrganization,
          }).toPromise<any>();
          let message = `This organization does not have a default email address to send your invoice to.`;
          if (this.available_emails.length !== 0) {
            message = `${message} Please select one from the list.`;
            this.modal_service.get('setup_email').open();
            this.invoice_to_attempt = invoice;
            this.selected_type = 'invoice';
          }
          this.selected_id_organization = invoice.idOrganization;
          this.chat_log_service.api.showToast(message, ToastType.info);
        }
        return;
      });
    if (response) {
      this.handleModalClose(this.modal_service.get('choose_after_action'));
      this.chat_log_service.api.showToast(`Info sent to client`, ToastType.success);
    }
    this.processing = false;
  }

  payment_methods_arr: any[] = [];
  payment_methods: FormArray = new FormArray([]);
  selected_type: 'receipt' | 'invoice';

  async getPaymentMethods() {
    const response: any = await this.chat_log_service.getPaymentMethods({
      idOrganization: this.selected_id_organization
    }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.payment_methods_arr = response;
      this.payment_methods_arr = this.payment_methods_arr.filter(x => !x.is_default_method);
      while (this.payment_methods.length != 0) {
        this.payment_methods.removeAt(0);
      }
      this.payment_methods_arr.forEach(card => {
        // const card = method.card;
        const payment_info = new FormGroup({
          last4: new FormControl(card.last_4_digits),
          brand: new FormControl(card.brand),
          exp_month: new FormControl(card.exp_month),
          exp_year: new FormControl(card.exp_year),
          id: new FormControl(card.id),
          zip_code: new FormControl(),
          selected: new FormControl(false),
          set_as_default: new FormControl(card.is_default_method)
        });
        this.payment_methods.push(payment_info);
      });
    }
  }

  handleModalClose(choose_after_action?: NgxSmartModalComponent) {
    if (choose_after_action) {
      choose_after_action.close();
      this.selected_id_organization = undefined;
      this.has_more_cards = false;
      this.invoice_to_attempt = undefined;
    }
    // if (this.router.url.includes('create')) {
    //   this.router.navigateByUrl(`/ document - builder / update / ${ this.document_id }`);
    // } else {
    //   this.getDocument();
    // }
  }

  selectCard(card: any) {
    this.payment_methods_arr.forEach(x => {
      x.selected = false;
    });
    card.selected = true;
  }

  tryToPayAgain() {
    const selected_card = this.payment_methods_arr.find(x => x.selected);
    if (selected_card) {
      this.invoice_to_attempt.card_id = selected_card.id;
      this.invoice_to_attempt.retry = true;
      this.payInvoice(this.invoice_to_attempt);
    } else {
      this.chat_log_service.api.showToast(`Please select a card.`, ToastType.info);
    }
  }

  goToAddPayment(choose_after_action: NgxSmartModalComponent) {
    choose_after_action.close();
    if (this.origin == 'billing') {
      this.on_add.emit();
    } else {
      this.router.navigateByUrl(`/ billing / ${this.selected_id_organization} / payment_methods`);
    }
  }

  async printInvoice(invoice) {
    this.processing = true;

    const response: any = await this.chat_log_service.printReceipt(invoice).toPromise()
      .catch(error => {
        console.error(error);
        this.processing = false;
        this.chat_log_service.api.showToast(`Something went wrong while trying to get the receipt`, ToastType.error);
        return;
      });
    if (response) {
      const contentType: string = response.headers.get("Content-Type");
      let fileBlob = new Blob([response.body], { type: contentType });

      const fileData = window.URL.createObjectURL(fileBlob);

      // Generate virtual link
      let link = document.createElement("a");
      link.href = fileData;
      link.download = `receipt_${invoice.unique_id}_${invoice.name}.pdf`;
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
      setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(fileData);
        link.remove();
        this.processing = false;
      }, 100);

    }
  }

  onPrintEvent(event) {
  }

  dismissSetupModal() {
    this.modal_service.get('setup_email').close();
    this.selected_id_organization = undefined;
    this.invoice_to_attempt = undefined;
    this.available_emails = [];
    this.selected_type = undefined;
    this.email_setup_form.get('email').setValue(undefined);
  }

  async setEmail() {
    const payload = {
      email: this.email_setup_form.get('email').value,
      idOrganization: this.selected_id_organization,
      resend: true,
      id: this.invoice_to_attempt.id,
      type: this.selected_type
    }
    const response = await this.chat_log_service.setDefaultEmail(payload).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.dismissSetupModal();
    }
  }

  async deleteInvoices() {
    await this.chat_log_service.deleteInvoices().toPromise();
    this.getInvoices();
  }

  async generateInvoices() {
    this.processing = true;
    await this.chat_log_service.generateInvoices().toPromise();
    this.getInvoices();
    this.processing = false;
  }
}
