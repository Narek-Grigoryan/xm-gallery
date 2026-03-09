import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { SingleImageComponent } from './signle-image.component';
import { SingleImageComponentService } from './signle-image-component.service';
import { MyImagesStore } from '@stores/my-images.store';
import { SingleImageModel } from './signle-image-component.model';
import { PicsumImageItem } from '@services/picsum-api/picsum-api.models';

describe('SingleImageComponent', () => {
  let component: SingleImageComponent;
  let fixture: ComponentFixture<SingleImageComponent>;
  let mockSingleImageService: jasmine.SpyObj<SingleImageComponentService>;
  let mockMyImagesStore: jasmine.SpyObj<MyImagesStore>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockPicsumImage: PicsumImageItem = {
    id: '123',
    author: 'Test Author',
    width: 800,
    height: 600,
    url: 'https://picsum.photos/id/123/800/600',
    download_url: 'https://picsum.photos/id/123/800/600.jpg'
  };

  const mockSingleImageModel: SingleImageModel = {
    id: '123',
    url: 'https://picsum.photos/id/123/800/600.jpg',
    alt: 'Test Author',
    title: 'Test Author'
  };

  beforeEach(async () => {
    const singleImageServiceSpy = jasmine.createSpyObj('SingleImageComponentService',
      ['mapPicsumImageToSingleImageModel', 'removeImageFromStore']
    );

    const myImagesStoreSpy = jasmine.createSpyObj('MyImagesStore', ['getItem', 'removeItem']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [SingleImageComponent],
      providers: [
        { provide: MyImagesStore, useValue: myImagesStoreSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).overrideProvider(SingleImageComponentService, { useValue: singleImageServiceSpy }).compileComponents();

    fixture = TestBed.createComponent(SingleImageComponent);
    component = fixture.componentInstance;
    mockSingleImageService = TestBed.inject(SingleImageComponentService) as jasmine.SpyObj<SingleImageComponentService>;
    mockMyImagesStore = TestBed.inject(MyImagesStore) as jasmine.SpyObj<MyImagesStore>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onRemoveImage', () => {
    it('should remove image and navigate to favourites when image has id', () => {
      component.image.set(mockSingleImageModel);

      component.onRemoveImage();


      expect(mockSingleImageService.removeImageFromStore).toHaveBeenCalledWith('123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['favourites']);
    });

    it('should not remove image when image is null', () => {
      component.image.set(null);

      component.onRemoveImage();

      expect(mockSingleImageService.removeImageFromStore).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not remove image when image has no id', () => {
      const imageWithoutId: SingleImageModel = {
        id: '',
        url: 'test.jpg',
        alt: 'test',
        title: 'test'
      };
      component.image.set(imageWithoutId);

      component.onRemoveImage();

      expect(mockSingleImageService.removeImageFromStore).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle image with undefined id', () => {
      const imageWithUndefinedId = {
        ...mockSingleImageModel,
        id: undefined as any
      };
      component.image.set(imageWithUndefinedId);

      component.onRemoveImage();

      expect(mockSingleImageService.removeImageFromStore).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  it('should initialize image signal as null', () => {
    expect(component.image()).toBeNull();
  });

  it('should update image signal correctly', () => {
    component.image.set(mockSingleImageModel);
    expect(component.image()).toEqual(mockSingleImageModel);
  });
});
