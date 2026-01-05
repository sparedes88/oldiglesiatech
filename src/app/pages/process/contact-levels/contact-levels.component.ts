import { Component, OnInit, Input, SimpleChanges } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Component({
  selector: "app-contact-levels",
  templateUrl: "./contact-levels.component.html",
  styleUrls: ["./contact-levels.component.scss"]
})
export class ContactLevelsComponent implements OnInit {
  constructor(private api: ApiService) { }

  @Input() levelName: any;
  @Input() idNivel: any;
  @Input() idProcess: any;
  @Input() idIglesia: any;

  public pendingUsers: any[] = [];
  public completedUsers: any[] = [];
  loading: boolean = true

  ngOnChanges(changes: SimpleChanges): void {
    this.getUserLevels();
  }

  ngOnInit() {
    this.getUserLevels();
  }

  getUserLevels() {
    this.loading = true;
    if (this.idNivel) {

      this.api
        .get("reportModules/completedUserLevels", {
          idNivel: this.idNivel,
          idProcess: this.idProcess,
          idIglesia: this.idIglesia
        })
        .subscribe(
          (data: any) => {
            data.map(l => (l.completed = l.total == l.total_cumplidos));

            this.pendingUsers = data.filter(d => d.completed == false);
            this.completedUsers = data.filter(d => d.completed == true);

            console.log(data);
            this.loading = false;
          },
          err => {
            console.error(err);
            this.loading = false;
          }
        );
    } else {
      this.loading = false;
    }
  }
}
