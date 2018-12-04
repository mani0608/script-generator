import { TestBed } from '@angular/core/testing';

import { ResultService } from './result.service';

describe('ReviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResultService = TestBed.get(ResultService);
    expect(service).toBeTruthy();
  });
});
