import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface DashboardNavigationItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-navigation.html',
  styleUrl: './sidebar-navigation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavigation {
  @Input() isOpen = false;
  @Output() readonly navigationSelected = new EventEmitter<void>();

  private readonly _navigationItems: readonly DashboardNavigationItem[] = [
    { label: 'Início', icon: 'home', route: '/home' },
    { label: 'Biblioteca', icon: 'library_music', route: '/musics' },
    { label: 'Histórico', icon: 'history', route: '/practice-history' },
    { label: 'Setlists', icon: 'queue_music', route: '/setlist' },
    { label: 'Descobrir', icon: 'explore', route: '/discover' },
    { label: 'Perfil', icon: 'person', route: '/profile' },
    { label: 'Assinatura', icon: 'workspace_premium', route: '/subscription' },
  ];

  get navigationItems(): readonly DashboardNavigationItem[] {
    return this._navigationItems;
  }

  public selectNavigation(): void {
    this.navigationSelected.emit();
  }
}
