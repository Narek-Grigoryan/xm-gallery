import {fakeAsync, TestBed} from '@angular/core/testing';
import { MyImagesStore } from './my-images.store';
import { PicsumImageItem } from '../services/picsum-api/picsum-api.models';

describe('MyImagesStore', () => {
  let store: MyImagesStore;
  let mockLocalStorage: { [key: string]: string };

  const mockPicsumImageItem: PicsumImageItem = {
    id: '123',
    author: 'John Doe',
    url: 'https://example.com/image.jpg',
    download_url: 'https://example.com/download/image.jpg',
    width: 3000,
    height: 2000
  };

  const mockPicsumImageItem2: PicsumImageItem = {
    id: '456',
    author: 'Jane Smith',
    url: 'https://example.com/image2.jpg',
    download_url: 'https://example.com/download/image2.jpg',
    width: 2500,
    height: 1800
  };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    TestBed.configureTestingModule({
      providers: [MyImagesStore]
    });

    store = TestBed.inject(MyImagesStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with empty array when localStorage is empty', () => {
      expect(store.getSavedImages()).toEqual([]);
      expect(store.savedImages$.value).toEqual([]);
    });

    it('should initialize with data from localStorage', () => {
      const savedImages = [mockPicsumImageItem, mockPicsumImageItem2];
      mockLocalStorage['savedImages'] = JSON.stringify(savedImages);

      // Create new store instance to test initialization
      const newStore = new MyImagesStore();

      expect(newStore.getSavedImages()).toEqual(savedImages);
      expect(newStore.savedImages$.value).toEqual(savedImages);
    });

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage['savedImages'] = 'invalid json';

      expect(() => {
        const newStore = new MyImagesStore();
      }).toThrow();
    });

    it('should handle null localStorage value', () => {
      mockLocalStorage['savedImages'] = '';

      const newStore = new MyImagesStore();

      expect(newStore.getSavedImages()).toEqual([]);
    });
  });

  describe('saveItem', () => {
    it('should save new image', () => {
      store.saveItem(mockPicsumImageItem);

      expect(store.getSavedImages()).toContain(mockPicsumImageItem);
      expect(store.savedImages$.value).toContain(mockPicsumImageItem);
      expect(localStorage.setItem).toHaveBeenCalledWith('savedImages', JSON.stringify([mockPicsumImageItem]));
    });

    it('should save multiple images', () => {
      store.saveItem(mockPicsumImageItem);
      store.saveItem(mockPicsumImageItem2);

      const savedImages = store.getSavedImages();
      expect(savedImages).toContain(mockPicsumImageItem);
      expect(savedImages).toContain(mockPicsumImageItem2);
      expect(savedImages.length).toBe(2);
    });

    it('should throw error when saving duplicate image', () => {
      store.saveItem(mockPicsumImageItem);

      expect(() => {
        store.saveItem(mockPicsumImageItem);
      }).toThrowError('Image already saved');
    });

    it('should throw error when saving image with same id', () => {
      const duplicateIdImage: PicsumImageItem = {
        ...mockPicsumImageItem,
        author: 'Different Author'
      };

      store.saveItem(mockPicsumImageItem);

      expect(() => {
        store.saveItem(duplicateIdImage);
      }).toThrowError('Image already saved');
    });

    it('should update localStorage correctly', () => {
      store.saveItem(mockPicsumImageItem);
      store.saveItem(mockPicsumImageItem2);

      expect(localStorage.setItem).toHaveBeenCalledTimes(2);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'savedImages',
        JSON.stringify([mockPicsumImageItem, mockPicsumImageItem2])
      );
    });
  });

  describe('getItem', () => {
    beforeEach(() => {
      store.saveItem(mockPicsumImageItem);
      store.saveItem(mockPicsumImageItem2);
    });

    it('should return existing image by id', () => {
      const result = store.getItem('123');

      expect(result).toEqual(mockPicsumImageItem);
    });

    it('should return undefined for non-existing image', () => {
      const result = store.getItem('999');

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string id', () => {
      const result = store.getItem('');

      expect(result).toBeUndefined();
    });

    it('should handle different ids correctly', () => {
      expect(store.getItem('123')).toEqual(mockPicsumImageItem);
      expect(store.getItem('456')).toEqual(mockPicsumImageItem2);
      expect(store.getItem('789')).toBeUndefined();
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      store.saveItem(mockPicsumImageItem);
      store.saveItem(mockPicsumImageItem2);
    });

    it('should remove existing image', () => {
      store.removeItem('123');

      expect(store.getSavedImages()).not.toContain(mockPicsumImageItem);
      expect(store.getSavedImages()).toContain(mockPicsumImageItem2);
      expect(store.getSavedImages().length).toBe(1);
    });

    it('should update localStorage after removal', () => {
      store.removeItem('123');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'savedImages',
        JSON.stringify([mockPicsumImageItem2])
      );
    });

    it('should update savedImages$ observable', () => {
      store.removeItem('123');

      expect(store.savedImages$.value).not.toContain(mockPicsumImageItem);
      expect(store.savedImages$.value).toContain(mockPicsumImageItem2);
    });

    it('should handle removing non-existing image gracefully', () => {
      const initialLength = store.getSavedImages().length;

      store.removeItem('999');

      expect(store.getSavedImages().length).toBe(initialLength);
      expect(store.getSavedImages()).toContain(mockPicsumImageItem);
      expect(store.getSavedImages()).toContain(mockPicsumImageItem2);
    });

    it('should handle empty string id', () => {
      const initialLength = store.getSavedImages().length;

      store.removeItem('');

      expect(store.getSavedImages().length).toBe(initialLength);
    });

    it('should remove all items when called multiple times', () => {
      store.removeItem('123');
      store.removeItem('456');

      expect(store.getSavedImages()).toEqual([]);
      expect(store.savedImages$.value).toEqual([]);
    });
  });

  describe('isItemSaved', () => {
    beforeEach(() => {
      store.saveItem(mockPicsumImageItem);
    });

    it('should return true for saved image', () => {
      expect(store.isItemSaved('123')).toBe(true);
    });

    it('should return false for non-saved image', () => {
      expect(store.isItemSaved('999')).toBe(false);
    });

    it('should return false for empty string id', () => {
      expect(store.isItemSaved('')).toBe(false);
    });

    it('should update correctly after saving new item', () => {
      expect(store.isItemSaved('456')).toBe(false);

      store.saveItem(mockPicsumImageItem2);

      expect(store.isItemSaved('456')).toBe(true);
    });

    it('should update correctly after removing item', () => {
      expect(store.isItemSaved('123')).toBe(true);

      store.removeItem('123');

      expect(store.isItemSaved('123')).toBe(false);
    });
  });

  describe('getSavedImages', () => {
    it('should return empty array initially', () => {
      expect(store.getSavedImages()).toEqual([]);
    });

    it('should return all saved images', () => {
      store.saveItem(mockPicsumImageItem);
      store.saveItem(mockPicsumImageItem2);

      const savedImages = store.getSavedImages();
      expect(savedImages.length).toBe(2);
      expect(savedImages).toContain(mockPicsumImageItem);
      expect(savedImages).toContain(mockPicsumImageItem2);
    });

    it('should return current value of savedImages$ observable', () => {
      store.saveItem(mockPicsumImageItem);

      expect(store.getSavedImages()).toEqual(store.savedImages$.value);
    });

    it('should return reference to the same array', () => {
      store.saveItem(mockPicsumImageItem);

      const result1 = store.getSavedImages();
      const result2 = store.getSavedImages();

      expect(result1).toBe(result2);
      expect(result1).toBe(store.savedImages$.value);
    });
  });

  describe('observable behavior', () => {
    // We use fakeAsync to handle time-based tests if needed,
    // though BehaviorSubject emits synchronously.
    it('should emit initial value', fakeAsync(() => {
      let emittedImages: PicsumImageItem[] | undefined;

      store.savedImages$.subscribe(images => {
        emittedImages = images;
      });

      // BehaviorSubject emits the current value immediately upon subscription
      expect(emittedImages).toEqual([]);
    }));

    it('should emit when new item is saved', fakeAsync(() => {
      const emissions: PicsumImageItem[][] = [];

      store.savedImages$.subscribe(images => {
        emissions.push(images);
      });

      store.saveItem(mockPicsumImageItem);

      expect(emissions.length).toBe(2); // Initial empty + saved item
      expect(emissions[0]).toEqual([]);
      expect(emissions[1]).toEqual([mockPicsumImageItem]);
    }));

    it('should emit when item is removed', fakeAsync(() => {
      store.saveItem(mockPicsumImageItem);
      const emissions: PicsumImageItem[][] = [];

      store.savedImages$.subscribe(images => {
        emissions.push(images);
      });

      store.removeItem('123');

      expect(emissions.length).toBe(2); // Initial saved item + empty array
      expect(emissions[0]).toEqual([mockPicsumImageItem]);
      expect(emissions[1]).toEqual([]);
    }));
  });

  describe('edge cases', () => {
    it('should handle images with special characters in id', () => {
      const specialImage: PicsumImageItem = {
        id: 'test-123_special!@#',
        author: 'Special Author',
        url: 'https://example.com/special.jpg',
        download_url: 'https://example.com/download/special.jpg',
        width: 1000,
        height: 1000
      };

      store.saveItem(specialImage);

      expect(store.isItemSaved('test-123_special!@#')).toBe(true);
      expect(store.getItem('test-123_special!@#')).toEqual(specialImage);

      store.removeItem('test-123_special!@#');

      expect(store.isItemSaved('test-123_special!@#')).toBe(false);
    });

    it('should handle images with empty author', () => {
      const imageWithEmptyAuthor: PicsumImageItem = {
        id: '789',
        author: '',
        url: 'https://example.com/empty.jpg',
        download_url: 'https://example.com/download/empty.jpg',
        width: 500,
        height: 500
      };

      expect(() => {
        store.saveItem(imageWithEmptyAuthor);
      }).not.toThrow();

      expect(store.getItem('789')).toEqual(imageWithEmptyAuthor);
    });

    it('should handle very large images data', () => {
      const largeImage: PicsumImageItem = {
        id: '999',
        author: 'A'.repeat(1000), // Very long author name
        url: 'https://example.com/' + 'x'.repeat(500) + '.jpg',
        download_url: 'https://example.com/download/' + 'y'.repeat(500) + '.jpg',
        width: 99999,
        height: 99999
      };

      expect(() => {
        store.saveItem(largeImage);
      }).not.toThrow();

      expect(store.getItem('999')).toEqual(largeImage);
    });
  });
});
