import {ChangeDetectionStrategy, Component, computed, Signal} from "@angular/core";
import {ImageComponent} from "@components/image/image.component";
import {FavouritesComponentService} from "./favourites-component.service";
import {toSignal} from "@angular/core/rxjs-interop";
import {ImageComponentModel} from "@components/image/image-component.model";
import {Router} from "@angular/router";


@Component({
  selector: 'favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.scss'],
  standalone: true,
  imports: [
    ImageComponent
  ],
  providers: [FavouritesComponentService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavouritesComponent {
  savedImages: Signal<ImageComponentModel[]>
  savedItemsCount = computed(() => {
    return this.savedImages().length;
  })

  constructor(
    private readonly favouritesComponentService: FavouritesComponentService,
    private readonly router: Router
  ) {
    this.savedImages = toSignal(this.favouritesComponentService.favouriteImages$, { initialValue: [] })
  }

  onImageClick(id: string): void {
    this.router.navigate(['photos', id]);
  }
}
