/// <reference types="@types/googlemaps" />
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { FileUploadService } from "src/app/services/file-upload.service";
import { ActivatedRoute } from "@angular/router";
import { NgxSmartModalService } from "ngx-smart-modal";
import { ToastrService } from "ngx-toastr";
import { UserService } from "src/app/services/user.service";
import { ApiService } from "src/app/services/api.service";
import { MatExpansionPanel } from "@angular/material";
import { environment } from "src/environments/environment";
declare var google;

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit, AfterViewInit {
  constructor(
    private api: ApiService,
    private userService: UserService,
    private toastr: ToastrService,
    private modal: NgxSmartModalService,
    private route: ActivatedRoute,
    private fileUpload: FileUploadService
  ) {
    this.communityId = route.snapshot.params["id"];
  }

  iglesia
  community: any = {};
  @Input('communityId') communityId: any;
  @Input("display_new_style") display_new_style: boolean = false;

  delay_time: number = 200;
  tabIndex: number = 1;
  entries: any[] = [];
  groups: any[] = [];
  selectedEntry: any;

  // Searchbox
  searchBoxValue: string = '';
  categories: any[] = [];
  selectedCategory: string;

  // Google Maps
  map: google.maps.Map;
  mapOptions: google.maps.MapOptions = {
    center: new google.maps.LatLng(36, -119),
    zoom: 12,
  };
  geocoder = new google.maps.Geocoder();
  bounds = new google.maps.LatLngBounds();
  markers: google.maps.Marker[] = [];
  public loading: boolean = false;

  @ViewChild("mapContainer") gmap: ElementRef;
  @ViewChildren('accordion') accordions: QueryList<MatExpansionPanel>;

  ngOnInit() {
    this.getCommunity();
  }

  ngAfterViewInit() {
    this.mapInitializer();
  }

  getIglesia() {
    this.api
      .get(`getIglesiaFullData/`, { idIglesia: this.community.idIglesia })
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia;
        },
        (err: any) => console.error(err)
      );
  }

  getCommunity() {
    this.loading = true;
    this.api.get(`communityBox/${this.communityId}`).subscribe(
      (data: any) => {
        this.community = data;
        this.getIglesia();
      },
      (err) => {
        console.error(err);
      },
      () => {
        this.getEntries();
        // this.getEntriesExtended();
      }
    );
  }

  getEntries() {
    this.loading = true;
    this.api
      .get(`communityBox/${this.communityId}/entries`, {
        order_by: this.community.style_settings.order_by,
      })
      .subscribe(
        (data: any) => {
          this.entries = data;
        },
        (err) => {
          console.error(err);
          this.loading = false;
        },
        () => {
          this.entries.map((entry, index) => {
            setTimeout(() => {
              if (entry.lat && entry.lng) {
                this.codeCoords(entry)
              } else {
                this.codeAddress(entry);
              }
            }, index * this.delay_time);
          });
          this.getCategories();
          this.loading = false;
        }
      );
  }

  getEntriesExtended() {
    this.loading = true;
    this.api.get(`communityBox/${this.communityId}/entries_extended`)
      .subscribe(
        (data: any) => {
          this.groups = data;
          setTimeout(() => {
            if (this.accordions.length > 0) {
              this.accordions.first.expanded = true;
              if (this.community.style_settings) {
                if (this.community.style_settings.header_text_color) {
                  const panel_headers = document.getElementsByClassName('custom_panel_header');
                  console.log(panel_headers);

                  for (let index = 0; index < panel_headers.length; index++) {
                    const element = panel_headers[index];
                    window.getComputedStyle(element).setProperty('--be-text', this.community.style_settings.header_text_color || 'black');
                  }
                }
              }
            }
          }, 100);
        },
        (err) => {
          console.error(err);
          this.loading = false;
        });
  }

  get filteredEntries(): Array<any> {
    let values = this.entries;
    if (this.searchBoxValue) {
      values = values.filter(
        function (entry) {
          return (
            entry.business_name
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.contact_first_name
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.contact_last_name
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.business_summary
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.locations
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.phone
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.contact_email
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase())
          );
        }.bind(this)
      );
    }

    if (this.selectedCategory && this.selectedCategory != "all") {
      values = values.filter(
        function (entry) {
          return entry.industry.includes(this.selectedCategory);
        }.bind(this)
      );
    }

    return values;
  }

  get filtered_groups(): Array<any> {
    let values = this.groups;
    if (this.searchBoxValue) {
      values = values.filter((group) => {
        return group.entries.filter((entry) => {
          return (
            entry.business_name
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            `${entry.contact_first_name}  ${entry.contact_last_name}`
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.business_summary
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.locations
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase())
          );
        }).length > 0
      });
    }

    // if (this.selectedCategory && this.selectedCategory != "all") {
    //   values = values.filter(
    //     function (entry) {
    //       return entry.industry.includes(this.selectedCategory);
    //     }.bind(this)
    //   );
    // }

    return values;
  }

  filtered_group_entries(group): Array<any> {
    let values = group.entries;
    if (group.searchBoxValue) {
      values = values.filter(
        (entry) => {
          return (
            entry.business_name
              .toLowerCase()
              .includes(group.searchBoxValue.toLowerCase()) ||
            `${entry.contact_first_name} ${entry.contact_last_name}`
              .toLocaleLowerCase()
              .includes(group.searchBoxValue.toLowerCase()) ||
            entry.business_summary
              .toLowerCase()
              .includes(group.searchBoxValue.toLowerCase()) ||
            entry.locations
              .toLowerCase()
              .includes(group.searchBoxValue.toLowerCase())
          );
        }
      );
    }
    if (this.searchBoxValue) {
      values = values.filter(
        (entry) => {
          return (
            entry.business_name
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            `${entry.contact_first_name} ${entry.contact_last_name}`
              .toLocaleLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.business_summary
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.locations
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase())
          );
        }
      );
    }

    // if (this.selectedCategory && this.selectedCategory != "all") {
    //   values = values.filter(
    //     function (entry) {
    //       return entry.industry.includes(this.selectedCategory);
    //     }.bind(this)
    //   );
    // }

    return values;
  }

  getAvatar(entry) {
    if (entry.photo) {
      return entry.photo;
    } else if (
      this.community.style_settings &&
      this.community.style_settings.default_entry_picture
    ) {
      return this.community.style_settings.default_entry_picture;
    } else {
      return "/assets/img/default-image.jpg";
    }
  }

  getCategories() {
    let categories = [];
    this.entries.map(
      function (entry) {
        categories.push(...entry.industry);
      }.bind(this)
    );
    // Clean duplicated
    this.categories = categories.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });
  }

  openDetailsModal(entry) {
    this.selectedEntry = entry;
    setTimeout(() => {
      this.modal.getModal("detailsModal").open();
    }, 100);
  }

  mapInitializer() {
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
  }

  codeAddress(entry) {
    this.geocoder.geocode({ address: entry.locations }, (results, status) => {
      if (status === "OK") {
        this.addMarker(results[0].geometry.location, entry)
      } else {
        console.log(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  }

  codeCoords(entry) {
    const location = new google.maps.LatLng(entry.lat, entry.lng)
    this.addMarker(location, entry)
  }

  cleanMarkers() {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.bounds = new google.maps.LatLngBounds();
    this.markers = [];
  }

  addMarker(location: any, entry: any) {
    const marker = new google.maps.Marker({
      map: this.map,
      position: location,
      animation: google.maps.Animation.DROP,
      title: entry.business_name
    });

    // Draw a circle
    if (entry.radius) {
      marker.Circle = new google.maps.Circle({
        center: marker.getPosition(),
        radius: this.getMeters(entry.radius),
        map: this.map,
        strokeColor: "#FF0000",
        strokeOpacity: 0.35,
        strokeWeight: 1,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
      });
      marker.Circle.bindTo("map", marker);
    }

    this.markers.push(marker);
    // Update bounds
    this.bounds.extend(marker.position);
    // Fit and center bounds
    this.map.setCenter(this.bounds.getCenter());
    this.map.fitBounds(this.bounds);
  }

  getMeters(i) {
    return i * 1609.344;
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${environment.serverURL}${image}`;
    }
    if (this.iglesia) {
      const path = this.fixUrl(this.iglesia.Logo);
      return path;
    }
    return '/assets/img/favicon.png';
  }

  closeOther(accordion: MatExpansionPanel) {
    this.accordions.filter(x => x.expanded && x.id !== accordion.id).forEach(accordion_arr => {
      accordion_arr.expanded = false;
    });
  }
}
