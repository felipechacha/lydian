import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicsToolbar } from './musics-toolbar';

describe('MusicsToolbar', () => {
  let component: MusicsToolbar;
  let fixture: ComponentFixture<MusicsToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicsToolbar],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicsToolbar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeFilter', 'all');
    fixture.componentRef.setInput('viewMode', 'grid');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
