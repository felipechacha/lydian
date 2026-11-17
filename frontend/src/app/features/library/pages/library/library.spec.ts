import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Library } from './library';

describe('Library', () => {
  let component: Library;
  let fixture: ComponentFixture<Library>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Library],
    }).compileComponents();

    fixture = TestBed.createComponent(Library);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the Bootstrap page grid', () => {
    expect(
      fixture.nativeElement.querySelector(
        '#library-overview-section > .container > .row > .col-12.col-md-10',
      ),
    ).toBeTruthy();
  });
});
