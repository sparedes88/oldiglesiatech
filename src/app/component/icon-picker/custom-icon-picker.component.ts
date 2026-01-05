import { Input, ViewChild, forwardRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconPickerDirective } from 'ngx-icon-picker';
export const CUSTOM_ICON_PICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CustomIconPickerComponent),
  multi: true,
};
@Component({
  selector: 'app-custom-icon-picker',
  templateUrl: './custom-icon-picker.component.html',
  styleUrls: ['./custom-icon-picker.component.scss'],
  providers: [CUSTOM_ICON_PICKER_CONTROL_VALUE_ACCESSOR]
})
export class CustomIconPickerComponent implements ControlValueAccessor, OnInit {

  @Input('label') label ="Icon";
  @Input('required') required: boolean = false;
  @Input('small_label') small_label: boolean = false;
  @Input('icon_control') icon_control = new FormControl();
  fallbackIcon = 'fas fa-user';
  myFormGroup: FormGroup = new FormGroup({ icon_control: this.icon_control });

  constructor() { }

  ngOnInit() {
  }


  onIconPickerSelect(icon: string): void {
    this.icon_control.setValue(icon);
    this.onTouched(icon);
    this.onChange(icon);
  }

  picker: IconPickerDirective;

  @ViewChild(IconPickerDirective)
  set iconPicker(directive: IconPickerDirective) {
    this.picker = directive;
  };

  openDialog() {
    this.picker.openDialog();
  }

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  // ControlValueAccessor Implementation
  onChange: any = () => { };
  onTouched: any = () => { };

  //From ControlValueAccessor interface
  writeValue(value: any) {
    console.log(value);
    if(value){
      let fixed_value = value;
      if (!value.includes('fab ')) {
        fixed_value = `fab ${fixed_value}`
      }
      if (value !== this.myFormGroup.get('icon_control').value) {
        this.myFormGroup.get('icon_control').setValue(fixed_value);
      }
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
}
