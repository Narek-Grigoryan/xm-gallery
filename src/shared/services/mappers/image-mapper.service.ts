import {Injectable, signal} from "@angular/core";
import {PicsumImageItem} from "../picsum-api/picsum-api.models";
import {ImageComponentModel} from "../../components/image/image-component.model";

@Injectable({
  providedIn: 'root'
})
export class ImageMapperService {
  readonly IMAGE_PATH = 'https://picsum.photos/id';

  mapPicsumImageToImageComponentModel(image: PicsumImageItem): ImageComponentModel {
    return {
      id: image.id,
      imageSrc: `${this.IMAGE_PATH}/${image.id}/300`,
      imageAlt: image.author,
      saved: signal(false)
    }
  }
}
