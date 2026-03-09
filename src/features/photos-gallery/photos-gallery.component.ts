import {ChangeDetectionStrategy, Component, HostListener, Signal} from "@angular/core";
import {ImageComponent} from "@components/image/image.component";
import {PhotosGalleryComponentService} from "./photos-gallery-component.service";
import {toSignal} from "@angular/core/rxjs-interop";
import {ImageComponentModel} from "@components/image/image-component.model";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-photos-gallery',
  templateUrl: './photos-gallery.component.html',
  styleUrls: ['./photos-gallery.component.scss'],
  standalone: true,
  imports: [
    ImageComponent,
    MatProgressSpinner
  ],
  providers: [PhotosGalleryComponentService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosGalleryComponent {
  images: Signal<ImageComponentModel[]>;
  isLoading: Signal<boolean>
  hasError: Signal<boolean>

  private scrollingEventCheckDelayModeActive = false;

  constructor(private readonly photosGalleryComponentService: PhotosGalleryComponentService) {
    this.isLoading = toSignal(this.photosGalleryComponentService.isLoading$, { initialValue: false });
    this.hasError = toSignal(this.photosGalleryComponentService.hasError$, { initialValue: false });
    this.images = toSignal(this.photosGalleryComponentService.galleryViewImages$, { initialValue: [] });
    this.photosGalleryComponentService.init()
  }

  onImageClick(id: string) {
    this.photosGalleryComponentService.saveImage(id);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.scrollingEventCheckDelayModeActive) return;

    this.scrollingEventCheckDelayModeActive = true;

    setTimeout(() => {
      this.scrollingEventCheckDelayModeActive = false;
      const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
      const max = document.documentElement.scrollHeight;

      if (pos > max - 200 && !this.isLoading() && !this.hasError()) {
        this.photosGalleryComponentService.loadMore();
      }
    }, 100);
  }
}
