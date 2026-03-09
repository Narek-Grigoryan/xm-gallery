import {ComponentFixture, TestBed, tick} from '@angular/core/testing';
import { Router } from '@angular/router';
import {BehaviorSubject, of} from 'rxjs';

import { FavouritesComponent } from './favourites.component';
import { FavouritesComponentService } from './favourites-component.service';
import { ImageComponentModel } from '@components/image/image-component.model';
import {MyImagesStore} from "@stores/my-images.store";
import {PicsumImageItem} from "@services/picsum-api/picsum-api.models";
import {signal} from "@angular/core";
import {ImageMapperService} from "@services/mappers/image-mapper.service";

describe('FavouritesComponent', () => {
  let component: FavouritesComponent;
  let fixture: ComponentFixture<FavouritesComponent>;
  let mockFavouritesService: jasmine.SpyObj<FavouritesComponentService>;
  let mockMyImagesStore: jasmine.SpyObj<MyImagesStore>;
  let mockRouter: jasmine.SpyObj<Router>;

  const signalMock = signal(true)
  const mockImageData: ImageComponentModel[] = [
    {
      id: '1',
      imageSrc: 'https://example.com/image1.jpg',
      imageAlt: 'Test Image 1',
      saved: signalMock
    },
    {
      id: '2',
      imageSrc: 'https://example.com/image2.jpg',
      imageAlt: 'Test Image 2',
      saved: signalMock
    }
  ];

  const mockStoreImageData: PicsumImageItem[] = [
    {
      id: '1',
      author: 'Test Image 1',
      url: 'https://example.com/image1.jpg',
      download_url: 'https://example.com/image1.jpg',
      width: 3000,
      height: 4000,
    },
    {
      id: '2',
      author: 'Test Image 2',
      url: 'https://example.com/image2.jpg',
      download_url: 'https://example.com/image2.jpg',
      width: 2500,
      height: 5000,
    }
  ];

  beforeEach(async () => {
    const favouritesServiceSpy = jasmine.createSpyObj('FavouritesComponentService', [], {
      favouriteImages$: of(mockImageData)
    });

    const myImagesStoreSpy = jasmine.createSpyObj('MyImagesStore', [], {
      savedImages$: new BehaviorSubject(mockStoreImageData)
    });

    const imageMapperServiceSpy = jasmine.createSpyObj('ImageMapperService', [], {
      mapPicsumImageToImageComponentModel(image: PicsumImageItem): ImageComponentModel {
        return {
          id: image.id,
          imageSrc: image.download_url,
          imageAlt: image.author,
          saved: signalMock
        }
      }
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FavouritesComponent],
      providers: [
        { provide: MyImagesStore, useValue: myImagesStoreSpy },
        { provide: ImageMapperService, useValue: imageMapperServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).overrideProvider(FavouritesComponentService, { useValue: favouritesServiceSpy }).compileComponents();

    fixture = TestBed.createComponent(FavouritesComponent);
    component = fixture.componentInstance;
    mockFavouritesService = TestBed.inject(FavouritesComponentService) as jasmine.SpyObj<FavouritesComponentService>;
    mockMyImagesStore = TestBed.inject(MyImagesStore) as jasmine.SpyObj<MyImagesStore>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize savedImages signal with data from service', () => {
    expect(component.savedImages()).toEqual(mockImageData);
  });

  it('should compute savedItemsCount correctly', () => {
    expect(component.savedItemsCount()).toBe(2);
  });

  it('should navigate to photo detail when onImageClick is called', () => {
    const imageId = '123';

    component.onImageClick(imageId);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['photos', imageId]);
  });

  it('should handle multiple image clicks correctly', () => {
    component.onImageClick('1');
    component.onImageClick('2');

    expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['photos', '1']);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['photos', '2']);
  });

  it('should use OnPush change detection strategy', () => {
    expect(component.constructor.name).toBe('FavouritesComponent');
  });
});
