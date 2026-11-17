import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextPracticeCard } from './next-practice-card';

describe('NextPracticeCard', () => {
  let component: NextPracticeCard;
  let fixture: ComponentFixture<NextPracticeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextPracticeCard],
    }).compileComponents();

    fixture = TestBed.createComponent(NextPracticeCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('practice', {
      title: 'Nocturne No. 2',
      composer: 'Frédéric Chopin',
      technicalFocus: ['Fraseado Rubato'],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
