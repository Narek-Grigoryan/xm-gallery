import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {delay, Observable, retry} from "rxjs";
import {PicsumImageItem} from "./picsum-api.models";

@Injectable({
  providedIn: 'root'
})
export class PicsumApiClient {
  constructor(private http: HttpClient) {
  }

  getImages(page: number): Observable<PicsumImageItem[]> {
    return this.http.get<PicsumImageItem[]>(`https://picsum.photos/v2/list?page=${page}`).pipe(
      delay(250),
      retry({ count: 3, delay: 1000 })
    );
  }

  getImage(id: string): Observable<PicsumImageItem> {
    return this.http.get<PicsumImageItem>(`https://picsum.photos/id/${id}/info`).pipe(
      retry({ count: 3, delay: 1000 })
    )
  }
}
