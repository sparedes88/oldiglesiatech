import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { Component, OnInit } from '@angular/core';
import { ThrowStmt } from '@angular/compiler';
import { GroupEventModel } from 'src/app/models/GroupModel';
import * as moment_tz from 'moment-timezone';

@Component({
  selector: 'app-search-organization',
  templateUrl: './search-organization.component.html',
  styleUrls: ['./search-organization.component.scss']
})
export class SearchOrganizationComponent implements OnInit {

  iglesias: OrganizationModel[] = [];
  iglesias_Original: OrganizationModel[] = [];

  events: any[] = [];
  events_original: any[] = [];

  search_input: string = '';
  state_input: string = '';
  country_name: string = ''
  searched: boolean = false;

  counter = 0;
  bg_counter = 1;
  picture: string = 'assets/img/default-portrait-0.png';
  organization_type: string = 'Church';
  bg_class: string = 'fondo-0';
  interval: any;
  featured_iglesias: OrganizationModel[] = [];
  canUseLoader: boolean = false;
  serverBusy: boolean = false;
  countries_elements = {
    countries: [],
    events: []
  };
  selected_country: {
    name: string,
    abbreviation: string;
    states: {
      state: string;
      abbreviation: string;
      country: string;
    }[]
  };

  loaded: {
    organizations: boolean;
    events: boolean;
  } = {
      organizations: false,
      events: false
    }

  settings_obj = {
    menu_option: 'organizations'
  }

  get countries() {
    if (this.settings_obj.menu_option == 'organizations') {
      return this.countries_elements.countries;
    } else {
      return this.countries_elements.events;
    }
  }

  constructor(
    private organization_service: OrganizationService,
    private router: Router,
    private modal_service: NgxSmartModalService,
    private activated_route: ActivatedRoute
  ) { }

  get selected_state() {
    if (this.state_input) {
      if (this.selected_country) {
        return this.selected_country.states.find(x => x.abbreviation === this.state_input);
      }
      return;
    }
    return;
  }

  ngOnInit() {
    this.getCountriesAndStatesAvailable();
    this.getIglesias();
    this.getEvents();
    this.getFeaturedOrganizations();
    this.bg_counter = 1;
    const tab_view = this.activated_route.snapshot.queryParams.view;
    if (tab_view) {
      this.setView(tab_view);
    }
    this.interval = setInterval(() => {
      // this.bg_class = `fondo-${this.bg_counter}`;
      this.bg_counter = (this.bg_counter + 1) % 5; // adjusted
      switch (this.bg_counter) {
        case 0:
          this.organization_type = `Church`;
          break;
        case 1:
          this.organization_type = `Radio`;
          break;
        case 2:
          this.organization_type = `Organization`;
          break;
        case 3:
          this.organization_type = `Ministry`;
          break;
        case 4:
          this.organization_type = `Business`;
          break;
      }
    }, 3000);
  }

  async getCountriesAndStatesAvailable() {
    const response: any = await this.organization_service.api.get(`iglesias/addresses/available_countries`,
      {
        show_test: this.organization_service.show_test
      }
    ).toPromise();
    if (response) {
      this.countries_elements = response;
      if (this.activated_route.snapshot.queryParams) {
        const country = this.activated_route.snapshot.queryParams.country;
        if (country) {
          this.country_name = country;
          this.selected_country = this.countries.find(x => x.name === country);
          const state = this.activated_route.snapshot.queryParams.state;
          if (state && this.selected_country) {
            this.state_input = state;
          }
          this.iglesiasInput(this.search_input);
        }
      }
    }
  }

  getIglesias() {
    let subscription: Observable<any>;
    if (this.organization_service.show_test) {
      subscription = this.organization_service.getIglesias();
    } else {
      subscription = this.organization_service.getIglesiasExclusive();
    }
    subscription
      .subscribe((data: any) => {
        if (data.iglesias) {
          this.iglesias = [];
          this.iglesias_Original = data.iglesias;
          this.loaded.organizations = true;
          this.canUseLoader = false;
          if (this.activated_route.snapshot.queryParams) {
            const country = this.activated_route.snapshot.queryParams.country;
            if (country) {
              this.country_name = country;
              this.selected_country = this.countries.find(x => x.name === country);
              const state = this.activated_route.snapshot.queryParams.state;
              if (state && this.selected_country) {
                this.state_input = state;
              }
              this.iglesiasInput(this.search_input);
            }
          }
          if (this.search_input) {
            this.iglesiasInput(this.search_input);
          }
        } else {
          this.organization_service.api.showToast('Please update...', ToastType.info);
          this.canUseLoader = true;
        }
      }, err => {
        console.error(err);
        this.organization_service.api.showToast('Please update...', ToastType.info);
        this.canUseLoader = true;
      });
  }

