import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/services/api.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  base_url = environment.serverURL;

  @Input('setup') setup: any = {};
  @Input('order') order: any[];
  @Input('idIglesia') idIglesia: any = {};
  setup_form = new FormGroup({
    first_name: new FormControl(''),
    last_name: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl(''),
    message: new FormControl(''),
    custom: new FormControl('')
  })

  mailing_list;
  contact_info: any = {}
  currentLang = 'en';
  langDB: any;

  classes = [
    { id: "first_name", class: "col-6", order: 1 },
    { id: "last_name", class: "col-6", order: 2 },
    { id: "email", class: "col-6", order: 3 },
    { id: "phone", class: "col-6", order: 4 },
    { id: "message", class: "col-12", order: 5 },
    { id: "custom", class: "col-12", order: 6 },
  ]

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.getContactInfo();
    this.getLangs();
  }

  getLangs() {
    this.api
      .get("public/langs")
      .subscribe((response: any) => {
        this.langDB = response;
      }, (error) => {
        console.error(error);
        console.error(error.response);
      });
  }

  get lang() {
    if (this.langDB && this.currentLang) {
      return this.langDB.find((l) => l.lang == this.currentLang);
    }
    return {
      keys: {},
    };
  }

  getContactInfo() {
    this.api
      .get(
        `iglesias/contact_info/?idIglesia=${this.idIglesia}`
      )
      .subscribe((res: any) => {
        this.contact_info = res.contact;
        this.mailing_list = {
          organization: res.organization
        };
      }, (err) => {
        console.error(err);
      });
  }

  getOrder(id: string) {
    return `order-${this.order.find(x => x.id === id).order}`
  }

  getSize(id, recursive?: boolean) {
    if (this.setup.order_array) {
      const class_name = this.getOrder(id);
      const order_num = Number(class_name.replace('order-', ''));
      // odd because is the left size
      if (order_num != 6) {
        const next_in_order = this.order.find((x) => x.order === order_num + 1);
        const next_size = this.classes.find(x => x.id === next_in_order.id);
        const actual_size = this.classes.find((x) => x.id === id);
        if (next_size) {
          if (order_num != 1) {
            const previous_in_order = this.order.find((x) => x.order === order_num - 1);
            const previous = this.classes.find(x => x.id === previous_in_order.id);
            if (!recursive) {
            }
            if (previous.class === 'col-12' && next_size.class === 'col-6') {
              return 'col-md-6'
            } else if (previous.class === 'col-6' && next_size.class === 'col-6') {
              return 'col-md-6'
            } else if (previous.class === 'col-6' && next_size.class === 'col-12') {
              if (!recursive) {
                const before_fixed_size = this.getSize(previous_in_order.id, true);
                const next_fixed_size = this.getSize(next_in_order.id, true);
                if (before_fixed_size === 'col-md-6' && next_fixed_size === 'col-md-6' && actual_size.class === 'col-6') {
                  return 'col-md-6'
                } else if (before_fixed_size === 'col-md-6' && next_fixed_size === 'col-md-12' && actual_size.class === 'col-6') {
                  if (previous_in_order.order - 1 > 0) {
                    const before_of_before = this.order.find((x) => x.order === previous_in_order.order - 1);
                    const before_before_size = this.getSize(before_of_before.id, true);
                    console.log(before_before_size);
                    if (before_before_size === 'col-md-6' && actual_size.class === 'col-6') {
                      // 3 consecutive
                      return 'col-md-12';
                    } else {
                      return 'col-md-6';
                    }
                  }
                }
              }
              return 'col-md-12'
            } else if (previous.class === 'col-12' && next_size.class === 'col-12') {
              return `col-md-12`
            } else {
              return 'col-md-6';
            }
          } else {
            if (next_size.class === 'col-12') {
              return 'col-md-12';
            } else {
              return 'col-md-6';
            }
          }
        }
      } else {
        return 'col-md-12'
      }
    }
  }

  getClasses(id) {
    const order = this.getOrder(id);
    const size = this.getSize(id);
    return `${order} ${size}`
  }

}
