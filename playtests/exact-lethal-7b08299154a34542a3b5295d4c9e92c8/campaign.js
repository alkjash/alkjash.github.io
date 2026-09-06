export const CAMPAIGN_LENGTH = 30;
export const ACT_LENGTH = 10;

// EL-012: production act transitions restore current maximum HP on every path.
// Keep legacy policy labels readable for existing saves.
export const RECOVERY_POLICIES = Object.freeze({
  UNRESOLVED: 'unresolved',
  CONFIGURABLE: 'configurable',
  FULL: 'full'
});

export const CAMPAIGN_STATE_VERSION = 1;

function frozenRecord(value) {
  return Object.freeze(value);
}

export const ACTS = Object.freeze([
  frozenRecord({
    act: 1,
    number: 1,
    id: 'act-1',
    name: 'The Ashen Road',
    title: 'The Ashen Road',
    startDay: 1,
    endDay: 10,
    finalBossDay: 10,
    biome: 'ash-road',
    encounterProfileId: 'act1-road',
    composition: frozenRecord({majority: 'ashen-road-denizens', minority: 'road-specialists'})
  }),
  frozenRecord({
    act: 2,
    number: 2,
    id: 'act-2',
    name: 'The Crystal Below',
    title: 'The Crystal Below',
    startDay: 11,
    endDay: 20,
    finalBossDay: 20,
    biome: 'crystal-cave',
    encounterProfileId: 'act2-crystal-cave',
    composition: frozenRecord({majority: 'crystalline-polyhedra', minority: 'underground-magical-creatures'})
  }),
  frozenRecord({
    act: 3,
    number: 3,
    id: 'act-3',
    name: 'The Pits of Hell',
    title: 'The Pits of Hell',
    startDay: 21,
    endDay: 30,
    finalBossDay: 30,
    biome: 'hell-pits',
    encounterProfileId: 'act3-hell-pits',
    composition: frozenRecord({groups: Object.freeze(['demons', 'thralls']), variety: 'broad'})
  })
]);

const ACT_I_DAYS = [
  {type:'combat', name:'The Ashen Gate', desc:'One goblin bars the gate.'},
  {type:'combat', name:'The Toll Road', desc:'Goblins steal. Orcs grow stronger.'},
  {type:'event', name:'The Last Wayside', desc:'A little warmth before the climb.'},
  {type:'combat', name:'The Iron Vigil', desc:'The road grows less forgiving.'},
  {type:'combat', name:'The Bone Orchard', desc:'New enemies test your equipment.'},
  {type:'combat', name:'The Red Procession', desc:'Read each threat before committing.'},
  {type:'event', name:'The Lantern Merchant', desc:'Review your equipment. Prepare for the final days.'},
  {type:'combat', name:'The Sunken Choir', desc:'A stronger procession awaits.'},
  {type:'combat', name:'The Warden’s Stair', desc:'A final test before the bell.'},
  {type:'boss', name:'The Bell of Ash', desc:'Defeat the Bellwarden to finish Act I.'}
];

const ACT_II_DAYS = [
  {type:'combat', name:'Facetfall Descent', desc:'The road falls into living crystal.'},
  {type:'combat', name:'Prism Choir', desc:'Faceted voices answer in the dark.'},
  {type:'event', name:'Blind Cartographer', desc:'A map is offered without a horizon.'},
  {type:'combat', name:'Geode Nursery', desc:'Young geometries stir beneath the shell.'},
  {type:'combat', name:'Glass Fault', desc:'Every step wakes another edge.'},
  {type:'combat', name:'Violet Depths', desc:'Cave-born magic hunts among the facets.'},
  {type:'event', name:'Facet Bazaar', desc:'Underground traders weigh gold against light.'},
  {type:'combat', name:'Starless Lattice', desc:'The crystal dark closes into a cage.'},
  {type:'combat', name:'Crown Vault', desc:'The deepest facets guard their sovereign.'},
  {type:'boss', name:'Twelve-Faced Throne', desc:'Break the ruler at the cave’s heart.'}
];

