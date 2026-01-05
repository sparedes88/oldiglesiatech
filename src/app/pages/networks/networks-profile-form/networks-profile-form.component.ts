import { NetworksOrganizationFormComponent } from './../networks-organization-form/networks-organization-form.component';
import { ViewChild } from '@angular/core';
import { ToastType } from './../../../login/ToastTypes';
import { UserService } from './../../../services/user.service';
import { NetworkOrganizationModel } from './../NetworkModel';
import { ApiService } from './../../../services/api.service';
import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from 'src/environments/environment';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import * as moment from 'moment-timezone';
import { MeetingModel } from 'src/app/component/meetings-manager/meetings-manager/MeetingModel';

@Component({
  selector: 'app-networks-profile-form',
  templateUrl: './networks-profile-form.component.html',
  styleUrls: ['./networks-profile-form.component.scss']
})
export class NetworksProfileFormComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('type') type: string;
  @ViewChild('network_organization_form') network_organization_form: NetworksOrganizationFormComponent;
  @Input('view_style') view_style: 'list' | 'row' = 'list';
  @Input('icon_only') icon_only: boolean = false;

  networks: NetworkOrganizationModel[] = [];
  user: any = this.userService.getCurrentUser();

  show_form: boolean = false;
  loading: boolean = false;

  meeting_items: MeetingModel[] = [];
  intervalId = setInterval(() => {
    this.getMeetings();
  }, 20000);

  actual_zone = moment.tz.guess();
  organization_timezone: string;

  constructor(
    private api: ApiService,
    private userService: UserService,
    private organizationService: OrganizationService
  ) { }

  ngOnInit() {
    this.getNetworks();
    this.getMeetings();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  async getMeetings() {
    const response: any = await this.organizationService.getMeetings(this.idOrganization, true).toPromise();

    console.log(response);
    if (response) {
      this.meeting_items = response.meetings;
      if (response.organization) {
        this.organization_timezone = response.organization.timezone;
      }
      if (!this.organization_timezone) {
        this.organization_timezone = moment.tz.guess();
      }
    }
  }

  getNetworks() {
    const payload: {
      idIglesia: number,
      profile?: boolean,
      ezlink?: boolean
    } = {
      idIglesia: this.idOrganization
    };
    if (this.type) {
      if (this.type === 'profile') {
        payload.profile = true;
      }
      if (this.type === 'ezlink') {
        payload.ezlink = true;
      }
    }
    this.loading = true;
    this.api.get(`networks/organization`, payload)
      .subscribe((response: any) => {
        this.networks = response.networks;
        this.loading = false;
      }, error => {
        this.networks = [];
        this.loading = false;
      });
  }

  get is_edition_mode() {
    return this.view_mode === 'edition';
  }

  get can_edit() {
    if (this.user) {
      return (this.user.isSuperUser || this.user.idUserType === 1) && this.is_edition_mode;
    }
    return false;
  }

  addNewNetwork() {
    this.show_form = true;
    setTimeout(() => {
      this.network_organization_form.initForm();
      this.network_organization_form.network_organization_form.get('sort_by').setValue(this.networks.length + 1);
      this.network_organization_form.getNetworks();
    });
  }

  handleAction(net: NetworkOrganizationModel) {
    if (net.action_type === 'link') {
      window.open(net.full_site_link, "_blank");
    } else if (net.action_type === 'email') {
      window.open(net.full_site_link, "_blank");
    }
  }

  updateNetworkOrganization(network: NetworkOrganizationModel) {
    this.show_form = true;
    setTimeout(async () => {
      this.network_organization_form.initForm();
      await this.network_organization_form.getNetworksAsPromise();
      this.network_organization_form.setNetwork(network);

    });
  }

  cancelNetworkOrganizationForm() {
    this.show_form = false;
    this.network_organization_form.initForm();
  }

  deleteNetworkOrganization(network: NetworkOrganizationModel) {
    const confirmation = confirm(`Are you sure you want to delete this network button? \n This action can't be undone.`);
    if (confirmation) {
      let params = `?idIglesia=${this.idOrganization}`;
      if (this.user) {
        params = `${params}&deleted_by=${this.user.idUsuario}`
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

  dropLevel(event: CdkDragDrop<any>) {
    moveItemInArray(
      this.networks,
      event.previousIndex,
      event.currentIndex
    );
    // this.editMode = true;
    this.networks.forEach((x, index) => x.sort_by = index + 1);
    // this.setHeaderItems();
    this.api.post(`networks/organization/sort`, {
      networks: this.networks
    })
      .subscribe(response => {
      }, error => {
        console.error(error);
      });
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${environment.serverURL}${image}`;
    }
    // if (this.iglesia_full_data) {
    //   if (this.iglesia_full_data.portadaArticulos) {
    //     const path = this.fixUrl(this.iglesia_full_data.portadaArticulos);
    //     return path;
    //   }
    // }
    return 'assets/img/default-image.jpg';
  }

  showCategories(manage_categories_modal: NgxSmartModalComponent) {
    // this.show_categories = false;
    setTimeout(() => {
      // this.show_categories = true;
    }, 100);
    manage_categories_modal.open();
  }

  is_live(net: NetworkOrganizationModel) {
    const index_day = moment().day();
    const meeting = this.meeting_items.find(x => (x.networks_on_live as number[]).includes(net.id)
      && (x.days_on_live as number[]).includes(index_day)
      && moment.tz(this.actual_zone).isSameOrAfter(moment.tz(x.meeting_start, 'HH:mm', this.organization_timezone), 'minute')
      && moment.tz(this.actual_zone).isSameOrBefore(moment.tz(x.meeting_end, 'HH:mm', this.organization_timezone), 'minute')
    );
    return meeting ? true : false;
  }
}
