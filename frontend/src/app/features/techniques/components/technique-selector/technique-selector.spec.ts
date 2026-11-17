import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechniqueSelector } from './technique-selector';

describe('TechniqueSelector', () => {
  let component: TechniqueSelector;
  let fixture: ComponentFixture<TechniqueSelector>;
  const legatoTechnique = {
    id: '43b336c2-851d-4e0e-9ff2-50bc546024be',
    key: 'legato',
    name: 'Legato',
    category: 'articulation',
  };
  const palmMuteTechnique = {
    id: 'ff373eed-d5ff-49f0-a0e3-243783494f87',
    key: 'palm-mute',
    name: 'Palm Mute',
    category: 'articulation',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechniqueSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(TechniqueSelector);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('techniques', [legatoTechnique, palmMuteTechnique]);
    fixture.componentRef.setInput('selectedTechniqueIds', [legatoTechnique.id]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit catalog ids when adding and removing techniques', () => {
    const selections: (readonly string[])[] = [];
    component.selectedTechniqueIdsChange.subscribe((techniqueIds) => selections.push(techniqueIds));

    component.techniqueControl.setValue(palmMuteTechnique.id);
    component.addTechnique();
    component.removeTechnique(legatoTechnique.id);

    expect(selections).toEqual([[legatoTechnique.id, palmMuteTechnique.id], []]);
  });
});
