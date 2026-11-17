import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetlistCard } from './setlist-card';
import { SetlistSummary } from '../../models/setlist.models';

describe('SetlistCard', () => {
  let component: SetlistCard;
  let fixture: ComponentFixture<SetlistCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetlistCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SetlistCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('setlist', {
      id: 1,
      title: 'Set de teste',
      context: 'Show',
      description: 'Repertório criado para validar o card.',
      songCount: 4,
      duration: '28 min',
      updatedAt: 'Agora',
      artworkUrls: ['https://example.com/artwork.png'],
      eventDate: '24 ago · 18:30',
      venue: 'Terraço Aurora',
    } satisfies SetlistSummary);
    fixture.componentRef.setInput('viewMode', 'grid');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should link to the details of its own setlist', () => {
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/setlist-details/1');
  });

  it('should use the singular label for one music', () => {
    fixture.componentRef.setInput('setlist', {
      ...component.setlist(),
      songCount: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1 música');
    expect(fixture.nativeElement.textContent).not.toContain('1 músicas');
  });
});
