import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CatalogueService } from './catalogue.service';
import { environment } from '../../../environments/environment';
import { SpaceType } from '../models/catalogue.models';

describe('CatalogueService', () => {
  let service: CatalogueService;
  let httpMock: HttpTestingController;

  const mockCenter = {
    centerId: 1,
    name: 'Test Center',
    address: '123 Test St',
    city: 'Test City',
    description: 'Test Description',
    openingHours: '9:00-18:00',
    photos: ['photo1.jpg'],
    averageRating: 4.5
  };

  const mockSpace = {
    id: 1,
    name: 'Test Space',
    type: SpaceType.PRIVATE_OFFICE,
    description: 'Test space description',
    capacity: 10,
    pricePerHour: 50,
    pricePerDay: 400,
    centerId: 1,
    averageRating: 4.5,
    photos: ['space1.jpg'],
    amenities: ['WiFi', 'Projector']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CatalogueService]
    });

    service = TestBed.inject(CatalogueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCenters', () => {
    it('should retrieve all centers', (done) => {
      const mockCenters = [mockCenter];

      service.getCenters().subscribe(centers => {
        expect(centers).toEqual(mockCenters);
        expect(centers.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/centers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCenters);
    });
  });

  describe('getCenter', () => {
    it('should retrieve a specific center', (done) => {
      service.getCenterById(1).subscribe(center => {
        expect(center).toEqual(mockCenter);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/centers/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCenter);
    });
  });

  describe('getSpacesByCenter', () => {
    it('should retrieve spaces for a center', (done) => {
      const mockSpaces = [mockSpace];

      service.getSpacesByCenter(1).subscribe(spaces => {
        expect(spaces).toEqual(mockSpaces);
        expect(spaces.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/spaces/center/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSpaces);
    });
  });

  describe('getSpace', () => {
    it('should retrieve a specific space', (done) => {
      service.getSpaceById(1).subscribe(space => {
        expect(space).toEqual(mockSpace);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/spaces/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSpace);
    });
  });
});
