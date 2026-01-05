import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Papa } from 'ngx-papaparse'
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  constructor(
    public api: ApiService,
    public formBuilder: FormBuilder,
    private papa: Papa,
    public userService: UserService
  ) { }

  ngOnInit() {
  }

  public contacts: any[] = []
  public user: any = this.userService.getCurrentUser()
  public file: any

  submitFile() {
    console.log(this.file)
    if (this.file) {
      this.papa.parse(this.file.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: parsedData => {
          this.contacts = parsedData.data
        },
        error: () => {
          alert(`Can't load the File`)
        }
      })
    }
  }

  startSubmitProcess() {
    if (this.contacts.length) {
      this.contacts.map(contact => {
        contact.loading = true
        contact.idIglesia = this.user.idIglesia
        // Encrypt pass
        contact.pass = UserService.encryptPass(contact.pass)
        // Reset status
        contact.error = false
        contact.success = false
        this.submitContact(contact)
      })
    } else {
      alert(`Plase select a .csv File`)
    }
  }

  submitContact(data: any) {
    this.api.post('insertUsuario', data)
      .subscribe(
        (res: any) => {
          if (res.msg.Code != 200) {
            data.error = true
          } else {
            data.success = true
          }
          data.loading = false
        },
        err => {
          console.error(err)
          data.error = true
          data.loading = false
        }
      )
  }
}
