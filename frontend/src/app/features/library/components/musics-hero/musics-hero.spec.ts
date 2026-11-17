import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicsHero } from './musics-hero';

describe('MusicsHero', () => {
  let component: MusicsHero;
  let fixture: ComponentFixture<MusicsHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicsHero],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicsHero);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('musicCount', 42);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
