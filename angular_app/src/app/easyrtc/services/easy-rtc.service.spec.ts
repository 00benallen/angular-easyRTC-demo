import { TestBed } from '@angular/core/testing';

import { EasyRTCService } from './easy-rtc.service';

describe('EasyRTCService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EasyRTCService = TestBed.get(EasyRTCService);
    expect(service).toBeTruthy();
  });
});
