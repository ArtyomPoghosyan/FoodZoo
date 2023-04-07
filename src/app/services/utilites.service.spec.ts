import { TestBed } from '@angular/core/testing';

import { UtilitesService } from './utilites.service';

describe('UtilitesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UtilitesService = TestBed.get(UtilitesService);
    expect(service).toBeTruthy();
  });
});
