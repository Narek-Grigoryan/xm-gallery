import {TestBed} from '@angular/core/testing';
import {ImageMapperService} from './image-mapper.service';
import {PicsumImageItem} from '../picsum-api/picsum-api.models';

describe('ImageMapperService', () => {
  let service: ImageMapperService;

  const mockPicsumImageItem: PicsumImageItem = {
    id: '123',
    author: 'John Doe',
    url: 'https://example.com/image.jpg',
    download_url: 'https://example.com/download/image.jpg',
    width: 3000,
    height: 2000
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImageMapperService]
    });

    service = TestBed.inject(ImageMapperService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('mapPicsumImageToImageComponentModel', () => {

    it('should correctly map PicsumImageItem to ImageComponentModel', () => {
      const result = service.mapPicsumImageToImageComponentModel(mockPicsumImageItem);

      expect(result).toEqual({
        id: mockPicsumImageItem.id,
        imageSrc: mockPicsumImageItem.download_url,
        imageAlt: mockPicsumImageItem.author,
        saved: jasmine.any(Function)
      });

      expect(result.saved()).toBe(false);
    });

    it('should return a new instance each time', () => {
      const result1 = service.mapPicsumImageToImageComponentModel(mockPicsumImageItem);
      const result2 = service.mapPicsumImageToImageComponentModel(mockPicsumImageItem);

      expect(result1).not.toBe(result2);
      expect(result1.saved).not.toBe(result2.saved);
    });

    it('should create a working saved signal', () => {
      const result = service.mapPicsumImageToImageComponentModel(mockPicsumImageItem);

      expect(result.saved()).toBe(false);

      result.saved.set(true);
      expect(result.saved()).toBe(true);

      result.saved.set(false);
      expect(result.saved()).toBe(false);
    });

    it('should map different authors correctly', () => {
      const input: PicsumImageItem = {
        ...mockPicsumImageItem,
        author: 'Jane Smith'
      };

      const result = service.mapPicsumImageToImageComponentModel(input);

      expect(result.imageAlt).toBe('Jane Smith');
    });

    it('should handle empty author', () => {
      const input: PicsumImageItem = {
        ...mockPicsumImageItem,
        author: ''
      };

      const result = service.mapPicsumImageToImageComponentModel(input);

      expect(result.imageAlt).toBe('');
    });

    it('should handle special characters in author name', () => {
      const input: PicsumImageItem = {
        ...mockPicsumImageItem,
        author: 'José María & Co.'
      };

      const result = service.mapPicsumImageToImageComponentModel(input);

      expect(result.imageAlt).toBe('José María & Co.');
    });

    it('should map different URLs correctly', () => {
      const input: PicsumImageItem = {
        ...mockPicsumImageItem,
        download_url: 'https://different.com/image.png'
      };

      const result = service.mapPicsumImageToImageComponentModel(input);

      expect(result.imageSrc).toBe('https://different.com/image.png');
    });
  });
});
