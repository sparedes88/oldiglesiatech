import { ToastType } from 'src/app/login/ToastTypes';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-check-requirements',
  templateUrl: './check-requirements.component.html',
  styleUrls: ['./check-requirements.component.scss']
})
export class CheckRequirementsComponent implements OnInit {

  requisitos: any[];
  nivel: any;
  inputs_disabled: boolean = false;

  @Output('onDismiss') onDismiss = new EventEmitter();

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
  }

  initRequisitos() {
    const requisitosPrevios = [...this.requisitos];
    this.api.get('getRequisitosByIdNivel',
      { idNivel: this.nivel.idNivel })
      .subscribe(response => {
        this.requisitos = response["requisitos"];
        if (this.requisitos) {

          this.requisitos = this.requisitos.filter(item => {
            return item.estatus;
          })

          this.requisitos.map(requisito => {
            requisitosPrevios.map(requisitoPrevio => {
              if (requisitoPrevio.idRequisito === requisito.idRequisito) {
                requisito.cumplido = requisitoPrevio.cumplido;
              }
            })
          });
        } else {
          this.api.showToast(`Error getting requirements.`, ToastType.error)
        }
      }, err => {
        console.error(err);
        this.api.showToast(`Error getting requirements.`, ToastType.error)
      })
  }

  dismiss(response?) {
    if (response) {

      this.onDismiss.emit(
        {
          nivel: this.nivel,
          requisitos: this.requisitos
        }
      );
    } else {
      this.onDismiss.emit();
    }
  }

}
