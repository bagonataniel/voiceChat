import { TestBed } from '@angular/core/testing';

import { SupabaseRealtimeChatService } from './supabase-realtime-chat.service';

describe('SupabaseRealtimeChatService', () => {
  let service: SupabaseRealtimeChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseRealtimeChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
