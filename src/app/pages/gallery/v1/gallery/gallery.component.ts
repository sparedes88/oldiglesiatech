import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { NgxSmartModalService } from "ngx-smart-modal";
import { ActivatedRoute } from "@angular/router";
import { NgbCarousel } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.component.html",
  styleUrls: ["./gallery.component.scss"],
})
export class GalleryComponent implements OnInit {

  @ViewChild('carousel') carousel: NgbCarousel;

  constructor(
    private api: ApiService,
    private modal: NgxSmartModalService,
    private route: ActivatedRoute
  ) {
    const id = this.route.snapshot.params["idGallery"];
    if (id) this.idGallery = id;
  }

  @Input() idGallery: number;
  @Input() show_horizontal: boolean = false;
  @Input('style_settings') style_settings: any;

  public gallery: any = {};
  public selectedPhoto: string;
  public loading: boolean = false;

  ngOnInit() {
    this.getGallery();
  }

  getGallery() {
    this.loading = true;
    this.api.get(`galleries/details/${this.idGallery}`).subscribe(
      (data: any) => {
        data.photos = JSON.parse(data.photos);
        this.gallery = data;
        console.log(this.gallery);
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      });
  }

  openPhoto(photo, index?: string) {
    this.selectedPhoto = photo;
    console.log(this.carousel);

    this.carousel.pause();
    this.carousel.interval = 0;
    if (index) {
      this.carousel.select(index);
    }
    this.modal.getModal("photoModal").open();
  }

  getUrlBack(photo) {
    return `url( ${photo} )`;
  }
}
