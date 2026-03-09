import {Injectable} from "@angular/core";
import {PicsumImageItem} from "@services/picsum-api/picsum-api.models";
import {SingleImageModel} from "./signle-image-component.model";
import {MyImagesStore} from "@stores/my-images.store";

@Injectable()
export class SingleImageComponentService {
  constructor(private readonly myImagesStore: MyImagesStore) {
  }

  removeImageFromStore(id: string): void {
    this.myImagesStore.removeItem(id);
  }

  mapPicsumImageToSingleImageModel(image: PicsumImageItem): SingleImageModel {
    return {
      id: image.id,
      url: image.download_url,
      alt: image.author,
      title: image.author
    }
  }
}
