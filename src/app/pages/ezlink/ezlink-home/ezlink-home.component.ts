import { NgxQRCodeComponent } from 'ngx-qrcode2';
import { NetworksOrganizationFormComponent } from './../../networks/networks-organization-form/networks-organization-form.component';
import { Observable } from 'rxjs';
import { Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { NetworkOrganizationModel } from '../../networks/NetworkModel';
import { SIGBUS } from 'constants';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: 'app-ezlink-home',
  templateUrl: './ezlink-home.component.html',
  styleUrls: ['./ezlink-home.component.scss']
})
export class EzlinkHomeComponent implements OnInit {

  @ViewChild('network_organization_form') network_organization_form: NetworksOrganizationFormComponent;

  currentUser = this.user_service.getCurrentUser();
  id_or_unique: any;
  iglesia: any = {};
  networks: NetworkOrganizationModel[] = [];
  categories: any[] = [];
  selected_category: any;

  ezlink: any;

  is_preview: boolean = true;
  show_categories: boolean = false;
  show_network_form: boolean = false;
  show_category_link: boolean = false;

  settings_form: FormGroup = this.form_builder.group({
    unique_url: new FormControl(''),
    background_color: new FormControl('#fffff'),
    border_color: new FormControl('#e4e4e4'),
    show_profile_networks: new FormControl(true),
    show_icon: new FormControl(true),
    show_description: new FormControl(true),
    description: new FormControl(''),
    network_category_name: new FormControl('Redes')
  });

