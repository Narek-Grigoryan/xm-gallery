import { TestBed } from '@angular/core/testing';
import { FavouritesComponentService } from './favourites-component.service';
import { MyImagesStore } from '@stores/my-images.store';
import { ImageMapperService } from '@services/mappers/image-mapper.service';
import { PicsumImageItem } from '@services/picsum-api/picsum-api.models';
import { ImageComponentModel } from '@components/image/image-component.model';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { signal } from '@angular/core';

describe('FavouritesComponentService', () => {
  let service: FavouritesComponentService;
  let store: jasmine.SpyObj<MyImagesStore>;
  let mapper: jasmine.SpyObj<ImageMapperService>;
  let savedImages$: BehaviorSubject<PicsumImageItem[]>;

  const picsumItem: PicsumImageItem = {
    id: '123',
    author: 'John Doe',
    url: 'https://example.com/image.jpg',
    download_url: 'https://example.com/download/image.jpg',
    width: 3000,
    height: 2000
  };

  const mappedImage: ImageComponentModel = {
    id: '123',
    imageSrc: 'https://example.com/download/image.jpg',
    imageAlt: 'John Doe',
    saved: signal(false)
  };

  beforeEach(() => {
    savedImages$ = new BehaviorSubject<PicsumImageItem[]>([]);

    const storeSpy = jasmine.createSpyObj<MyImagesStore>('MyImagesStore', [], {
      savedImages$
    });

    const mapperSpy = jasmine.createSpyObj<ImageMapperService>('ImageMapperService', [
      'mapPicsumImageToImageComponentModel'
    ]);

    TestBed.configureTestingModule({
      providers: [
        FavouritesComponentService,
        { provide: MyImagesStore, useValue: storeSpy },
        { provide: ImageMapperService, useValue: mapperSpy }
      ]
    });

    service = TestBed.inject(FavouritesComponentService);
    store = TestBed.inject(MyImagesStore) as jasmine.SpyObj<MyImagesStore>;
    mapper = TestBed.inject(ImageMapperService) as jasmine.SpyObj<ImageMapperService>;
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should map saved images to ImageComponentModel', async () => {
    mapper.mapPicsumImageToImageComponentModel.and.returnValue(mappedImage);

    savedImages$.next([picsumItem]);

    const result = await firstValueFrom(service.favouriteImages$);

    expect(result).toEqual([mappedImage]);
    expect(mapper.mapPicsumImageToImageComponentModel).toHaveBeenCalledWith(picsumItem);
  });

  it('should return empty array when no saved images', async () => {
    savedImages$.next([]);

    const result = await firstValueFrom(service.favouriteImages$);

    expect(result).toEqual([]);
    expect(mapper.mapPicsumImageToImageComponentModel).not.toHaveBeenCalled();
  });

  it('should map multiple images', async () => {
    const secondItem: PicsumImageItem = {
      id: '456',
      author: 'Jane Smith',
      url: 'https://example.com/image2.jpg',
      download_url: 'https://example.com/download/image2.jpg',
      width: 2000,
      height: 1500
    };

    const secondMapped: ImageComponentModel = {
      id: '456',
      imageSrc: 'https://example.com/download/image2.jpg',
      imageAlt: 'Jane Smith',
      saved: signal(false)
    };

    mapper.mapPicsumImageToImageComponentModel.and.returnValues(mappedImage, secondMapped);

    savedImages$.next([picsumItem, secondItem]);

    const result = await firstValueFrom(service.favouriteImages$);

    expect(result).toEqual([mappedImage, secondMapped]);
    expect(mapper.mapPicsumImageToImageComponentModel).toHaveBeenCalledTimes(2);
  });
});
