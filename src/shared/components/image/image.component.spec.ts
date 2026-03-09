import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageComponent } from './image.component';
import { ImageComponentModel } from './image-component.model';
import { RecycleDirective } from '../../directives/recycle-div.directive';
import { signal } from '@angular/core';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  const mockImageModel: ImageComponentModel = {
    id: '123',
    imageSrc: 'https://example.com/image.jpg',
    imageAlt: 'Test Image',
    saved: signal(false)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageComponent, RecycleDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('hasSavedMode', true);
    fixture.componentRef.setInput('image', mockImageModel);

    expect(component).toBeTruthy();
  });

  it('should receive inputs correctly', () => {
    fixture.componentRef.setInput('hasSavedMode', true);
    fixture.componentRef.setInput('image', mockImageModel);
    fixture.detectChanges();

    expect(component.hasSavedMode()).toBe(true);
    expect(component.image()).toEqual(mockImageModel);
  });

  it('should emit imageClick with correct id', () => {
    fixture.componentRef.setInput('hasSavedMode', true);
    fixture.componentRef.setInput('image', mockImageModel);

    spyOn(component.imageClick, 'emit');

    component.onImageClick();

    expect(component.imageClick.emit).toHaveBeenCalledWith('123');
  });

  it('should emit correct id for different images', () => {
    const differentImage: ImageComponentModel = {
      id: '456',
      imageSrc: 'https://example.com/different.jpg',
      imageAlt: 'Different Image',
      saved: signal(true)
    };

    fixture.componentRef.setInput('hasSavedMode', false);
    fixture.componentRef.setInput('image', differentImage);

    spyOn(component.imageClick, 'emit');

    component.onImageClick();

    expect(component.imageClick.emit).toHaveBeenCalledWith('456');
  });

  it('should work with saved signal set to true', () => {
    const savedImage: ImageComponentModel = {
      id: '123',
      imageSrc: 'https://example.com/image.jpg',
      imageAlt: 'Saved Image',
      saved: signal(true)
    };

    fixture.componentRef.setInput('hasSavedMode', true);
    fixture.componentRef.setInput('image', savedImage);
    fixture.detectChanges();

    expect(component.image().saved()).toBe(true);
  });

  it('should work when hasSavedMode is false', () => {
    fixture.componentRef.setInput('hasSavedMode', false);
    fixture.componentRef.setInput('image', mockImageModel);
    fixture.detectChanges();

    expect(component.hasSavedMode()).toBe(false);
  });

  it('should handle empty alt text', () => {
    const imageWithEmptyAlt: ImageComponentModel = {
      id: '123',
      imageSrc: 'https://example.com/image.jpg',
      imageAlt: '',
      saved: signal(false)
    };

    fixture.componentRef.setInput('hasSavedMode', true);
    fixture.componentRef.setInput('image', imageWithEmptyAlt);
    fixture.detectChanges();

    expect(component.image().imageAlt).toBe('');
  });
});
