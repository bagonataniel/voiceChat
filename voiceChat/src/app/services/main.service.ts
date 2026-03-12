import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private groupsSubject = new BehaviorSubject<any[]>([]);
  groups$: Observable<any[]> = this.groupsSubject.asObservable();

  constructor(private _http: HttpClient) { }

  setGroups(groups: any[]): void {
    this.groupsSubject.next(groups);
  }

  getGroups(): any[] {
    return this.groupsSubject.value;
  }

  async getToken(participantName: string, roomName: string): Promise<string> {
    return this._http.post<{token: string}>('https://yublnlwgsacateiatolf.supabase.co/functions/v1/token-generator', { participantName: participantName, roomName: roomName })
      .toPromise()
      .then(data => {
        if (!data) {
          throw new Error('Failed to retrieve token');
        }
        return data.token;
      });
  }
}
