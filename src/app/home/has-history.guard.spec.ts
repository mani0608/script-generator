import { TestBed, async, inject } from '@angular/core/testing';

import { HasHistoryGuard } from './has-history.guard';

describe('HasHistoryGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HasHistoryGuard]
    });
  });

  it('should ...', inject([HasHistoryGuard], (guard: HasHistoryGuard) => {
    expect(guard).toBeTruthy();
  }));
});
