import { Component, OnInit, ElementRef, ViewChild, Input, AfterViewInit } from '@angular/core';
declare var google;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

  @Input() locations: { lat: number, lng: number }[] = [];
  @Input() height: number = 500;
  @Input() show_map_types: boolean = false;
  @Input() allow_street_view: boolean = true;
  @Input() drop_with_delay: boolean = false;
  @Input() delay_time: number = 200;
  @Input() disable_scroll: boolean = false;
  @ViewChild("mapContainer") gmap: ElementRef;
  map: google.maps.Map;
  mapOptions: google.maps.MapOptions;
  geocoder: google.maps.Geocoder = new google.maps.Geocoder();;
  bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();;

  infoWindow: any;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.mapInitializer();
    this.infoWindow = new google.maps.InfoWindow();
    this.locations.forEach((location, index) => {
      if (this.drop_with_delay) {
        setTimeout(() => {
          this.codeCoords(location);
        }, index * this.delay_time);
      } else {
        this.codeCoords(location);
      }
    })
  }

  mapInitializer() {
    this.mapOptions = {
      center: new google.maps.LatLng(36, -119),
      zoom: 17,
    };
    if (!this.show_map_types) {
      this.mapOptions.mapTypeControlOptions = {
        mapTypeIds: []
      }
    }
    this.mapOptions.streetViewControl = this.allow_street_view;
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    if (this.disable_scroll) {
      this.map.set('draggable', false);
    }
  }

  codeCoords(entry) {
    const location = new google.maps.LatLng(entry.lat, entry.lng)
    let image: string;
    if (entry.image) {
      image = entry.image;
    }
    this.addMarker(location, entry, image)
  }

  addMarker(location: any, entry: any, image?: string) {
    let marker;

    if (image) {
      const icon = {
        url: image, // url
        scaledSize: new google.maps.Size(30, 30), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
      };
      marker = new google.maps.Marker({
        icon,
        map: this.map,
        position: location,
        animation: google.maps.Animation.DROP,
        title: entry.title
      });
    } else {
      marker = new google.maps.Marker({
        map: this.map,
        position: location,
        animation: google.maps.Animation.DROP,
        title: entry.title
      });
    }
    marker.addListener("click", () => {
      console.log(marker);
      console.log(marker.getTitle());

      this.infoWindow.close();
      this.infoWindow.setContent(marker.getTitle());
      this.infoWindow.open(marker.getMap(), marker);
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

    // // Update bounds
    this.bounds.extend(marker.position);
    // // Fit and center bounds
    this.map.setCenter(this.bounds.getCenter());
    if (this.locations.length > 1) {
      this.map.fitBounds(this.bounds);
    }
  }

  getMeters(i) {
    return i * 1609.344;
  }

}
