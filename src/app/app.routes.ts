import { Routes } from '@angular/router';
import {MainLayoutComponent} from "../layout/main-layout/main-layout-component";
import {PhotosGalleryComponent} from "../features/photos-gallery/photos-gallery.component";
import {SingleImageComponent} from "../features/single-image/signle-image.component";
import {FavouritesComponent} from "../features/favourites/favourites.component";

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: PhotosGalleryComponent
      },
      {
        path: 'favourites',
        component: FavouritesComponent
      },
      {
        path: 'photos/:id',
        component: SingleImageComponent
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
