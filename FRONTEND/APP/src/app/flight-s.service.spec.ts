import { TestBed } from '@angular/core/testing';

import { FlightSService } from './flight-s.service';

describe('FlightSService', () => {
  let service: FlightSService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
