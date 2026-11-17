import { TestBed } from '@angular/core/testing';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { vi } from 'vitest';

import { ToastrNotificationService } from './toastr-notification.service';

describe('ToastrNotificationService', () => {
  const success = vi.fn();
  const error = vi.fn();
  const warning = vi.fn();
  const info = vi.fn();
  const clear = vi.fn();
  let service: ToastrNotificationService;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ToastrNotificationService,
        {
          provide: ToastrService,
          useValue: { success, error, warning, info, clear },
        },
      ],
    });

    service = TestBed.inject(ToastrNotificationService);
  });

  it('should delegate notifications with their default titles', () => {
    service.success('Setlist criado.');
    service.error('Não foi possível salvar.');
    service.warning('Revise os dados.');
    service.info('Sincronização iniciada.');

    expect(success).toHaveBeenCalledWith('Setlist criado.', 'Tudo certo');
    expect(error).toHaveBeenCalledWith('Não foi possível salvar.', 'Algo deu errado');
    expect(warning).toHaveBeenCalledWith('Revise os dados.', 'Atenção');
    expect(info).toHaveBeenCalledWith('Sincronização iniciada.', 'Informação');
  });

  it('should accept custom titles and clear active notifications', () => {
    service.success('Setlist criado.', 'Novo setlist');
    service.clear();

    expect(success).toHaveBeenCalledWith('Setlist criado.', 'Novo setlist');
    expect(clear).toHaveBeenCalledOnce();
  });
});

describe('ToastrNotificationService integration', () => {
  afterEach(() => {
    TestBed.inject(ToastrService).clear();
    document.querySelector('#toast-container')?.remove();
  });

  it('should render the notification in the global toast container', async () => {
    TestBed.configureTestingModule({ providers: [provideToastr({ onActivateTick: true })] });
    const service = TestBed.inject(ToastrNotificationService);
    const toastrService = TestBed.inject(ToastrService);

    service.success('Seu repertório está pronto para receber músicas.', 'Setlist criado');
    await new Promise((resolve) => setTimeout(resolve));

    const toastContainer = document.querySelector('#toast-container');
    const toast = toastContainer?.querySelector('.toast-success.ngx-toastr');

    expect(toastContainer?.classList).toContain('toast-top-right');
    expect(toastrService.toastrConfig.onActivateTick).toBe(true);
    expect(toast?.textContent).toContain('Setlist criado');
    expect(toast?.textContent).toContain('Seu repertório está pronto para receber músicas.');
  });
});
