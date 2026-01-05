import { Component, OnInit, Input, SimpleChanges } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Component({
  selector: "app-contact-steps",
  templateUrl: "./contact-steps.component.html",
  styleUrls: ["./contact-steps.component.scss"]
})
export class ContactStepsComponent implements OnInit {
  constructor(private api: ApiService) { }

  @Input() stepName: any;
  @Input() idNivel: any;
  @Input() idProcess: any;
  @Input() idIglesia: any;
  @Input() idRequisito: any;

  public pendingUsers: any[] = [];
  public completedUsers: any[] = [];

  public loading: boolean = false

  ngOnInit() {
    this.getUsersStep();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getUsersStep();
  }

  getUsersStep() {
    this.loading = true

    this.api
      .get(`reportModules/completedUserSteps`, {
        idNivel: this.idNivel,
        idRequisito: this.idRequisito,
        idIglesia: this.idIglesia,
        idProcess: this.idProcess
      })
      .subscribe(
        (data: any) => {
          const step = data.find(x => x.idRequisito === this.idRequisito);
          if (step) {
            this.completedUsers = step.users.filter(s => s.cumplido);
            this.pendingUsers = step.users.filter(s => !s.cumplido);
          } else {
            this.completedUsers = [];
            this.pendingUsers = [];
          }

          this.loading = false
        },
        err => {
          console.error(err);
        }
      );
  }

  toggleStepStatus(idUser, status) {
    console.log(status);

    this.api
      .post("reportModules/completeStep", {
        idRequisito: this.idRequisito,
        idUsuario: idUser,
        cumplido: status,
        origin_id: 1
      })
      .subscribe(
        (data: any) => {
          console.log(data);
          this.getUsersStep()
        },
        err => {
          console.error(err);
        }
      );
  }
}
