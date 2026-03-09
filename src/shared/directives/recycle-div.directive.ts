import {Directive, ElementRef, Input, OnInit, OnDestroy, input, output, HostListener} from '@angular/core';

@Directive({
  selector: '[appRecycle]',
  standalone: true
})
export class RecycleDirective implements OnInit, OnDestroy {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly id = input.required<string>();

  readonly imageClick = output<string>();

  private observer: IntersectionObserver | undefined;

  @HostListener('click')
  onClick() {
    this.imageClick.emit(this.id());
  }

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.el.nativeElement.innerHTML = `<img decoding="async" src="${this.src()}" alt="${this.alt()}" style="width:100%; height:100%; object-fit: cover;">`;
          this.el.nativeElement.style.height = '100%';
        } else {
          const height = this.el.nativeElement.offsetHeight;
          this.el.nativeElement.style.height = `${height}px`;
          this.el.nativeElement.innerHTML = '';
        }
      });
    }, { rootMargin: '500px' });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}
