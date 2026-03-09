import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecycleDirective } from './recycle-div.directive';
import { Component } from '@angular/core';

@Component({
  template: `
    <div
      appRecycle
      [src]="src"
      [alt]="alt"
      [id]="id"
      (imageClick)="onImageClick($event)"
      style="width:200px;height:200px">
    </div>
  `,
  standalone: true,
  imports: [RecycleDirective]
})
class TestHostComponent {
  src = 'https://example.com/image.jpg';
  alt = 'Test Image';
  id = '123';
  clickedImageId: string | null = null;

  onImageClick(id: string) {
    this.clickedImageId = id;
  }
}

describe('RecycleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let directive: RecycleDirective;
  let element: HTMLElement;

  let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
  let observeSpy: jasmine.Spy;
  let disconnectSpy: jasmine.Spy;

  function triggerIntersection(isIntersecting: boolean, target = element) {
    intersectionCallback([{ isIntersecting, target } as unknown as IntersectionObserverEntry]);
  }

  beforeEach(async () => {
    observeSpy = jasmine.createSpy('observe');
    disconnectSpy = jasmine.createSpy('disconnect');

    // Define a mock class instead of using spyOn
    (window as any).IntersectionObserver = class {
      constructor(cb: any) {
        intersectionCallback = cb;
      }
      observe = observeSpy;
      disconnect = disconnectSpy;
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    element = fixture.nativeElement.querySelector('[appRecycle]');

    const debugEl = fixture.debugElement.query(
      el => el.nativeElement === element
    );

    directive = debugEl.injector.get(RecycleDirective);
  });


  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize IntersectionObserver', () => {
    expect(observeSpy).toHaveBeenCalledWith(element);
  });

  it('should emit imageClick on click', () => {
    spyOn(component, 'onImageClick');

    element.click();

    expect(component.onImageClick).toHaveBeenCalledWith('123');
  });

  it('should load image when intersecting', () => {
    triggerIntersection(true);

    expect(element.innerHTML).toContain('<img');
    expect(element.innerHTML).toContain('src="https://example.com/image.jpg"');
  });

  it('should unload image when leaving viewport', () => {
    triggerIntersection(true);

    Object.defineProperty(element, 'offsetHeight', {
      value: 200,
      configurable: true
    });

    triggerIntersection(false);

    expect(element.innerHTML).toBe('');
    expect(element.style.height).toBe('200px');
  });

  it('should update inputs when host changes', () => {
    component.src = 'https://different.com/image.png';
    component.alt = 'Different';
    component.id = '456';

    fixture.detectChanges();

    expect(directive.src()).toBe('https://different.com/image.png');
    expect(directive.alt()).toBe('Different');
    expect(directive.id()).toBe('456');
  });

  it('should disconnect observer on destroy', () => {
    directive.ngOnDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
