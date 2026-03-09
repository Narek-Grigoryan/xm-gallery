import { TestBed } from '@angular/core/testing';
import { SingleImageComponentService } from './signle-image-component.service';
import { MyImagesStore } from '@stores/my-images.store';
import { PicsumImageItem } from '@services/picsum-api/picsum-api.models';
import { SingleImageModel } from './signle-image-component.model';

describe('SingleImageComponentService', () => {
  let service: SingleImageComponentService;
  let myImagesStore: jasmine.SpyObj<MyImagesStore>;

  const mockPicsumImageItem: PicsumImageItem = {
    id: '123',
    author: 'John Doe',
    url: 'https://example.com/image.jpg',
    download_url: 'https://example.com/download/image.jpg',
    width: 3000,
    height: 2000
  };

  const expectedModel: SingleImageModel = {
    id: '123',
    url: 'https://example.com/download/image.jpg',
    alt: 'John Doe',
    title: 'John Doe'
  };

  beforeEach(() => {
    const storeSpy = jasmine.createSpyObj<MyImagesStore>('MyImagesStore', [
      'removeItem'
    ]);

    TestBed.configureTestingModule({
      providers: [
        SingleImageComponentService,
        { provide: MyImagesStore, useValue: storeSpy }
      ]
    });

    service = TestBed.inject(SingleImageComponentService);
    myImagesStore = TestBed.inject(MyImagesStore) as jasmine.SpyObj<MyImagesStore>;
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('removeImageFromStore', () => {
    it('should call store removeItem with id', () => {
      service.removeImageFromStore('123');

      expect(myImagesStore.removeItem).toHaveBeenCalledWith('123');
    });

    it('should support multiple calls', () => {
      service.removeImageFromStore('123');
      service.removeImageFromStore('456');

      expect(myImagesStore.removeItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('mapPicsumImageToSingleImageModel', () => {
    it('should map PicsumImageItem to SingleImageModel', () => {
      const result = service.mapPicsumImageToSingleImageModel(mockPicsumImageItem);

      expect(result).toEqual(expectedModel);
    });

    it('should handle empty author', () => {
      const result = service.mapPicsumImageToSingleImageModel({
        ...mockPicsumImageItem,
        author: ''
      });

      expect(result.alt).toBe('');
      expect(result.title).toBe('');
    });

    it('should handle different urls', () => {
      const result = service.mapPicsumImageToSingleImageModel({
        ...mockPicsumImageItem,
        download_url: 'https://different.com/img.png'
      });

      expect(result.url).toBe('https://different.com/img.png');
    });

    it('should return a new object instance', () => {
      const result = service.mapPicsumImageToSingleImageModel(mockPicsumImageItem);

      expect(result).not.toBe(expectedModel);
    });
  });
});
