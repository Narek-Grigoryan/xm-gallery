import {Injectable, signal} from "@angular/core";
import {PicsumImageItem} from "../picsum-api/picsum-api.models";
import {ImageComponentModel} from "../../components/image/image-component.model";

@Injectable({
  providedIn: 'root'
})
export class ImageMapperService {
  mapPicsumImageToImageComponentModel(image: PicsumImageItem): ImageComponentModel {
    return {
      id: image.id,
      imageSrc: image.download_url,
      imageAlt: image.author,
      saved: signal(false)
    }
  }
}
