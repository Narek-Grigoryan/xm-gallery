import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PicsumApiClient } from './picsum-api.client';
import { PicsumImageItem } from './picsum-api.models';
import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, tick } from '@angular/core/testing';

describe('PicsumApiClient', () => {
  let service: PicsumApiClient;
  let httpMock: HttpTestingController;

  const BASE_URL = 'https://picsum.photos';

  const mockImage: PicsumImageItem = {
    id: '123',
    author: 'John Doe',
    url: 'https://example.com/image.jpg',
    download_url: 'https://example.com/download/image.jpg',
    width: 3000,
    height: 2000
  };

  const mockImageList: PicsumImageItem[] = [
    mockImage,
    {
      id: '456',
      author: 'Jane Smith',
      url: 'https://example.com/image2.jpg',
      download_url: 'https://example.com/download/image2.jpg',
      width: 2500,
      height: 1800
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PicsumApiClient]
    });

    service = TestBed.inject(PicsumApiClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('getImages', () => {

    it('should fetch images for a page', () => {
      service.getImages(1).subscribe(images => {
        expect(images).toEqual(mockImageList);
        expect(images.length).toBe(2);
      });

      const req = httpMock.expectOne(`${BASE_URL}/v2/list?page=1`);
      expect(req.request.method).toBe('GET');

      req.flush(mockImageList);
    });

    it('should handle different pages', () => {
      service.getImages(5).subscribe(images => {
        expect(images).toEqual(mockImageList);
      });

      const req = httpMock.expectOne(`${BASE_URL}/v2/list?page=5`);
      req.flush(mockImageList);
    });

    it('should return empty array when API returns empty', () => {
      service.getImages(1).subscribe(images => {
        expect(images).toEqual([]);
      });

      const req = httpMock.expectOne(`${BASE_URL}/v2/list?page=1`);
      req.flush([]);
    });

    it('should propagate HTTP error after retries', fakeAsync(() => {
      let errorResponse: HttpErrorResponse | undefined;

      service.getImages(1).subscribe({
        error: (err) => errorResponse = err
      });

      // Exhaust all 4 attempts (1 initial + 3 retries)
      for (let i = 0; i < 4; i++) {
        httpMock.expectOne(`${BASE_URL}/v2/list?page=1`).flush('Error', { status: 500, statusText: 'Server Error' });
        if (i < 3) tick(2000); // Advance through the delay
      }

      expect(errorResponse?.status).toBe(500);
    }));

    it('should support multiple getImages requests', fakeAsync(() => {
      const results: any[] = [];

      service.getImages(1).subscribe(r => results.push(r));
      service.getImages(2).subscribe(r => results.push(r));

      const req1 = httpMock.expectOne(`${BASE_URL}/v2/list?page=1`);
      const req2 = httpMock.expectOne(`${BASE_URL}/v2/list?page=2`);

      req1.flush(mockImageList);
      req2.flush([mockImage]);

      tick(300);

      expect(results.length).toBe(2);
    }));

    it('should propagate network error after retries', fakeAsync(() => {
      let errorResponse: HttpErrorResponse | undefined;

      service.getImages(1).subscribe({
        error: (err: HttpErrorResponse) => {
          errorResponse = err;
        }
      });

      // Exhaust all attempts (Initial + 3 retries = 4 total requests)
      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne(`${BASE_URL}/v2/list?page=1`);
        req.error(new ProgressEvent('network error'));

        // If there are more retries left, advance the clock to trigger the next attempt
        if (i < 3) {
          tick(2000);
        }
      }

      expect(errorResponse).toBeDefined();
      expect(errorResponse?.status).toBe(0);
      expect(errorResponse?.error instanceof ProgressEvent).toBe(true);
    }));
  });

  describe('getImage', () => {
    it('should fetch image by id', () => {
      service.getImage('123').subscribe(image => {
        expect(image).toEqual(mockImage);
        expect(image.id).toBe('123');
      });

      const req = httpMock.expectOne(`${BASE_URL}/id/123/info`);
      expect(req.request.method).toBe('GET');

      req.flush(mockImage);
    });

    it('should fetch different image ids', () => {
      const differentImage: PicsumImageItem = {
        id: '999',
        author: 'Different Author',
        url: 'https://example.com/different.jpg',
        download_url: 'https://example.com/download/different.jpg',
        width: 1920,
        height: 1080
      };

      service.getImage('999').subscribe(image => {
        expect(image).toEqual(differentImage);
      });

      const req = httpMock.expectOne(`${BASE_URL}/id/999/info`);
      req.flush(differentImage);
    });

    it('should propagate HTTP error', fakeAsync(() => {
      let errorResponse: any;

      service.getImage('123').subscribe({
        error: (err) => errorResponse = err
      });

      // 1. Initial attempt
      const req1 = httpMock.expectOne(`${BASE_URL}/id/123/info`);
      req1.flush('Not Found', { status: 404, statusText: 'Not Found' });
      tick(2000); // Advance past the first delay

      // 2. Retry 1
      const req2 = httpMock.expectOne(`${BASE_URL}/id/123/info`);
      req2.flush('Not Found', { status: 404, statusText: 'Not Found' });
      tick(2000);

      // 3. Retry 2
      const req3 = httpMock.expectOne(`${BASE_URL}/id/123/info`);
      req3.flush('Not Found', { status: 404, statusText: 'Not Found' });
      tick(2000);

      // 4. Retry 3 (Final attempt)
      const req4 = httpMock.expectOne(`${BASE_URL}/id/123/info`);
      req4.flush('Not Found', { status: 404, statusText: 'Not Found' });
      tick(2000);

      expect(errorResponse).toBeDefined();
      expect(errorResponse.status).toBe(404);
    }));

    it('should succeed after retry', fakeAsync(() => {
      let response: any;

      service.getImage('123').subscribe(image => {
        response = image;
      });

      const first = httpMock.expectOne(`${BASE_URL}/id/123/info`);
      first.flush('Server error', { status: 500, statusText: 'Server Error' });
      tick(2000);

      const retry = httpMock.expectOne(`${BASE_URL}/id/123/info`);
      retry.flush(mockImage);

      expect(response).toEqual(mockImage);
    }));

  });

  describe('concurrent requests', () => {

    it('should support multiple getImages requests', fakeAsync(() => {
      const results: PicsumImageItem[][] = [];

      service.getImages(1).subscribe(r => results.push(r));
      service.getImages(2).subscribe(r => results.push(r));

      const req1 = httpMock.expectOne(`${BASE_URL}/v2/list?page=1`);
      const req2 = httpMock.expectOne(`${BASE_URL}/v2/list?page=2`);

      req1.flush(mockImageList);
      req2.flush([mockImage]);

      tick(300);

      expect(results.length).toBe(2);
      expect(results[0]).toEqual(mockImageList);
      expect(results[1]).toEqual([mockImage]);
    }));

    it('should support mixed getImages and getImage requests', fakeAsync(() => {
      let images: PicsumImageItem[] = [];
      let single: PicsumImageItem | undefined;

      service.getImages(1).subscribe(r => images = r);
      service.getImage('123').subscribe(r => single = r);

      const listReq = httpMock.expectOne(`${BASE_URL}/v2/list?page=1`);
      const singleReq = httpMock.expectOne(`${BASE_URL}/id/123/info`);

      listReq.flush(mockImageList);
      singleReq.flush(mockImage);
      tick(300);

      expect(images).toEqual(mockImageList);
      expect(single).toEqual(mockImage);
    }));
  });
});
