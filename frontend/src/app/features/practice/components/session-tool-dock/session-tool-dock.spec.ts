import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionToolDock } from './session-tool-dock';

describe('SessionToolDock', () => {
  let component: SessionToolDock;
  let fixture: ComponentFixture<SessionToolDock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionToolDock],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionToolDock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