  getEvents() {
    const method: Observable<any> = this.organization_service.getEventsSearch();

    const subscription = method
      .subscribe((data: any) => {
        this.loaded.events = true;
        subscription.unsubscribe();
        this.events = [];
        this.events_original = data;
        this.events_original.forEach(event => {
          event.full_address = this.getAddress(event);
          event.meta = {
            idGroupEvent: event.idGroupEvent,
            description: event.description,
            attendances_count: event.attendances_count,
            attendances_total: event.attendances_total,
            capacity: event.capacity,
            picture: event.picture,
            idFrequency: event.idFrequency,
            start_date: moment_tz.tz(event.start_date, event.timezone).format('MMM. DD YYYY'),
            end_date: moment_tz.tz(event.end_date, event.timezone).format('MMM. DD YYYY'),
            start_time: moment_tz.tz(event.start_date, event.timezone).format('hh:mm a'),
            end_time: moment_tz.tz(event.end_date, event.timezone).format('hh:mm a'),
            is_same_date: moment_tz.tz(event.end_date, event.timezone).isSame(moment_tz.tz(event.start_date, event.timezone), 'day'),
            timezone: event.timezone
          }
        })
        this.canUseLoader = false;
        if (this.activated_route.snapshot.queryParams) {
          const country = this.activated_route.snapshot.queryParams.country;
          if (country) {
            this.country_name = country;
            this.selected_country = this.countries.find(x => x.name === country);
            const state = this.activated_route.snapshot.queryParams.state;
            if (state && this.selected_country) {
              this.state_input = state;
            }
            this.iglesiasInput(this.search_input);
          }
        }
        if (this.search_input) {
          this.iglesiasInput(this.search_input);
        }
      }, err => {
        console.error(err);
        this.organization_service.api.showToast('Please update...', ToastType.info);
        this.canUseLoader = true;
      });
  }

  getFeaturedOrganizations() {
    this.organization_service.getIglesiasFeatured()
      .subscribe((data: any) => {
        if (data.iglesias) {
          this.featured_iglesias = data.iglesias;
          this.canUseLoader = false;
        } else {
          this.organization_service.api.showToast('Please update...',
            ToastType.info
          );
          this.canUseLoader = true;
        }
      }, err => {
        console.error(err);
        this.organization_service.api.showToast('Please update...', ToastType.info);
        this.canUseLoader = true;
      });
  }

  activateShowAll() {
    this.counter++;
    if (this.counter >= 3) {
      this.organization_service.api.showToast(`Now you are able to see test organizations!`, ToastType.info);
      this.organization_service.show_test = true;
      this.getIglesias();
    }
  }

  getImages() {
    return `url('${this.picture}')`;
  }

  getClass() {
    return `${this.bg_class}`;
  }

  selectIglesia(iglesia: OrganizationModel) {
    if (!this.serverBusy) {
      this.serverBusy = true;
      let query_params: Partial<{ country: string, state: string, origin: string, view: 'organizations' | 'events' }> = { ...this.activated_route.snapshot.queryParams };
      if (this.selected_country) {
        query_params.country = this.selected_country.name;
      }
      if (this.state_input) {
        query_params.state = this.state_input
      }
      query_params.origin = 'search';
      if (iglesia.idCatalogoPlan != 16) {
        if (iglesia.site_v2) {
          document.location.href = iglesia.site_v2_url;;
        } else {
          this.router.navigate([`/organization-profile/main/${iglesia.idIglesia}/inicio`], {
            queryParams: query_params
          });
        }
      }

      // this.organization_service.api
      //   .get(`getIglesiaFullData/`, { idIglesia: iglesia.idIglesia })
      //   .subscribe((data: any) => {
      //   }, err => {
      //     console.error(err);
      //   });
      this.serverBusy = false;
    }
  }

  goToSite(event, iglesia) {
    event.stopPropagation()
    this.serverBusy = true;
    let query_params: Partial<{ country: string, state: string, origin: string, view: 'organizations' | 'events' }> = { ...this.activated_route.snapshot.queryParams };
    if (this.selected_country) {
      query_params.country = this.selected_country.name;
    }
    if (this.state_input) {
      query_params.state = this.state_input
    }
    query_params.origin = 'search';
    if (iglesia.idCatalogoPlan != 16) {
      if (iglesia.site_v2) {
        // document.location.href = iglesia.site_v2_url;;
        const newTab = window.open(iglesia.site_v2_url, '_blank');
        this.serverBusy = false;
      } else {
        const url = this.router.createUrlTree([`/organization-profile/main/${iglesia.idIglesia}/inicio`], {
          queryParams: query_params
        }).toString();
        window.open(url, '_blank');
        this.serverBusy = false;
        // this.router.navigate([`/organization-profile/main/${iglesia.idIglesia}/inicio`], {
        //   queryParams: query_params
        // });
      }
    }
  }