  category_form: FormGroup = this.form_builder.group({
    idIglesia: new FormControl(undefined, [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
    sort_by: new FormControl(undefined, [Validators.required])
  });

  constructor(
    private api: ApiService,
    private user_service: UserService,
    private ngx_modal: NgxSmartModalService,
    private form_builder: FormBuilder,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
    this.id_or_unique = this.activated_route.snapshot.params['id_or_unique'];
    console.log(this.id_or_unique);

    if (this.id_or_unique) {
      if (this.router.url.includes('-manager')) {
        this.router.navigateByUrl(`/ezlink/${this.id_or_unique}`);
      }
    } else {
      if (this.currentUser) {
        this.id_or_unique = this.currentUser.idIglesia;
      }
    }
  }

  get can_toggle() {
    if (this.currentUser) {
      return (this.currentUser.isSuperUser || this.currentUser.idUserType === 1);
    }
    return false;
  }

  get can_edit() {
    if (this.currentUser) {
      return (this.currentUser.isSuperUser || this.currentUser.idUserType === 1) && !this.is_preview;
    }
    return false;
  }

  ngOnInit() {
    this.getEzLink();
    this.getIglesia();
    this.initNetworks();
    // this.getNetworks();
  }
  initNetworks() {
    this.share_networks = [

      {
        color: '#1877F2',
        icon: 'fa fa-facebook-square',
        text: 'Share on Facebook',
        share_url: `https://www.facebook.com/sharer.php?u=${this.getUniqueUrl()}`
      },
      {
        color: '#0A66C2',
        icon: 'fab fa-linkedin',
        text: 'Share on LinkedIn',
        share_url: `https://www.linkedin.com/sharing/share-offsite/?url=${this.getUniqueUrl()}`
      },
      {
        color: '#1DA1F2',
        icon: 'fa fa-twitter-square',
        text: 'Share on Twitter',
        share_url: `https://twitter.com/intent/tweet?text=Check%20out%20this%20EzLink!%20-%20${this.getUniqueUrl()}`
      },
      {
        color: '#00E676',
        icon: 'fab fa-whatsapp-square',
        text: 'Share via WhatsApp',
        share_url: `https://wa.me/?text=Check%20out%20this%20EzLink!%20-%20${this.getUniqueUrl()}`
      },
      {
        color: 'messenger',
        icon: 'fab fa-facebook-messenger',
        text: 'Share via Messenger',
        share_url: `https://www.messenger.com/new`
      },
      {
        color: '',
        icon: 'fa fa-envelope',
        text: 'Share via Email',
        share_url: `mailto:?subject= Check out this EzLink! &body=  Check out this Linktree! - ${this.getUniqueUrl()}`
      }
    ];
  }

  getIglesia() {
    const subs = this.api
      .get(`getIglesiaFullData/`, { idIglesia: this.id_or_unique })
      .subscribe((data: any) => {
        this.iglesia = data.iglesia;
        subs.unsubscribe();
      });
  }

  getEzLink() {
    this.getNetworks();
    let param: string;
    if (this.id_or_unique) {
      param = this.id_or_unique;
    } else {
      param = this.currentUser.idIglesia;
    }
    const subs = this.api.get(`ezlink`, { idIglesia: param })
      .subscribe((response: any) => {
        console.log(response);
        this.ezlink = response.ezlink;
        this.settings_form.patchValue(this.ezlink.settings);

        setTimeout(() => {
          const elements: HTMLCollectionOf<Element> = document.getElementsByTagName('app-ezlink-home');
          console.log(elements);
          for (let index = 0; index < elements.length; index++) {
            const element = elements.item(index);
            console.log(element);
            element['style'].setProperty('--ezlink_background', this.ezlink.settings.background_color);
            // window.getComputedStyle(element).setProperty('--ezlink_background', this.ezlink.settings.background_color);
          }
        }, 100);

        if (!this.ezlink.id) {
          this.api.post('ezlink/init', {
            idIglesia: this.id_or_unique
          }).subscribe(init_response => {
            console.log(init_response);
            this.getEzLink();
          })
        }
        subs.unsubscribe();
      });
  }

  getNetworks() {
    // this.loading = true;
    this.api.get(`networks/organization`,
      {
        idIglesia: this.id_or_unique,
        ezlink: true
      })
      .subscribe((response: any) => {
        this.networks = response.networks;
        // this.loading = false;
      }, error => {
        this.networks = [];
        // this.loading = false;
      });
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${this.api.baseUrl}${image}`;
    }
    return ``;
  }

  togglePreview() {
    this.is_preview = !this.is_preview
    // this.setPreview();
  }

  openSettingsInfo() {
    this.ngx_modal.get('ezlink_settings_modal').open();
  }

  saveSettings(edit_param?: string) {
    if (edit_param) {
      this.ezlink[edit_param] = false;
    }
    const payload = this.settings_form.value;
    this.ezlink.settings = payload;
    // this.is_preview = true;
    this.api.patch(`ezlink/${this.ezlink.id}`, payload).subscribe(response => {
      this.ngx_modal.get('ezlink_settings_modal').close();
      this.api.showToast(`Settings saved successfully.`, ToastType.success);
    })
  }

  handleAction(net: NetworkOrganizationModel) {
    if (net.action_type === 'link') {
      window.open(net.full_site_link, "_blank");
    } else if (net.action_type === 'email') {
      window.open(net.full_site_link, "_blank");
    }
  }

  getUniqueUrl() {
    let unique = this.id_or_unique;
    if (!unique) {
      if (this.currentUser) {
        unique = this.currentUser.idIglesia;
      }
    }
    return `https://iglesiatech.app/ezlink/${unique}`;
  }

  async showCategories() {
    this.show_categories = true;
    await this.getCategories();
  }

  getCategories() {
    return new Promise((resolve, reject) => {
      const subscription = this.api.get('ezlink/categories', {
        idIglesia: this.currentUser.idIglesia
      })
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.categories = response.categories;
        })
    })
  }

  hideCategories() {
    this.show_categories = false;
    this.getEzLink();
  }

  sortCategoriesArray(array_of_items: any[], event: CdkDragDrop<any>, type: string) {
    moveItemInArray(array_of_items, event.previousIndex, event.currentIndex);

    array_of_items.forEach((x, index) => x.sort_by = index + 1);
    // this.setHeaderItems();
    let url: string;
    if (type === 'categories') {
      url = `ezlink/categories/sort`;
    } else {
      url = `ezlink/sort`;
    }
    const subscription = this.api.post(url, {
      items: array_of_items
    })
      .subscribe(response => {
        subscription.unsubscribe();
      }, error => {
        console.error(error);
      });

  }

