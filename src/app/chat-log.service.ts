import { Injectable } from '@angular/core';
import { ApiService } from './services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ChatLogService {

  constructor(
    public api: ApiService
  ) {

  }


  getDashboardDropdows(payload?: any) {
    return this.api.get('chat/log/dashboard/settings', payload);
  }

  getInvoices(payload?: any) {
    return this.api.get('chat/log/dashboard/invoices', payload);
  }

  getPaymentMethods(payload: { idOrganization: number; }) {
    return this.api.post('chat/log/dashboard/invoices/payment_methods', payload);
  }

  attachPaymentMethod(payload: { payment_id: string; idOrganization: number; created_by: number; set_as_default: boolean; }) {
    return this.api.post('chat/log/dashboard/invoices/payment_methods/attach', payload);
  }

  setDefaultPaymentMethod(payload: { id: any; idOrganization: number; }) {
    return this.api.post('chat/log/dashboard/invoices/payment_methods/default', payload);
  }
  setDefaultEmail(payload: { email: any; idOrganization: number; }) {
    return this.api.post('chat/log/dashboard/invoices/email/default', payload);
  }
  payInvoice(invoice: any) {
    return this.api.post(`chat/log/dashboard/invoices/${invoice.id}/pay`, invoice);
  }

  sendInvoice(invoice: any) {
    return this.api.post(`chat/log/dashboard/invoices/${invoice.id}/send`, invoice);
  }

  printReceipt(invoice: any) {
    return this.api.post(`chat/log/dashboard/invoices/${invoice.id}/receipt`, invoice, { observe: "response", responseType: "ArrayBuffer" });
  }

  generateInvoices() {
    return this.api.post(`chat/log/dashboard/generate_invoices`, {});
  }
  deleteInvoices() {
    return this.api.delete(`chat/log/dashboard/delete_invoices`, {});
  }
}