  iglesiasInput(event) {
    const val = event;
    if (val && val.trim() !== '' || this.selected_country || this.state_input) {
      const iglesias = this.iglesias_Original.filter((item) => {
        return item.Nombre.toLowerCase().includes(val.toLowerCase())
          || `${item.Calle ? item.Calle + ', ' : ''}${item.Ciudad ? item.Ciudad : ''}
${item.Provincia ? item.Provincia + ', ' : ''}${item.ZIP ? item.ZIP : ''}`.trim().toLowerCase().includes(val.toLowerCase());
        ;
      });
      const events = this.events_original.filter((item) => {
        return item.name.toLowerCase().includes(val.toLowerCase())
          || item.full_address.toLowerCase().includes(val.toLowerCase())
          || item.organization_name.toLowerCase().includes(val.toLowerCase())
          || item.meta.start_date.toLowerCase().includes(val.toLowerCase())
          || item.meta.end_date.toLowerCase().includes(val.toLowerCase())
          || item.meta.start_time.toLowerCase().includes(val.toLowerCase())
          || item.meta.end_time.toLowerCase().includes(val.toLowerCase())
      });
      this.iglesias = [...iglesias];
      this.events = [...events];
      let query_params: Partial<{ country: string, state: string, origin: string, view: 'organizations' | 'events' }> = { ...this.activated_route.snapshot.queryParams }
      if (this.selected_country) {
        this.iglesias = this.iglesias.filter(i => i.country === this.selected_country.abbreviation);
        this.events = this.events.filter(i => i.country === this.selected_country.abbreviation);
        query_params.country = this.selected_country.name;
      }
      if (this.state_input) {
        this.iglesias = this.iglesias.filter(x => x.Provincia === this.state_input)
        this.events = this.events.filter(x => x.state === this.state_input)
        query_params.state = this.state_input;
      }


      this.router.navigate([`/search`], {
        relativeTo: this.activated_route,
        queryParams: query_params,
        queryParamsHandling: 'merge'
      })
      setTimeout(() => {
        this.searched = true;
      }, 600);
      // this.modal_service.get('select_your_church').open();
    } else {
      this.iglesias = [];
    }
  }

  closeModal() {
    this.modal_service.get('select_your_church').close();
  }

  checkRedes(profile) {
    if (profile) {
      if (profile.android_url || profile.ios_url || profile.facebook || profile.google || profile.email
        || profile.instagram || profile.youtube || profile.twitter || profile.whatsapp || profile.website) {
        return true
      } else {
        return false
      }
    } else {
      return false;
    }
  }

  getStates(event) {
    this.selected_country = this.countries.find(x => x.name === event.target.value);
    let query_params: Partial<{ country: string, state: string, origin: string, view: 'organizations' | 'events' }> = { ...this.activated_route.snapshot.queryParams };
    query_params.country = this.selected_country.name;
    this.state_input = '';
    // if (this.state_input) {
    //   query_params.state = this.state_input
    // }
    this.router.navigate([`/search`], {
      relativeTo: this.activated_route,
      queryParams: query_params,
      queryParamsHandling: 'merge'
    })
    this.iglesias = this.iglesias_Original.filter(i => i.country === this.selected_country.abbreviation);
    this.events = this.events_original.filter(i => i.country === this.selected_country.abbreviation);
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${this.organization_service.api.baseUrl}${image}`;
    }
    // if (this.iglesia) {
    //   const path = this.fixUrl(this.iglesia.portadaArticulos);
    //   return path;
    // }
    return '/assets/img/default-image.jpg';
  }

  // goToSite(iglesia) {
  //   if (iglesia.idCatalogoPlan != 16) {
  //     const url = `/organization-profile/main/${iglesia.idIglesia}/inicio`
  //   }
  // }

  getAddress(event) {
    let street = ``;
    if (event.street) {
      street = event.street;
    }
    if (event.city) {
      street = `${street}, ${event.city}`;
    }
    if (event.state) {
      street = `${street}, ${event.state}`;
    }
    if (event.zip_code) {
      street = `${street}, ${event.zip_code}`;
    }
    if (event.country) {
      street = `${street}, ${event.country}`;
    }
    while (street.startsWith(',')) {
      street = street.substring(1);
    }
    return street;
  }

  setView(view_type: 'organizations' | 'events') {
    this.settings_obj.menu_option = view_type;
    const query_params = { ...this.activated_route.snapshot.queryParams };
    console.log(query_params);
    query_params.view = view_type;

    this.router.navigate([`/search`], {
      relativeTo: this.activated_route,
      queryParams: query_params,
      queryParamsHandling: 'merge'
    });
  }

  // goToEvent(){
  //   // this.router./group/events/detail/54206?action=register
  // }
}
