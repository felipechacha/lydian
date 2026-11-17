import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSkeletonLoading } from './content-skeleton-loading';

describe('ContentSkeletonLoading', () => {
  let component: ContentSkeletonLoading;
  let fixture: ComponentFixture<ContentSkeletonLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentSkeletonLoading],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentSkeletonLoading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the standard content placeholders', () => {
    const loadingStatus = fixture.nativeElement.querySelector('[role="status"]');
    const skeletonCards = fixture.nativeElement.querySelectorAll(
      '.content-skeleton-card-custom',
    );

    expect(loadingStatus.getAttribute('aria-label')).toBe('Carregando conteúdo');
    expect(skeletonCards.length).toBe(3);
  });
});