const ACT_III_DAYS = [
  {type:'combat', name:'Cinder Mouth', desc:'The descent opens beneath a burning sky.'},
  {type:'combat', name:'Chain Fields', desc:'Thralls march between infernal hosts.'},
  {type:'event', name:'Last Pilgrim', desc:'A final traveler waits beside the road.'},
  {type:'combat', name:'Furnace March', desc:'Demon ranks gather in the heat.'},
  {type:'combat', name:'Flayed Basilica', desc:'The faithful keep a cruel liturgy.'},
  {type:'combat', name:'Soot Labyrinth', desc:'Smoke hides hunter and captive alike.'},
  {type:'event', name:'Infernal Broker', desc:'A bargain gleams behind iron teeth.'},
  {type:'combat', name:'Lake of Teeth', desc:'The pits offer no safe footing.'},
  {type:'combat', name:'Throneward', desc:'Every surviving horror guards the last gate.'},
  {type:'boss', name:'Heart Below', desc:'End the reign beneath all roads.'}
];

const DAY_SEEDS = [ACT_I_DAYS, ACT_II_DAYS, ACT_III_DAYS];

function profileId(act, type) {
  if (act === 1) return type === 'event' ? 'act1-event' : type === 'boss' ? 'act1-boss' : 'act1-road';
  if (act === 2) return type === 'event' ? 'act2-event' : type === 'boss' ? 'act2-boss' : 'act2-crystal-cave';
  return type === 'event' ? 'act3-event' : type === 'boss' ? 'act3-boss' : 'act3-hell-pits';
}

export const DAYS = Object.freeze(DAY_SEEDS.flatMap((actDays, actIndex) => {
  const act = actIndex + 1;
  const biome = ACTS[actIndex].biome;
  return actDays.map((entry, index) => frozenRecord({
    day: actIndex * ACT_LENGTH + index + 1,
    act,
    actDay: index + 1,
    type: entry.type,
    name: entry.name,
    desc: entry.desc,
    biome,
    encounterProfileId: profileId(act, entry.type)
  }));
}));

function integerDay(day) {
  return Number.isInteger(day) && day >= 1 && day <= CAMPAIGN_LENGTH;
}

export function actForDay(day) {
  if (!integerDay(day)) return null;
  return ACTS[Math.floor((day - 1) / ACT_LENGTH)];
}

export function dayDefinition(day) {
  return integerDay(day) ? DAYS[day - 1] : null;
}

export function isActMilestone(day) {
  return integerDay(day) && day % ACT_LENGTH === 0 && day < CAMPAIGN_LENGTH;
}

export function isFinalDay(day) {
  return day === CAMPAIGN_LENGTH;
}

export function nextCampaignStep(day) {
  const current = dayDefinition(day);
  if (!current) return null;
  if (isFinalDay(day)) {
    return frozenRecord({type:'victory', day, act:current.act, nextDay:null, nextAct:null});
  }

  const next = dayDefinition(day + 1);
  if (isActMilestone(day)) {
    return frozenRecord({
      type: 'act-transition',
      day,
      act: current.act,
      nextDay: next.day,
      nextAct: next.act,
      recoveryPolicy: RECOVERY_POLICIES.FULL
    });
  }

  return frozenRecord({type:'next-day', day, act:current.act, nextDay:next.day, nextAct:next.act});
}

export function campaignStateForDay(day, options = {}) {
  const definition = dayDefinition(day);
  if (!definition) throw new RangeError(`Campaign day must be an integer from 1 to ${CAMPAIGN_LENGTH}.`);
  const recoveryPolicy = options.recoveryPolicy ?? RECOVERY_POLICIES.FULL;
  if (!Object.values(RECOVERY_POLICIES).includes(recoveryPolicy)) {
    throw new TypeError('Unknown recovery policy.');
  }
  const completedMilestones = options.completedMilestones ?? [];
  if (!Array.isArray(completedMilestones) || completedMilestones.some(act => ![1, 2].includes(act)) || new Set(completedMilestones).size !== completedMilestones.length) {
    throw new TypeError('Completed milestones must be a unique array containing only acts 1 and 2.');
  }
  const finalComplete = options.finalComplete ?? false;
  if (typeof finalComplete !== 'boolean') throw new TypeError('Final completion must be boolean.');
  const transition = options.transition ?? null;
  return frozenRecord({
    version: CAMPAIGN_STATE_VERSION,
    day: definition.day,
    act: definition.act,
    actDay: definition.actDay,
    completedMilestones: Object.freeze([...completedMilestones].sort((a,b) => a-b)),
    finalComplete,
    transition: transition ? frozenRecord({...transition}) : null,
    recoveryPolicy
  });
}

