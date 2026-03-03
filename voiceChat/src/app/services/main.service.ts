import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(private _http: HttpClient) { }

  async getToken(participantName: string): Promise<string> {
    return this._http.post<{token: string}>('https://yublnlwgsacateiatolf.supabase.co/functions/v1/token-generator', { participantName: participantName })
      .toPromise()
      .then(data => {
        if (!data) {
          throw new Error('Failed to retrieve token');
        }
        return data.token;
      });
  }
}
