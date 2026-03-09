import {ChangeDetectionStrategy, Component, input, output} from "@angular/core";
import {ImageComponentModel} from "./image-component.model";
import {RecycleDirective} from "../../directives/recycle-div.directive";

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  standalone: true,
  imports: [
    RecycleDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent {
  readonly hasSavedMode = input.required<boolean>();
  readonly image = input.required<ImageComponentModel>();

  readonly imageClick = output<string>();

  onImageClick() {
    this.imageClick.emit(this.image().id);
  }
}
