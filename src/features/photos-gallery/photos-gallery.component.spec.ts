import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PhotosGalleryComponent } from './photos-gallery.component';
import { PhotosGalleryComponentService } from './photos-gallery-component.service';
import { ImageComponentModel } from '@components/image/image-component.model';

describe('PhotosGalleryComponent', () => {
  let component: PhotosGalleryComponent;
  let fixture: ComponentFixture<PhotosGalleryComponent>;
  let mockPhotosGalleryService: jasmine.SpyObj<PhotosGalleryComponentService>;

  const mockImageData: ImageComponentModel[] = [
    {
      id: '1',
      imageSrc: 'https://example.com/image1.jpg',
      imageAlt: 'Test Image 1',
      saved: signal(false)
    },
    {
      id: '2',
      imageSrc: 'https://example.com/image2.jpg',
      imageAlt: 'Test Image 2',
      saved: signal(true)
    }
  ];

  beforeEach(async () => {
    const photosGalleryServiceSpy = jasmine.createSpyObj('PhotosGalleryComponentService',
      ['init', 'saveImage', 'loadMore'],
      {
        galleryViewImages$: new BehaviorSubject(mockImageData),
        isLoading$: new BehaviorSubject(false),
        hasError$: new BehaviorSubject(false)
      }
    );

    await TestBed.configureTestingModule({
      imports: [PhotosGalleryComponent]
    }).overrideProvider(PhotosGalleryComponentService, { useValue: photosGalleryServiceSpy }).compileComponents();

    fixture = TestBed.createComponent(PhotosGalleryComponent);
    component = fixture.componentInstance;
    mockPhotosGalleryService = TestBed.inject(PhotosGalleryComponentService) as jasmine.SpyObj<PhotosGalleryComponentService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize service on component creation', () => {
    expect(mockPhotosGalleryService.init).toHaveBeenCalled();
  });

  it('should initialize signals with service data', () => {
    expect(component.images()).toEqual(mockImageData);
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it('should call saveImage when onImageClick is called', () => {
    const imageId = '123';

    component.onImageClick(imageId);

    expect(mockPhotosGalleryService.saveImage).toHaveBeenCalledWith(imageId);
  });

  it('should handle loading state changes', () => {
    (mockPhotosGalleryService.isLoading$ as BehaviorSubject<boolean>).next(true);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
  });

  it('should handle error state changes', () => {
    (mockPhotosGalleryService.hasError$ as BehaviorSubject<boolean>).next(true);
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
  });

  it('should handle images updates', () => {
    const newImages: ImageComponentModel[] = [
      {
        id: '3',
        imageSrc: 'https://example.com/image3.jpg',
        imageAlt: 'Test Image 3',
        saved: signal(false)
      }
    ];

    // Update images
    (mockPhotosGalleryService.galleryViewImages$ as BehaviorSubject<ImageComponentModel[]>).next(newImages);
    fixture.detectChanges();

    expect(component.images()).toEqual(newImages);
  });

  describe('onWindowScroll', () => {
    beforeEach(() => {
      // Setup mock DOM properties
      Object.defineProperty(document.documentElement, 'scrollTop', { writable: true, value: 0 });
      Object.defineProperty(document.body, 'scrollTop', { writable: true, value: 0 });
      Object.defineProperty(document.documentElement, 'scrollHeight', { writable: true, value: 1000 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
    });

    it('should not call loadMore when scrolling is throttled', fakeAsync(() => {
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 100 });

      component.onWindowScroll();
      component.onWindowScroll();
      component.onWindowScroll();

      // Ensure no calls are made yet
      expect(mockPhotosGalleryService.loadMore).not.toHaveBeenCalled();

      // Advance time to pass the throttle window
      tick(250);
    }));

    it('should call loadMore when scrolled near bottom and not loading/error', fakeAsync(() => {
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 300 });

      component.onWindowScroll();

      // Advance time to trigger the throttled function
      tick(250);

      expect(mockPhotosGalleryService.loadMore).toHaveBeenCalled();
    }));

    it('should not call loadMore when loading is true', fakeAsync(() => {
      (mockPhotosGalleryService.isLoading$ as BehaviorSubject<boolean>).next(true);
      fixture.detectChanges();

      Object.defineProperty(document.documentElement, 'scrollTop', { value: 300 });

      component.onWindowScroll();
      tick(250);

      expect(mockPhotosGalleryService.loadMore).not.toHaveBeenCalled();
    }));

    it('should not call loadMore when error is true', fakeAsync(() => {
      (mockPhotosGalleryService.hasError$ as BehaviorSubject<boolean>).next(true);
      fixture.detectChanges();

      Object.defineProperty(document.documentElement, 'scrollTop', { value: 300 });

      component.onWindowScroll();
      tick(250);

      expect(mockPhotosGalleryService.loadMore).not.toHaveBeenCalled();
    }));

    it('should not call loadMore when not scrolled near bottom', fakeAsync(() => {
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 0 });

      component.onWindowScroll();
      tick(250);

      expect(mockPhotosGalleryService.loadMore).not.toHaveBeenCalled();
    }));

    it('should use document.body.scrollTop when documentElement.scrollTop is 0', fakeAsync(() => {
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 0 });
      Object.defineProperty(document.body, 'scrollTop', { value: 300 });

      component.onWindowScroll();
      tick(250);

      expect(mockPhotosGalleryService.loadMore).toHaveBeenCalled();
    }));
  });

  it('should handle multiple image saves', () => {
    component.onImageClick('1');
    component.onImageClick('2');
    component.onImageClick('3');

    expect(mockPhotosGalleryService.saveImage).toHaveBeenCalledTimes(3);
    expect(mockPhotosGalleryService.saveImage).toHaveBeenCalledWith('1');
    expect(mockPhotosGalleryService.saveImage).toHaveBeenCalledWith('2');
    expect(mockPhotosGalleryService.saveImage).toHaveBeenCalledWith('3');
  });
});
