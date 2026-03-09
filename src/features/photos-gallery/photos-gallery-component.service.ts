import {Injectable, signal} from "@angular/core";
import {PicsumApiClient} from "@services/picsum-api/picsum-api.client";
import {BehaviorSubject, catchError, map, of, tap} from "rxjs";
import {PicsumImageItem} from "@services/picsum-api/picsum-api.models";
import {ImageComponentModel} from "@components/image/image-component.model";
import {MyImagesStore} from "@stores/my-images.store";
import {finalize} from "rxjs/operators";
import {ImageMapperService} from "@services/mappers/image-mapper.service";

@Injectable()
export class PhotosGalleryComponentService {
  galleryViewImages$: BehaviorSubject<ImageComponentModel[]> = new BehaviorSubject<ImageComponentModel[]>([]);
  // This property can be removed in the current case I just need to redefine the store item type,
  // and that's it. But I do this way because I need to save the item in store and may be there will
  // be a need of using that store from other parts of the application and the full data should be available
  private loadedImages: PicsumImageItem[] = [];
  private currentPage = 1;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  hasError$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly picsumApiClient: PicsumApiClient,
    private readonly myImagesStore: MyImagesStore,
    private readonly imageMapperService: ImageMapperService
  ) {}

  init(): void {
    this.loadImages();
  }

  saveImage(id: string): void {
    const imageToBeSaved = this.loadedImages.find((item) => item.id === id);

    if (imageToBeSaved) {
      this.myImagesStore.saveItem(imageToBeSaved);
      this.galleryViewImages$.getValue().forEach((item) => {
        if (item.id === id) {
          item.saved.set(true)
        }
      });
    }
  }

  loadMore(): void {
    this.currentPage++;
    this.loadImages();
  }

  private loadImages(): void {
    if (this.isLoading$.value) {
      return;
    }

    this.isLoading$.next(true);
    this.picsumApiClient.getImages(this.currentPage).pipe(
      tap((images) => this.loadedImages = this.loadedImages.concat(images)),
      map((images) => {
        return images.map((image) => {
          const newImage = this.imageMapperService.mapPicsumImageToImageComponentModel(image);
          newImage.saved.set(this.myImagesStore.isItemSaved(image.id));
          return newImage;
        })
      }),
      finalize(() => this.isLoading$.next(false)),
      catchError(err => {
        console.log(err);
        this.hasError$.next(true);
        return of([])
      })
    ).subscribe(images => {
      this.galleryViewImages$.next(this.galleryViewImages$.value.concat(images));
    });
  }

}
