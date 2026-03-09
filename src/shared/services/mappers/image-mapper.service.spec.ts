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

  describe('IMAGE_PATH constant', () => {
    it('should have the correct IMAGE_PATH value', () => {
      expect(service.IMAGE_PATH).toBe('https://picsum.photos/id');
    });
  });

  describe('mapPicsumImageToImageComponentModel', () => {

    it('should correctly map PicsumImageItem to ImageComponentModel', () => {
      const result = service.mapPicsumImageToImageComponentModel(mockPicsumImageItem);

      expect(result).toEqual({
        id: mockPicsumImageItem.id,
        imageSrc: `${service.IMAGE_PATH}/${mockPicsumImageItem.id}/300`,
        imageAlt: mockPicsumImageItem.author,
        saved: jasmine.any(Function)
      });

      expect(result.saved()).toBe(false);
    });

    it('should construct correct imageSrc URL using IMAGE_PATH and image id', () => {
      const result = service.mapPicsumImageToImageComponentModel(mockPicsumImageItem);

      expect(result.imageSrc).toBe('https://picsum.photos/id/123/300');
    });

    it('should construct correct imageSrc URL for different image ids', () => {
      const testCases = [
        { id: '456', expected: 'https://picsum.photos/id/456/300' },
        { id: '789', expected: 'https://picsum.photos/id/789/300' },
        { id: '0', expected: 'https://picsum.photos/id/0/300' },
        { id: '999', expected: 'https://picsum.photos/id/999/300' }
      ];

      testCases.forEach(testCase => {
        const input: PicsumImageItem = {
          ...mockPicsumImageItem,
          id: testCase.id
        };

        const result = service.mapPicsumImageToImageComponentModel(input);

        expect(result.imageSrc).toBe(testCase.expected);
      });
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

    it('should handle special characters in image id', () => {
      const input: PicsumImageItem = {
        ...mockPicsumImageItem,
        id: '123-abc'
      };

      const result = service.mapPicsumImageToImageComponentModel(input);

      expect(result.imageSrc).toBe('https://picsum.photos/id/123-abc/300');
      expect(result.id).toBe('123-abc');
    });

    it('should map all properties correctly with different input values', () => {
      const input: PicsumImageItem = {
        id: '999',
        author: 'Test Author',
        url: 'https://test.com/image.jpg',
        download_url: 'https://test.com/download/image.jpg',
        width: 4000,
        height: 3000
      };

      const result = service.mapPicsumImageToImageComponentModel(input);

      expect(result.id).toBe('999');
      expect(result.imageSrc).toBe('https://picsum.photos/id/999/300');
      expect(result.imageAlt).toBe('Test Author');
      expect(result.saved()).toBe(false);
    });

    it('should ignore download_url and use constructed URL instead', () => {
      const input: PicsumImageItem = {
        ...mockPicsumImageItem,
        id: '555',
        download_url: 'https://completely-different-url.com/image.jpg'
      };

      const result = service.mapPicsumImageToImageComponentModel(input);

      expect(result.imageSrc).toBe('https://picsum.photos/id/555/300');
      expect(result.imageSrc).not.toBe(input.download_url);
    });
  });
});
