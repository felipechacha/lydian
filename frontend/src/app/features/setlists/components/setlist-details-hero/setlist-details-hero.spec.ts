import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetlistDetailsHero } from './setlist-details-hero';
import { SetlistDetailsData } from '../../models/setlist-details.models';

describe('SetlistDetailsHero', () => {
  let component: SetlistDetailsHero;
  let fixture: ComponentFixture<SetlistDetailsHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetlistDetailsHero],
    }).compileComponents();

    fixture = TestBed.createComponent(SetlistDetailsHero);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('setlist', {
      title: 'Set de teste',
      context: 'Show',
      description: 'Descrição do repertório de teste.',
      eventDate: '24 ago · 18:30',
      venue: 'Terraço Aurora',
      visibility: 'private',
    } satisfies SetlistDetailsData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
