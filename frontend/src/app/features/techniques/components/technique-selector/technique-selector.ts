import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Technique } from '../../models/technique.models';

@Component({
  selector: 'app-technique-selector',
  imports: [ReactiveFormsModule],
  templateUrl: './technique-selector.html',
  styleUrl: './technique-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechniqueSelector {
  readonly techniques = input.required<readonly Technique[]>();
  readonly selectedTechniqueIds = input.required<readonly string[]>();
  readonly isLoading = input(false);
  readonly errorMessage = input('');
  readonly invalid = input(false);
  readonly selectedTechniqueIdsChange = output<readonly string[]>();
  readonly retryRequested = output<void>();

  readonly techniqueControl = new FormControl('', { nonNullable: true });

  get selectedTechniques(): readonly Technique[] {
    const selectedTechniqueIds = new Set(this.selectedTechniqueIds());
    return this.techniques().filter((technique) => selectedTechniqueIds.has(technique.id));
  }

  get availableTechniques(): readonly Technique[] {
    const selectedTechniqueIds = new Set(this.selectedTechniqueIds());
    return this.techniques().filter((technique) => !selectedTechniqueIds.has(technique.id));
  }

  public addTechnique(): void {
    const techniqueId = this.techniqueControl.value;

    if (!techniqueId || this.selectedTechniqueIds().includes(techniqueId)) {
      return;
    }

    this.selectedTechniqueIdsChange.emit([...this.selectedTechniqueIds(), techniqueId]);
    this.techniqueControl.reset();
  }

  public removeTechnique(techniqueId: string): void {
    this.selectedTechniqueIdsChange.emit(
      this.selectedTechniqueIds().filter(
        (selectedTechniqueId) => selectedTechniqueId !== techniqueId,
      ),
    );
  }
}
