import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import slugify from 'slugify';

@Component({
  selector: "tab-form",
  templateUrl: "./tab-form.component.html",
  styleUrls: ["./tab-form.component.scss"],
})
export class TabFormComponent implements OnInit {
  constructor(private formBuilder: FormBuilder) { }

  @Input() tab: any;
  @Output() onSubmit = new EventEmitter();

  // Form
  public tabFormGroup: FormGroup = this.formBuilder.group({
    id: [],
    title: ["", Validators.required],
    slug: ["", Validators.required],
    active: [true],
  });

  ngOnInit() {
    if (this.tab) {
      this.tabFormGroup.patchValue({
        title: this.tab.title,
        slug: this.tab.slug,
        active: this.tab.active,
      });
    }
  }

  submitForm(form: FormGroup) {
    if (form.invalid) {
      return alert(`Please check the form and try again`);
    }
    console.log(form.value);
    let slug: string = form.value.slug;
    slug = slugify(slug);
    console.log(slug);

    this.onSubmit.emit(form.value);
  }

  slugifyTitle() {
    const title: string = this.tabFormGroup.get('title').value;
    if (title) {
      const slug = slugify(title.toLowerCase());
      // if (!this.tabFormGroup.get('slug').value) {
        this.tabFormGroup.get('slug').setValue(slug);
      // }
    }
  }

  slugifyValue() {
    let slug = this.tabFormGroup.get('slug').value;
    if (slug) {
      slug = slugify(slug);
      this.tabFormGroup.get('slug').setValue(slug);
    }
  }
}
