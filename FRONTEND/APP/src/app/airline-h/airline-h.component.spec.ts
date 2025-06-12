import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineHComponent } from './airline-h.component';

describe('AirlineHComponent', () => {
  let component: AirlineHComponent;
  let fixture: ComponentFixture<AirlineHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineHComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