function validationResult(errors, extra = {}) {
  return frozenRecord({valid: errors.length === 0, errors: Object.freeze(errors), ...extra});
}

export function validateCampaignState(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return validationResult(['campaign state must be an object']);
  }

  const definition = dayDefinition(value.day);
  if (!definition) errors.push(`day must be an integer from 1 to ${CAMPAIGN_LENGTH}`);
  if (value.version !== CAMPAIGN_STATE_VERSION) errors.push(`version must be ${CAMPAIGN_STATE_VERSION}`);
  if (definition && value.act !== definition.act) errors.push('act does not match day');
  if (definition && value.actDay !== definition.actDay) errors.push('actDay does not match day');
  if (!Object.values(RECOVERY_POLICIES).includes(value.recoveryPolicy)) {
    errors.push('recoveryPolicy must be full or a recognized legacy policy');
  }
  if (!Array.isArray(value.completedMilestones) || value.completedMilestones.some(act => ![1, 2].includes(act)) || new Set(value.completedMilestones).size !== value.completedMilestones.length) {
    errors.push('completedMilestones must contain unique act numbers 1 and 2 only');
  }
  if (typeof value.finalComplete !== 'boolean') errors.push('finalComplete must be boolean');
  if (value.finalComplete && value.day !== CAMPAIGN_LENGTH) errors.push('finalComplete requires day 30');
  if (value.transition !== null) {
    const transition = value.transition;
    if (!transition || typeof transition !== 'object' || ![1,2].includes(transition.fromAct) || transition.toAct !== transition.fromAct + 1 || transition.nextDay !== transition.toAct * ACT_LENGTH - ACT_LENGTH + 1) {
      errors.push('transition must identify the next act and its first day');
    } else {
      if (value.day !== transition.fromAct * ACT_LENGTH || value.act !== transition.fromAct) errors.push('transition does not match campaign day');
      if (!Object.values(RECOVERY_POLICIES).includes(transition.recoveryPolicy)) errors.push('transition recoveryPolicy must be full or a recognized legacy policy');
      if (typeof transition.recoveryApplied !== 'boolean') errors.push('transition recoveryApplied must be boolean');
      if (transition.recoveryApplied && ![RECOVERY_POLICIES.CONFIGURABLE,RECOVERY_POLICIES.FULL].includes(transition.recoveryPolicy)) errors.push('applied transition recovery requires a concrete policy');
      if (transition.recoveryAmount !== undefined && (!Number.isInteger(transition.recoveryAmount) || transition.recoveryAmount < 0)) errors.push('transition recoveryAmount must be a nonnegative integer');
    }
  }
  return validationResult(errors);
}

export function validateCampaignSave(save) {
  const errors = [];
  if (!save || typeof save !== 'object' || Array.isArray(save)) {
    return validationResult(['save must be an object'], {needsCampaignMigration:false});
  }

  const definition = dayDefinition(save.day);
  if (!definition) errors.push(`save day must be an integer from 1 to ${CAMPAIGN_LENGTH}`);
  if (save.campaign === undefined) {
    return validationResult(errors, {needsCampaignMigration:errors.length === 0});
  }

  const campaignValidation = validateCampaignState(save.campaign);
  errors.push(...campaignValidation.errors.map(error => `campaign: ${error}`));
  if (definition && campaignValidation.valid && save.campaign.day !== save.day) {
    errors.push('campaign day does not match save day');
  }
  return validationResult(errors, {needsCampaignMigration:false});
}
