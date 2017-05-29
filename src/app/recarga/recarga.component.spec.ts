/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RecargaComponent } from './recarga.component';

describe('RecargaComponent', () => {
  let component: RecargaComponent;
  let fixture: ComponentFixture<RecargaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecargaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
