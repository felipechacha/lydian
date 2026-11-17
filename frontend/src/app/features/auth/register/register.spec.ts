import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate different passwords', () => {
    component.registerForm.setValue({
      fullName: 'Lydian Test',
      email: 'test@lydian.com',
      password: 'LydianTest123!',
      confirmPassword: 'different-password',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
  });
});
