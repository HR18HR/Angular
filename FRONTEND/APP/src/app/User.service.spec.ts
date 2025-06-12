import { TestBed } from '@angular/core/testing';

import {Userservice} from './User.service';

describe('LService', () => {
  let service:Userservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Userservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
