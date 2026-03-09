import { TestBed } from '@angular/core/testing';
import { PhotosGalleryComponentService } from './photos-gallery-component.service';
import { PicsumApiClient } from '@services/picsum-api/picsum-api.client';
import { MyImagesStore } from '@stores/my-images.store';
import { ImageMapperService } from '@services/mappers/image-mapper.service';
import { PicsumImageItem } from '@services/picsum-api/picsum-api.models';
import { ImageComponentModel } from '@components/image/image-component.model';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('PhotosGalleryComponentService', () => {
  let service: PhotosGalleryComponentService;
  let picsumApi: jasmine.SpyObj<PicsumApiClient>;
  let store: jasmine.SpyObj<MyImagesStore>;
  let mapper: jasmine.SpyObj<ImageMapperService>;

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
    const picsumSpy = jasmine.createSpyObj<PicsumApiClient>('PicsumApiClient', ['getImages']);
    const storeSpy = jasmine.createSpyObj<MyImagesStore>('MyImagesStore', ['saveItem', 'isItemSaved']);
    const mapperSpy = jasmine.createSpyObj<ImageMapperService>('ImageMapperService', [
      'mapPicsumImageToImageComponentModel'
    ]);

    TestBed.configureTestingModule({
      providers: [
        PhotosGalleryComponentService,
        { provide: PicsumApiClient, useValue: picsumSpy },
        { provide: MyImagesStore, useValue: storeSpy },
        { provide: ImageMapperService, useValue: mapperSpy }
      ]
    });

    service = TestBed.inject(PhotosGalleryComponentService);
    picsumApi = TestBed.inject(PicsumApiClient) as jasmine.SpyObj<PicsumApiClient>;
    store = TestBed.inject(MyImagesStore) as jasmine.SpyObj<MyImagesStore>;
    mapper = TestBed.inject(ImageMapperService) as jasmine.SpyObj<ImageMapperService>;
  });

  function mockLoad(saved = false) {
    picsumApi.getImages.and.returnValue(of([picsumItem]));
    mapper.mapPicsumImageToImageComponentModel.and.returnValue({
      ...mappedImage,
      saved: signal(saved)
    });
    store.isItemSaved.and.returnValue(saved);
  }

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should load first page', () => {
      mockLoad();

      service.init();

      expect(picsumApi.getImages).toHaveBeenCalledWith(1);
    });
  });

  describe('saveImage', () => {
    beforeEach(() => {
      mockLoad(false);
      service.init();
    });

    it('should save image when found', () => {
      service.saveImage('123');

      expect(store.saveItem).toHaveBeenCalledWith(picsumItem);
      const image = service.galleryViewImages$.value.find(i => i.id === '123');
      expect(image?.saved()).toBe(true);
    });

    it('should not save if image does not exist', () => {
      service.saveImage('not-found');

      expect(store.saveItem).not.toHaveBeenCalled();
    });
  });

  describe('loadMore', () => {
    it('should request next page', () => {
      mockLoad();

      service.loadMore();

      expect(picsumApi.getImages).toHaveBeenCalledWith(2);
    });
  });

  describe('loadImages', () => {
    it('should map and store images', () => {
      mockLoad(true);

      service.init();

      expect(mapper.mapPicsumImageToImageComponentModel).toHaveBeenCalledWith(picsumItem);
      expect(store.isItemSaved).toHaveBeenCalledWith('123');
    });

    it('should append images to existing list', () => {
      const existing: ImageComponentModel = {
        id: '456',
        imageSrc: 'https://example.com/existing.jpg',
        imageAlt: 'Existing',
        saved: signal(false)
      };

      service.galleryViewImages$.next([existing]);
      mockLoad();

      service.loadMore();

      const images = service.galleryViewImages$.value;
      expect(images.length).toBe(2);
      expect(images[0]).toBe(existing);
      expect(images[1].id).toBe('123');
    });

    it('should set error state on API failure', () => {
      picsumApi.getImages.and.returnValue(throwError(() => new Error('API Error')));

      service.init();

      expect(service.hasError$.value).toBe(true);
      expect(service.isLoading$.value).toBe(false);
    });

    it('should not load if already loading', () => {
      service.isLoading$.next(true);

      service.init();

      expect(picsumApi.getImages).not.toHaveBeenCalled();
    });
  });
});
