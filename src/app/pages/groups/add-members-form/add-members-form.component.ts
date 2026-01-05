import { UserService } from './../../../services/user.service';
import { GroupModel } from './../../../models/GroupModel';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder, NgForm } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-add-members-form',
  templateUrl: './add-members-form.component.html',
  styleUrls: ['./add-members-form.component.scss']
})
export class AddMembersFormComponent implements OnInit {

  @Output() submit = new EventEmitter();

  users: any[] = [];
  group: GroupModel;

  currentUser: User;

  public selectLeadersOptions: any = {
    singleSelection: false,
    idField: 'idUsuario',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  public formGroup: FormGroup = this.formBuilder.group({
    idGroup: [''],
    idIglesia: [''],
    leaders: ['', Validators.required],
    members: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private groupService: GroupsService
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
  }

  submitMembers(form: FormGroup, group_form: NgForm) {
    if (form.valid) {
      const payload = Object.assign({}, form.value);
      const id_leader_array = [];
      if (payload.leaders) {
        payload.leaders.map(x => {
          x.is_leader = true;
          id_leader_array.push(x.idUsuario);
        });
      } else {
        payload.leaders = [];
      }

      let members_clear = [];
      if (payload.members) {
        members_clear = payload.members.filter(user => {
          return !id_leader_array.includes(user.idUsuario);
        });
      }
      payload.members = payload.leaders.concat(members_clear);
      payload.created_by = this.currentUser.idUsuario;
      this.submit.emit(payload.members);
    }
  }

  patchUsers() {
    const leaders = this.users.filter(x => {
      return (this.group.leaders.filter(lead => {
        return lead.idUser === x.idUsuario;
      })).length > 0;
    });
    const members = this.users.filter(x => {
      return (this.group.members.filter(member => {
        return member.idUser === x.idUsuario;
      })).length > 0;
    });

    this.formGroup.patchValue({
      leaders,
      members
    });
  }

}
