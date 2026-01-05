import { ToastType } from './../../../login/ToastTypes';
import { Observable } from 'rxjs';
import { Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ToDoModel, ToDoTypeModel } from './../../../models/ToDoModel';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss']
})
export class TodoFormComponent implements OnInit {

  user: User;
  todo_form: FormGroup;
  @Input() todo: ToDoModel;
  @Input() types: ToDoTypeModel[] = [];
  @Output('cancel_form') cancel_form: EventEmitter<any> = new EventEmitter<any>()
  @Output('submit_form') submit_form: EventEmitter<any> = new EventEmitter<any>()

  constructor(
    private form_builder: FormBuilder,
    private userService: UserService,
    private organizationService: OrganizationService
  ) {
    this.user = this.userService.getCurrentUser();
    this.resetForm();
  }

  resetForm() {
    let obj;
    if (this.todo) {
      obj = {
        name: this.todo.name,
        description: this.todo.description,
        idToDoType: this.todo.idToDoType
      }
    } else {
      obj = {
        name: undefined,
        description: undefined,
        idToDoType: undefined
      }
    }
    this.todo_form = this.form_builder.group({
      idIglesia: new FormControl(this.user.idIglesia, [Validators.required]),
      name: new FormControl(obj.name, [Validators.required, Validators.maxLength(150)]),
      description: new FormControl(obj.description, [Validators.required, Validators.maxLength(1500)]),
      idToDoType: new FormControl(obj.idToDoType, [Validators.required]),
      created_by: new FormControl(this.user.idUsuario, [Validators.required]),
    });
  }

  ngOnInit() {
  }

  dismiss() {
    this.cancel_form.emit();
  }

  saveToDo() {
    if (this.todo_form.valid) {
      let subscription: Observable<any>;
      const todo: ToDoModel = this.todo_form.value;
      if (this.todo) {
        todo.idToDo = this.todo.idToDo;
        subscription = this.organizationService.updateTodo(todo)
      } else {
        subscription = this.organizationService.addTodo(todo)
      }
      subscription.subscribe(response => {
        console.log(response);
        this.submit_form.emit(response);
      })
    } else {
      this.organizationService.api.showToast(`Please check all the inputs are valid`, ToastType.info);
    }
  }

}
