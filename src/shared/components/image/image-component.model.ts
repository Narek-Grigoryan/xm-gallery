import { WritableSignal } from "@angular/core";

export interface ImageComponentModel {
  id: string,
  imageSrc: string,
  imageAlt: string,
  saved: WritableSignal<boolean>
}
