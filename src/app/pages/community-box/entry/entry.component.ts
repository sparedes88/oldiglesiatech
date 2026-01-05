import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "community-entry",
  templateUrl: "./entry.component.html",
  styleUrls: ["./entry.component.scss"],
})
export class EntryComponent implements OnInit {
  constructor() {}

  @Input() selectedEntry: any = {};
  @Input() community: any = {
    style_settings: {},
  };

  ngOnInit() {}

  getAvatar(entry) {
    if (entry && entry.photo) {
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
}
