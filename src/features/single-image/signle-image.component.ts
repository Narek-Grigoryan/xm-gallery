import {ChangeDetectionStrategy, Component, OnInit, signal, Signal} from "@angular/core";
import {MatButton} from "@angular/material/button";
import {SingleImageComponentService} from "./signle-image-component.service";
import {SingleImageModel} from "./signle-image-component.model";
import {ActivatedRoute, Router} from "@angular/router";
import {MyImagesStore} from "@stores/my-images.store";

@Component({
  selector: 'app-signle-image',
  templateUrl: './signle-image.component.html',
  styleUrls: ['./signle-image.component.scss'],
  standalone: true,
  imports: [
    MatButton
  ],
  providers: [SingleImageComponentService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleImageComponent implements OnInit {
  image = signal<SingleImageModel | null>(null);

  constructor(
    private readonly singleImageComponentService: SingleImageComponentService,
    private readonly myImagesStore: MyImagesStore,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    const imageId = this.route.snapshot.paramMap.get('id');

    if (imageId && !isNaN(+imageId)) {
      const image = this.myImagesStore.getItem(imageId);

      if (image) {
        this.image.set(this.singleImageComponentService.mapPicsumImageToSingleImageModel(image))
        return;
      }
    }

    this.router.navigate(['']);
  }

  onRemoveImage(): void {
    const id = this.image()?.id || null;

    if (id) {
      this.singleImageComponentService.removeImageFromStore(id);
      this.router.navigate(['favourites']);
    }
  }
}
