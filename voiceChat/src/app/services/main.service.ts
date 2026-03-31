import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { supabase } from '../core/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private groupsSubject = new BehaviorSubject<any[]>([]);
  groups$: Observable<any[]> = this.groupsSubject.asObservable();

  private selectedGroupUsers = new BehaviorSubject<any[]>([]);
  selectedGroupUsers$: Observable<any[]> = this.selectedGroupUsers.asObservable();

  private settingsVisibility = new BehaviorSubject<boolean>(false);
  settingsVisibility$ = this.settingsVisibility.asObservable();

  setSettingsVisibility(val: boolean) {
    this.settingsVisibility.next(val);
  }

  constructor(private _http: HttpClient) { }

  setGroups(groups: any[]): void {
    this.groupsSubject.next(groups);
  }

  getGroups(): any[] {
    return this.groupsSubject.value;
  }

  async setSelectedGroupUsers(groupId: number) {
    await supabase.from('user_groups').select('user_id').eq('group_id', groupId).then(async response => {
      if (response.data) {
        const userIds = response.data.map(member => member.user_id);
        await supabase.from('profiles').select('*').in('id', userIds).then(userResponse => {
          if (userResponse.data) {
            this.selectedGroupUsers.next(userResponse.data as any)
          }
        });
      }
    });
  }

  async getToken(participantName: string, roomName: string): Promise<string> {
    return this._http.post<{ token: string }>('https://yublnlwgsacateiatolf.supabase.co/functions/v1/token-generator', { participantName: participantName, roomName: roomName })
      .toPromise()
      .then(data => {
        if (!data) {
          throw new Error('Failed to retrieve token');
        }
        return data.token;
      });
  }
}
