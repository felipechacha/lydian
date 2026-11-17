import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SessionTool } from '../../models/practice-session.models';

@Component({
  selector: 'app-session-tool-dock',
  imports: [],
  templateUrl: './session-tool-dock.html',
  styleUrl: './session-tool-dock.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionToolDock {
  @Input() activeTool: SessionTool = 'notes';
  @Output() readonly toolSelected = new EventEmitter<SessionTool>();

  protected readonly tools: readonly { id: SessionTool; icon: string; label: string }[] = [
    { id: 'microphone', icon: 'mic', label: 'Gravar áudio' },
    { id: 'camera', icon: 'videocam', label: 'Gravar vídeo' },
    { id: 'notes', icon: 'edit_note', label: 'Notas da sessão' },
    { id: 'help', icon: 'help', label: 'Ajuda' },
  ];
}
