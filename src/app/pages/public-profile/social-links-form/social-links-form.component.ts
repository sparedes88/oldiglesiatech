import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";

@Component({
  selector: "social-links-form",
  templateUrl: "./social-links-form.component.html",
  styleUrls: ["./social-links-form.component.scss"],
})
export class SocialLinksFormComponent implements OnInit {
  constructor() {}

  @Input() socialLinks: any;
  @Output() onSubmit = new EventEmitter();

  socialLinksForm: any = {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  };

  ngOnInit() {
    if (this.socialLinks) {
      this.socialLinksForm = Object.assign({}, this.socialLinks);
    }
  }

  onSubmitForm(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.onSubmit.emit(this.socialLinksForm);
  }
}
