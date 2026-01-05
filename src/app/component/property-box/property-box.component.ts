import { Component, OnInit, Input, Renderer2, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const EPANDED_TEXTAREA_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PropertyBoxComponent),
  multi: true,
};

@Component({
  selector: 'property-box',
  templateUrl: './property-box.component.html',
  styleUrls: ['./property-box.component.scss']
})
export class PropertyBoxComponent implements ControlValueAccessor {
  constructor(private renderer: Renderer2) { }

  @Input() text: string
  @Input() label: string
  @Input() show_as_icon: boolean = false;
  @ViewChild('textarea') textarea;
  onChange
  onTouched

  writeValue(value: any): void {
    const div = this.textarea.nativeElement;
    this.renderer.setProperty(div, 'textContent', value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    const div = this.textarea.nativeElement;
    const action = isDisabled ? 'addClass' : 'removeClass';
    this.renderer[action](div, 'disabled');
  }

  change($event) {
    this.onChange($event.target.textContent);
    this.onTouched($event.target.textContent);
  }
}