  openCategoryForm(category_item?) {
    console.log(category_item);

    let category = {
      idIglesia: this.id_or_unique,
      name: category_item ? category_item.name : '',
      sort_by: category_item ? category_item.sort_by : this.categories.length + 1,
    }
    if (category_item) {
      if (!this.category_form.get('id')) {
        this.category_form.addControl('id', new FormControl(category_item.id, [Validators.required]));
      }
    } else {
      if (this.category_form.get('id')) {
        this.category_form.removeControl('id');
      }
    }
    this.category_form.patchValue(category);
    this.ngx_modal.get('ezlink_category_modal').open();
  }

  saveCategory() {
    if (this.category_form.valid) {
      const payload = this.category_form.value;
      payload.created_by = this.currentUser.idUsuario;
      let observable: Observable<any>;
      if (payload.id) {
        observable = this.api.patch(`ezlink/categories/${payload.id}`, payload);
      } else {
        observable = this.api.post(`ezlink/categories/`, payload);
      }
      const subscription = observable.subscribe(response => {
        this.getCategories();
        this.ngx_modal.get('ezlink_category_modal').close();
        subscription.unsubscribe();
        this.api.showToast(`Category successfully saved.`, ToastType.success);
      }, error => {
        console.error(error);
        this.api.showToast(`Error saving category.`, ToastType.error);
      });
    } else {
    }
  }

  deleteCategory(category: any) {
    if (confirm(`Delete the category ${category.name}?`)) {
      category.deleted_by = this.currentUser.idUsuario;
      this.api.delete(`ezlink/categories/${category.id}?deleted_by=${category.deleted_by}`)
        .subscribe(data => {
          this.getCategories();
          this.api.showToast(`Category successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.api.showToast(`Error deleting category.`, ToastType.error);
          });
    }
  }

  updateNetworkOrganization(network: NetworkOrganizationModel) {
    this.show_network_form = true;
    this.ngx_modal.get('ezlink_category_network').open();
    setTimeout(async () => {
      this.network_organization_form.initForm();
      await this.network_organization_form.getNetworksAsPromise();
      this.network_organization_form.setNetwork(network);

    });
  }

  deleteNetworkOrganization(network: NetworkOrganizationModel) {
    const confirmation = confirm(`Are you sure you want to delete this network button? \n This action can't be undone.`);
    if (confirmation) {
      let params = `?idIglesia=${this.currentUser.idIglesia}`;
      if (this.currentUser) {
        params = `${params}&deleted_by=${this.currentUser.idUsuario}`
      }
      this.api.delete(`networks/organization/${network.id}${params}`)
        .subscribe(response => {
          this.api.showToast(`Network deleted successfully.`, ToastType.success);
          this.getNetworks();
        }, error => {
          this.api.showToast(`Error deleting network.`, ToastType.error);
        })
    }
  }

  cancelNetworkOrganizationForm() {
    this.show_network_form = false;
    this.network_organization_form.initForm();
    this.ngx_modal.get('ezlink_category_network').close();
  }

  showEditCategoryLinks(category) {
    this.show_category_link = true;
    this.selected_category = Object.assign({}, category);
  }

  addNetwork(selected_category) {
    this.show_network_form = true;
    setTimeout(() => {
      this.network_organization_form.initForm();
      this.network_organization_form.network_organization_form.get('sort_by').setValue(selected_category.links.length + 1);
      this.network_organization_form.network_organization_form.get('ezlink_category_id').setValue(selected_category.id);
      this.network_organization_form.getNetworks();
      this.ngx_modal.get('ezlink_category_network').open();
    });
  }

  openShare() {
    this.ngx_modal.get('ezlink_share_modal').open();
  }

  closeShare() {
    this.ngx_modal.get('ezlink_share_modal').close();

  }

  async copyUrl() {
    this.copied = true;
    const blob = new Blob([this.getUniqueUrl()], { type: 'text/plain' })
    await window.navigator['clipboard'].write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    setTimeout(() => {
      this.copied = false;
    }, 1000);
    // this.organizationService.api.showToast('QR copied to clipboard', ToastType.success);
  }

  async shareQR(qr_code: NgxQRCodeComponent) {
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

  copied: boolean = false;

  share_networks: any[] = [];

}
