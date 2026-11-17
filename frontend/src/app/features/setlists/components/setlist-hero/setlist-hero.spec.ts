import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetlistHero } from './setlist-hero';

describe('SetlistHero', () => {
  let component: SetlistHero;
  let fixture: ComponentFixture<SetlistHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetlistHero],
    }).compileComponents();

    fixture = TestBed.createComponent(SetlistHero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
