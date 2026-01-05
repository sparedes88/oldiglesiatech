import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { Observable } from "rxjs";

@Component({
  selector: "community-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.scss"],
})
export class CategoriesComponent implements OnInit {
  constructor(private api: ApiService) {}

  @Output() onChange = new EventEmitter();

  public categories: any[] = [];
  public selectedCategory;
  public loading: boolean = false;
  public categoryForm = {
    id: null,
    name: "",
  };

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    this.api.get(`communityBox/meta/categories`).subscribe(
      (data: any) => {
        this.categories = data;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  openEdit(category) {
    this.categoryForm = Object.assign({}, category);
  }

  deleteCategory(category) {
    const msg = `Are you sure you want to delete ${category.name}?\nThis action can't be undone.`;
    if (confirm(msg)) {
      this.api.delete(`communityBox/meta/categories/${category.id}`).subscribe(
        () => {
          this.getCategories();
          this.onChange.emit();
        },
        (err) => console.error(err)
      );
    }
  }

  saveCategory() {
    let request: Observable<any>;
    this.loading = true;

    if (this.categoryForm.id) {
      request = this.api.patch(
        `communityBox/meta/categories/${this.categoryForm.id}`,
        this.categoryForm
      );
    } else {
      request = this.api.post(
        `communityBox/meta/categories`,
        this.categoryForm
      );
    }

    request.subscribe(
      (data: any) => {
        this.getCategories();

        this.categoryForm = {
          id: null,
          name: null,
        };

        this.loading = false;
        this.onChange.emit();
      },
      (err) => console.error(err)
    );
  }
}
