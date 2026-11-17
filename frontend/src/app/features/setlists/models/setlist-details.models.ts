import { LibraryMusic } from '../../library/models/musics.models';
import { SetlistVisibility } from './setlist.models';

export interface SetlistDetailsData {
  readonly title: string;
  readonly context: string;
  readonly description: string;
  readonly eventDate: string;
  readonly venue: string;
  readonly visibility: SetlistVisibility;
}

export interface SetlistTrackItem {
  readonly song: LibraryMusic<string>;
  readonly position: number;
  readonly notes: string;
}

export interface SetlistEditValue {
  readonly name: string;
  readonly description: string;
  readonly visibility: SetlistVisibility;
}
