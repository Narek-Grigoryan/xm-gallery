import {Injectable} from "@angular/core";
import {MyImagesStore} from "@stores/my-images.store";
import {map, Observable} from "rxjs";
import {ImageComponentModel} from "@components/image/image-component.model";
import {ImageMapperService} from "@services/mappers/image-mapper.service";

@Injectable()
export class FavouritesComponentService {
  favouriteImages$: Observable<ImageComponentModel[]>;

  constructor(
    private readonly imageMapperService: ImageMapperService,
    private readonly myImagesStore: MyImagesStore
  ) {
    this.favouriteImages$ = this.myImagesStore.savedImages$.pipe(
      map((images) => {
        return images.map((image) => this.imageMapperService.mapPicsumImageToImageComponentModel(image))
      }),
    )
  }
}
