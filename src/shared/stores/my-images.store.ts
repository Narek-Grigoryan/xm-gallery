import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {PicsumImageItem} from "../services/picsum-api/picsum-api.models";

@Injectable({
  providedIn: 'root'
})
export class MyImagesStore {
  savedImages$: BehaviorSubject<PicsumImageItem[]> = new BehaviorSubject<PicsumImageItem[]>([]);
  private readonly LOCAL_STORAGE_KEY = 'savedImages';

  constructor() {
    this.init();
  }

  init(): void {
    const localStorageSavedImages = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    this.savedImages$.next(localStorageSavedImages ? JSON.parse(localStorageSavedImages) : []);
  }

  saveItem(image: PicsumImageItem): void {
     const existingImage = this.getSavedImages().find((item) => item.id === image.id);

     if (existingImage) {
       throw new Error('Image already saved');
     }

     localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify([...this.getSavedImages(), image]));
     this.savedImages$.next([...this.savedImages$.value, image]);
  }

  getItem(id: string): PicsumImageItem | undefined {
    return this.getSavedImages().find((item) => item.id === id);
  }

  removeItem(id: string): void {
    const updatedSavedImages = this.getSavedImages().filter((item) => item.id !== id);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedImages));
    this.savedImages$.next(updatedSavedImages);
  }

  isItemSaved(id: string): boolean {
    return this.getSavedImages().some((item) => item.id === id);
  }

  getSavedImages(): PicsumImageItem[] {
    return this.savedImages$.value;
  }
}
