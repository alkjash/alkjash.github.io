// Exact Lethal EL-009 — standalone Act II/III content data.
//
// This module deliberately does not import the engine, campaign topology, loot
// catalog, or UI. Act I remains owned by the existing modules. All combat
// numbers below are baseline, provisional values for the later balance pass.

export const CONTENT_VERSION = 1;
export const CONTENT_BALANCE_STATUS = 'PROVISIONAL_UNTIL_PLAYTESTED';

function deepFreeze(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.freeze(value);
  for(const child of Object.values(value))deepFreeze(child);
 }
 return value;
}

const lootProfile=(families,{items=[],excludedFamilies=[],excludedTags=[],defenseSlots=[]}={})=>({
 families:[...families],items:[...items],excludedFamilies:[...excludedFamilies],
 excludedTags:[...excludedTags],defenseSlots:[...defenseSlots]
});

// `art` values are logical asset keys. They do not claim that raster assets
// already exist. Silhouettes are the handoff contract for later art production.
export const ACT_ENEMIES=deepFreeze({
 facet_swarm:{
  name:'Facet Swarm',art:'facet-swarm',armor:0,attack:0,mechanic:'hexsinger',
  chargeDamage:18,interruptExact:4,
  traitText:'REFRACTION · Deal its displayed exact total this turn to break its armor-piercing ray.',
  act:2,faction:'the-living-lattice',entityKind:'crystal-polyhedron',
  tags:['charge','exact-counter','swarm','headless','geometric'],
  silhouette:'A school of small tetrahedra orbiting an empty center, compressing into one forward wedge.',
  lootProfile:lootProfile(['crystal-needle','prism-focus','shard-spear'],{items:['prism_needle','prism_focus','shard_spear'],excludedFamilies:['infernal','plate'],excludedTags:['organic','heavy'],defenseSlots:[]})
 },
 lattice_sentinel:{
  name:'Lattice Sentinel',art:'lattice-sentinel',armor:2,attack:9,mechanic:'shieldbearer',
  traitText:'FACET WARD · While armored, it intercepts attacks aimed at its companion.',
  act:2,faction:'the-living-lattice',entityKind:'crystal-polyhedron',
  tags:['protector','armored','stacked','headless','geometric'],
  silhouette:'A broad stack of cubes and octahedra with a hovering point above a wide, immovable base.',
  lootProfile:lootProfile(['mirror-shield','lattice-mail','geode-maul'],{items:['mirror_shield','lattice_mail','geode_maul'],excludedFamilies:['infernal','cloth'],defenseSlots:['body','offhand']})
 },
 hinge_idol:{
  name:'Hinge Idol',art:'hinge-idol',armor:1,attack:9,mechanic:'trapwright',trapDamage:10,
  traitText:'CLOSING ANGLE · Marks one weapon; using it springs the idol shut before the strike.',
  act:2,faction:'the-living-lattice',entityKind:'crystal-polyhedron',
  tags:['slot-control','hinged','headless','geometric'],
  silhouette:'Three thick crystal slabs joined by luminous seams, opening like a squat book-shaped trap.',
  lootProfile:lootProfile(['shard-hook','facet-blade','prism-focus'],{items:['shard_hook','facet_blade','prism_focus'],excludedFamilies:['infernal','cloth'],excludedTags:['organic'],defenseSlots:[]})
 },
 crown_cluster:{
  name:'Crown Cluster',art:'crown-cluster',armor:1,attack:9,mechanic:'rally',
  traitText:'HARMONIC CROWN · Every living foe gains 1 attack at the end of the turn.',
  act:2,faction:'the-living-lattice',entityKind:'crystal-polyhedron',
  tags:['support','ring','headless','geometric'],
  silhouette:'A squat central prism inside a broad broken ring of floating shards, tilted toward its target.',
  lootProfile:lootProfile(['prism-focus','crystal-needle','mirror-shield'],{items:['prism_focus','prism_needle','mirror_shield'],excludedFamilies:['infernal','plate'],excludedTags:['organic','heavy'],defenseSlots:['offhand']})
 },
 burrowing_lens:{
  name:'Burrowing Lens',art:'burrowing-lens',armor:1,attack:0,mechanic:'painkeeper',reflectionMultiplier:2,
  traitText:'SPLINTERED ECHO · Its next attack multiplies the largest hit it survives this turn.',
  act:2,faction:'the-living-lattice',entityKind:'crystal-polyhedron',
  tags:['retaliation','disk','burrower','headless','geometric'],
  silhouette:'A many-sided lens half submerged in stone, with one bright axis and a razor-thin disk profile.',
  lootProfile:lootProfile(['prism-focus','shard-hook','crystal-needle'],{items:['prism_focus','shard_hook','prism_needle'],excludedFamilies:['infernal','plate'],excludedTags:['organic','heavy'],defenseSlots:[]})
 },
 geode_mender:{
  name:'Geode Mender',art:'geode-mender',armor:1,attack:9,mechanic:'bonecook',healInterrupt:5,
  traitText:'REKNIT · Fully restores a wounded companion unless its displayed damage threshold is met.',
  act:2,faction:'the-living-lattice',entityKind:'crystal-polyhedron',
  tags:['support','heal','orbiting','headless','geometric'],
  silhouette:'A cracked rhombic core held together by small orbiting facets that fly outward to mend allies.',
  lootProfile:lootProfile(['prism-focus','lattice-mail','crystal-needle'],{items:['prism_focus','lattice_mail','prism_needle'],excludedFamilies:['infernal','shield'],excludedTags:['organic','heavy'],defenseSlots:['body']})
 },
 prism_grazer:{
  name:'Prism Grazer',art:'prism-grazer',armor:1,attack:10,mechanic:'redjaw',berserkAttack:14,
  traitText:'PANIC FLASH · Below half health, its displayed attack rises.',
  act:2,faction:'deep-cave-fauna',entityKind:'cave-creature',
  tags:['threshold','beast','low-crawler','six-legged'],
  silhouette:'A low six-legged cave beast with a translucent mineral back and a narrow lamprey muzzle.',
  lootProfile:lootProfile(['crystal-hide','shard-spear','facet-blade'],{items:['crystal_hide','shard_spear','facet_blade'],excludedFamilies:['infernal','plate'],excludedTags:['ceremonial'],defenseSlots:['body']})
 },
 gloom_moth:{
  name:'Gloom Moth',art:'gloom-moth',armor:0,attack:9,mechanic:'windup',
  traitText:'DARK DIVE · Alternates a visible wing-folding windup with increasingly forceful dives.',
  act:2,faction:'deep-cave-fauna',entityKind:'cave-creature',
  tags:['windup','flying','creature','wide-silhouette'],
  silhouette:'A broad black cave moth with one oversized luminous abdomen and sharply folded violet wings.',
  lootProfile:lootProfile(['moth-silk','crystal-needle','prism-focus'],{items:['moth_silk','prism_needle','prism_focus'],excludedFamilies:['infernal','plate','shield'],excludedTags:['heavy'],defenseSlots:['body']})
 },
 twelve_faced_archon:{
  name:'The Twelve-Faced Archon',art:'twelve-faced-archon',armor:2,attack:0,mechanic:'headsman',
  chargeDamage:18,interruptHits:3,
  traitText:'TWELVEFOLD VERDICT · Hit it three times this turn to interrupt its collapse.',
  act:2,faction:'the-living-lattice',entityKind:'crystal-polyhedron',
  tags:['boss','charge','multihit-counter','dodecahedron','headless','geometric'],
  silhouette:'A monumental dodecahedron on a crown of orbiting planes, each face lighting in sequence before collapse.',
  lootProfile:lootProfile(['archon-facet','geode-maul','mirror-shield','lattice-mail'],{items:['archon_facet','geode_maul','mirror_shield','lattice_mail'],excludedFamilies:['infernal','cloth'],defenseSlots:['body','offhand']})
 },

 cinder_imp:{
  name:'Cinder Imp',art:'cinder-imp',armor:0,attack:11,mechanic:'steal',
  traitText:'SNATCH · Steals 1 gold when its attack deals damage.',
  act:3,faction:'the-ember-court',entityKind:'demon',
  tags:['steal','flying','small-demon','triangular'],
  silhouette:'A tiny triangular demon with huge swept ears, short wings, and a forked tail larger than its torso.',
  lootProfile:lootProfile(['hell-fang','ember-fork','brand-guard'],{items:['hell_fang','ember_fork','brand_guard'],excludedFamilies:['crystal','plate'],excludedTags:['heavy'],defenseSlots:['offhand']})
 },
 chain_thrall:{
  name:'Chain Thrall',art:'chain-thrall',armor:1,attack:11,mechanic:'weaponbreaker',
  traitText:'CHAIN-SNARE · Its attack jams the last weapon used for the following player turn.',
  act:3,faction:'the-bound',entityKind:'thrall',
  tags:['jam','mortal','hunched','chain'],
  silhouette:'A hunched mortal in worn cloth, defined by a heavy collar and a long hooked chain arc.',
  lootProfile:lootProfile(['chain-hook','hell-cleaver','branded-hide'],{items:['chain_hook','hell_cleaver','branded_hide'],excludedFamilies:['crystal','noble'],excludedTags:['polished'],defenseSlots:['body']})
 },
 brand_serf:{
  name:'Brand Serf',art:'brand-serf',armor:1,attack:12,mechanic:'windup',
  traitText:'BRAND SWING · Alternates a visible overhead windup with increasingly forceful hammer blows.',
  act:3,faction:'the-bound',entityKind:'thrall',
  tags:['windup','mortal','hammer','brazier-yoke'],
  silhouette:'A stooped thrall beneath a square brazier yoke, both hands hauling one oversized branding hammer.',
  lootProfile:lootProfile(['furnace-maul','hell-cleaver','branded-hide'],{items:['furnace_maul','hell_cleaver','branded_hide'],excludedFamilies:['crystal','noble'],excludedTags:['polished'],defenseSlots:['body']})
 },
 furnace_brute:{
  name:'Furnace Brute',art:'furnace-brute',armor:2,attack:12,mechanic:'redjaw',berserkAttack:16,
  traitText:'VENT RAGE · Below half health, its displayed attack rises.',
  act:3,faction:'the-ember-court',entityKind:'demon',
  tags:['threshold','brute','square-body','vent'],
  silhouette:'A massive square torso with a buried head, slab fists, and one furnace vent cut through its belly.',
  lootProfile:lootProfile(['furnace-maul','hell-cleaver','black-plate'],{items:['furnace_maul','hell_cleaver','black_plate'],excludedFamilies:['crystal','cloth'],defenseSlots:['body']})
 },
 hook_fiend:{
  name:'Hook Fiend',art:'hook-fiend',armor:1,attack:0,mechanic:'powderrunner',
  chargeDamage:24,interruptHit:8,
  traitText:'HEART-HOOK · One hit meeting its displayed threshold after armor interrupts its lunge.',
  act:3,faction:'the-ember-court',entityKind:'demon',
  tags:['charge','heavy-hit-counter','tall','hooked'],
  silhouette:'A tall thin S-curve demon whose long forelimbs leave two unmistakable hook-shaped gaps.',
  lootProfile:lootProfile(['chain-hook','obsidian-lance','hell-fang'],{items:['chain_hook','obsidian_lance','hell_fang'],excludedFamilies:['crystal','plate'],excludedTags:['blunt'],defenseSlots:[]})
 },
 pain_cherub:{
  name:'Pain Cherub',art:'pain-cherub',armor:0,attack:0,mechanic:'painkeeper',reflectionMultiplier:3,
  traitText:'AGONIZED ECHO · Its next attack multiplies the largest hit it survives this turn.',
  act:3,faction:'the-ember-court',entityKind:'demon',
  tags:['retaliation','flying','radial','masked'],
  silhouette:'A rigid mask suspended in a radial fan of six small wings, with an empty ring where a body should be.',
  lootProfile:lootProfile(['hell-fang','ember-focus','ribbed-hide'],{items:['hell_fang','ember_focus','ribbed_hide'],excludedFamilies:['crystal','plate'],excludedTags:['heavy'],defenseSlots:['body']})
 },
 marrow_steward:{
  name:'Marrow Steward',art:'marrow-steward',armor:1,attack:11,mechanic:'bonecook',healInterrupt:7,
  traitText:'FLESH TITHE · Fully restores a wounded companion unless its displayed damage threshold is met.',
  act:3,faction:'the-ember-court',entityKind:'demon',
  tags:['support','heal','many-armed','bone-cage'],
  silhouette:'A narrow many-armed demon carrying a rib-cage vessel, with a long ladle crossing its whole body.',
  lootProfile:lootProfile(['bone-cage','hell-cleaver','ember-focus'],{items:['bone_cage','hell_cleaver','ember_focus'],excludedFamilies:['crystal','shield'],defenseSlots:['body']})
 },
 oath_demon:{
  name:'Oath Demon',art:'oath-demon',armor:2,attack:11,mechanic:'oathkeeper',oathMultiplier:2,
  traitText:'DAMNED OATH · Gains attack for every point of overkill dealt to a companion.',
  act:3,faction:'the-ember-court',entityKind:'demon',
  tags:['overkill-counter','pit-noble','horn-crown','armored'],
  silhouette:'An upright narrow noble with a huge asymmetric horn crown, split cape, and one clean blade mass.',
  lootProfile:lootProfile(['oath-blade','black-plate','horn-shield'],{items:['oath_blade_infernal','black_plate','horn_shield'],excludedFamilies:['crystal','cloth'],defenseSlots:['body','offhand']})
 },
 vharzael_furnace_below:{
  name:'Vharzael, the Furnace Below',art:'vharzael-furnace-below',armor:2,attack:0,mechanic:'hexsinger',
  chargeDamage:24,interruptExact:12,
  traitText:'FINAL EQUATION · Deal exactly 12 total damage this turn to break its furnace decree.',
  act:3,faction:'the-ember-court',entityKind:'demon',
  tags:['boss','charge','exact-counter','many-mawed','furnace'],
  silhouette:'A colossal low radial demon: one furnace maw, six short legs, a broken crown of horns, and a hollow ember core.',
  lootProfile:lootProfile(['heart-obsidian','oath-blade','furnace-maul','black-plate'],{items:['heart_obsidian','oath_blade_infernal','furnace_maul','black_plate'],excludedFamilies:['crystal','cloth'],defenseSlots:['body','offhand']})
 }
});

// No novel behavior is required for this content pass. Reusing the proven
// mechanics keeps the later-act rules executable without silently expanding
// the engine lifecycle.
export const NEW_MECHANIC_SPECS=deepFreeze({});

// These are annotations only. No field in ACT_ENEMIES or encounter tuples
// activates a position, Reach, AoE, movement, or directional rule.
export const PENDING_FORMATION_RULES=deepFreeze([
 {id:'lattice-sentinel-geometry',affectedEnemies:['lattice_sentinel'],
  status:'PENDING_EL008',formationDependent:true,executable:false,
  question:'How should Shieldbearer-style interception depend on front/rear order after formation rules ship?'},
 {id:'crown-cluster-direction',affectedEnemies:['crown_cluster'],
  status:'PENDING_EL008',formationDependent:true,executable:false,
  question:'Should its rally affect all companions or only enemies on a chosen side, and when is that side sampled?'},
 {id:'chain-thrall-movement',affectedEnemies:['chain_thrall'],
  status:'PENDING_EL008',formationDependent:true,executable:false,
  question:'Should the chain ever reorder a target, and how do locks and dead remains constrain that move?'},
 {id:'boss-positioning',affectedEnemies:['twelve_faced_archon','vharzael_furnace_below'],
  status:'PENDING_EL008',formationDependent:true,executable:false,
  question:'Do boss position locks govern placement only or also forced movement?'}
]);

const tuple=(type,hp,blessing=null,overrides={})=>[type,hp,blessing,overrides];
const variant=(id,weight,tuples)=>({id,weight,tuples});
const encounter=(id,day,act,kind,variants)=>({id,day,act,kind,variants});

// Every tuple contains the complete day-specific combat override used by its
// selected existing mechanic. Difficulty scaling stays outside this module.
export const ACT_ENCOUNTER_PROFILES=deepFreeze({
 11:encounter('act2-d11',11,2,'combat',[
  variant('falling-facets',4,[tuple('facet_swarm',20,null,{armor:0,attack:0,chargeDamage:12,interruptExact:3}),tuple('prism_grazer',24,null,{armor:1,attack:8,berserkAttack:12})]),
  variant('first-hinge',3,[tuple('hinge_idol',22,null,{armor:1,attack:7,trapDamage:8}),tuple('crown_cluster',24,null,{armor:1,attack:7})]),
  variant('moth-at-the-gate',3,[tuple('lattice_sentinel',26,null,{armor:2,attack:7}),tuple('gloom_moth',22,null,{armor:0,attack:7})])
 ]),
 12:encounter('act2-d12',12,2,'combat',[
  variant('choir-and-lens',4,[tuple('crown_cluster',24,null,{armor:1,attack:7}),tuple('burrowing_lens',26,'precision',{armor:1,attack:0,reflectionMultiplier:2})]),
  variant('mended-swarm',3,[tuple('geode_mender',22,null,{armor:1,attack:7,healInterrupt:5}),tuple('facet_swarm',24,null,{armor:0,attack:0,chargeDamage:14,interruptExact:3})]),
  variant('grazing-lattice',3,[tuple('prism_grazer',28,null,{armor:1,attack:8,berserkAttack:12}),tuple('lattice_sentinel',26,null,{armor:2,attack:7})])
 ]),
 14:encounter('act2-d14',14,2,'combat',[
  variant('closing-proof',4,[tuple('hinge_idol',26,'laceration',{armor:1,attack:8,trapDamage:9}),tuple('facet_swarm',24,null,{armor:0,attack:0,chargeDamage:16,interruptExact:4})]),
  variant('deep-grazers',3,[tuple('prism_grazer',28,null,{armor:1,attack:9,berserkAttack:13}),tuple('crown_cluster',26,null,{armor:1,attack:8})]),
  variant('lens-under-wing',3,[tuple('burrowing_lens',28,null,{armor:1,attack:0,reflectionMultiplier:2}),tuple('gloom_moth',24,null,{armor:0,attack:8})])
 ]),
 15:encounter('act2-d15',15,2,'combat',[
  variant('menders-ward',4,[tuple('gloom_moth',26,null,{armor:0,attack:8}),tuple('geode_mender',24,null,{armor:1,attack:8,healInterrupt:5})]),
  variant('violet-ray',3,[tuple('facet_swarm',26,'power',{armor:0,attack:0,chargeDamage:16,interruptExact:4}),tuple('hinge_idol',30,null,{armor:1,attack:8,trapDamage:9})]),
  variant('panic-orbit',3,[tuple('crown_cluster',28,null,{armor:1,attack:8}),tuple('prism_grazer',32,null,{armor:1,attack:9,berserkAttack:13})])
 ]),
 16:encounter('act2-d16',16,2,'combat',[
  variant('starless-mending',4,[tuple('geode_mender',28,null,{armor:1,attack:9,healInterrupt:5}),tuple('burrowing_lens',30,null,{armor:1,attack:0,reflectionMultiplier:2})]),
  variant('black-wing-facets',3,[tuple('gloom_moth',28,null,{armor:0,attack:9}),tuple('facet_swarm',30,'precision',{armor:0,attack:0,chargeDamage:18,interruptExact:4})]),
  variant('sentinel-idol',3,[tuple('lattice_sentinel',32,null,{armor:2,attack:9}),tuple('hinge_idol',28,null,{armor:1,attack:9,trapDamage:10})])
 ]),
 18:encounter('act2-d18',18,2,'combat',[
  variant('hard-lattice',4,[tuple('lattice_sentinel',34,'dismantling',{armor:3,attack:9}),tuple('crown_cluster',30,null,{armor:1,attack:9})]),
  variant('fault-hunters',3,[tuple('prism_grazer',32,null,{armor:1,attack:10,berserkAttack:14}),tuple('burrowing_lens',30,null,{armor:1,attack:0,reflectionMultiplier:2})]),
  variant('ray-in-the-hinge',3,[tuple('facet_swarm',34,null,{armor:0,attack:0,chargeDamage:20,interruptExact:6}),tuple('hinge_idol',32,null,{armor:1,attack:9,trapDamage:10})])
 ]),
 19:encounter('act2-d19',19,2,'combat',[
  variant('vault-wardens',4,[tuple('lattice_sentinel',36,null,{armor:3,attack:10}),tuple('gloom_moth',30,'power',{armor:0,attack:10})]),
  variant('last-refraction',3,[tuple('facet_swarm',32,null,{armor:0,attack:0,chargeDamage:22,interruptExact:6}),tuple('crown_cluster',34,null,{armor:1,attack:10})]),
  variant('moth-over-lens',3,[tuple('gloom_moth',32,null,{armor:0,attack:10}),tuple('burrowing_lens',36,null,{armor:1,attack:0,reflectionMultiplier:2})])
 ]),
 20:encounter('act2-boss',20,2,'boss',[
  variant('twelve-faced-throne',6,[tuple('twelve_faced_archon',56,'dismantling',{armor:2,attack:0,chargeDamage:18,interruptHits:3}),tuple('crown_cluster',24,null,{armor:1,attack:9})]),
  variant('archon-and-mender',2,[tuple('twelve_faced_archon',56,'dismantling',{armor:2,attack:0,chargeDamage:18,interruptHits:3}),tuple('geode_mender',18,null,{armor:1,attack:9,healInterrupt:6})]),
  variant('archon-and-grazer',2,[tuple('twelve_faced_archon',56,'dismantling',{armor:2,attack:0,chargeDamage:18,interruptHits:3}),tuple('prism_grazer',26,null,{armor:1,attack:10,berserkAttack:14})])
 ]),

 21:encounter('act3-d21',21,3,'combat',[
  variant('mouth-of-cinders',4,[tuple('cinder_imp',26,null,{armor:0,attack:10}),tuple('chain_thrall',30,null,{armor:1,attack:10})]),
  variant('first-hook',3,[tuple('hook_fiend',28,'laceration',{armor:1,attack:0,chargeDamage:20,interruptHit:7}),tuple('brand_serf',30,null,{armor:1,attack:11})]),
  variant('brute-and-cherub',3,[tuple('furnace_brute',32,null,{armor:2,attack:11,berserkAttack:15}),tuple('pain_cherub',24,null,{armor:0,attack:0,reflectionMultiplier:2})])
 ]),
 22:encounter('act3-d22',22,3,'combat',[
  variant('bound-tools',4,[tuple('chain_thrall',30,null,{armor:1,attack:10}),tuple('brand_serf',32,null,{armor:1,attack:11})]),
  variant('oath-and-imp',3,[tuple('oath_demon',30,'precision',{armor:2,attack:10,oathMultiplier:2}),tuple('cinder_imp',28,null,{armor:0,attack:10})]),
  variant('hooked-brute',3,[tuple('hook_fiend',30,null,{armor:1,attack:0,chargeDamage:22,interruptHit:7}),tuple('furnace_brute',34,null,{armor:2,attack:11,berserkAttack:15})])
 ]),
 24:encounter('act3-d24',24,3,'combat',[
  variant('furnace-tithe',4,[tuple('marrow_steward',30,null,{armor:1,attack:11,healInterrupt:7}),tuple('furnace_brute',36,null,{armor:2,attack:12,berserkAttack:16})]),
  variant('hooks-and-chains',3,[tuple('hook_fiend',32,'power',{armor:1,attack:0,chargeDamage:24,interruptHit:8}),tuple('chain_thrall',34,null,{armor:1,attack:11})]),
  variant('cherubs-brand',3,[tuple('pain_cherub',28,null,{armor:0,attack:0,reflectionMultiplier:2}),tuple('brand_serf',34,null,{armor:1,attack:12})])
 ]),
 25:encounter('act3-d25',25,3,'combat',[
  variant('basilica-oath',4,[tuple('oath_demon',38,'dismantling',{armor:2,attack:11,oathMultiplier:2}),tuple('cinder_imp',30,null,{armor:0,attack:11})]),
  variant('stewards-chain',3,[tuple('marrow_steward',34,null,{armor:1,attack:11,healInterrupt:7}),tuple('chain_thrall',36,null,{armor:1,attack:11})]),
  variant('brute-under-wing',3,[tuple('furnace_brute',38,null,{armor:2,attack:12,berserkAttack:16}),tuple('pain_cherub',30,null,{armor:0,attack:0,reflectionMultiplier:3})])
 ]),
 26:encounter('act3-d26',26,3,'combat',[
  variant('soot-labyrinth',4,[tuple('hook_fiend',36,null,{armor:1,attack:0,chargeDamage:26,interruptHit:8}),tuple('cinder_imp',34,null,{armor:0,attack:12})]),
  variant('hammer-and-oath',3,[tuple('brand_serf',40,null,{armor:1,attack:13}),tuple('oath_demon',40,'precision',{armor:2,attack:12,oathMultiplier:3})]),
  variant('marrow-furnace',3,[tuple('marrow_steward',36,null,{armor:1,attack:12,healInterrupt:8}),tuple('furnace_brute',42,null,{armor:2,attack:13,berserkAttack:17})])
 ]),
 28:encounter('act3-d28',28,3,'combat',[
  variant('lake-of-hooks',4,[tuple('hook_fiend',40,'power',{armor:1,attack:0,chargeDamage:28,interruptHit:8}),tuple('chain_thrall',42,null,{armor:1,attack:13})]),
  variant('cherub-court',3,[tuple('pain_cherub',36,null,{armor:0,attack:0,reflectionMultiplier:3}),tuple('oath_demon',44,null,{armor:2,attack:13,oathMultiplier:3})]),
  variant('tithe-at-the-lake',3,[tuple('marrow_steward',40,null,{armor:1,attack:13,healInterrupt:8}),tuple('brand_serf',44,null,{armor:1,attack:14})])
 ]),
 29:encounter('act3-d29',29,3,'combat',[
  variant('throneward-oath',4,[tuple('oath_demon',48,'dismantling',{armor:3,attack:14,oathMultiplier:3}),tuple('chain_thrall',44,null,{armor:1,attack:14})]),
  variant('last-heart-hook',3,[tuple('hook_fiend',44,null,{armor:1,attack:0,chargeDamage:30,interruptHit:8}),tuple('furnace_brute',50,null,{armor:2,attack:15,berserkAttack:19})]),
  variant('steward-of-brands',3,[tuple('marrow_steward',44,null,{armor:1,attack:14,healInterrupt:8}),tuple('brand_serf',48,null,{armor:1,attack:15})])
 ]),
 30:encounter('act3-boss',30,3,'boss',[
  variant('heart-below',6,[tuple('vharzael_furnace_below',72,'dismantling',{armor:2,attack:0,chargeDamage:24,interruptExact:12}),tuple('oath_demon',30,null,{armor:2,attack:12,oathMultiplier:3})]),
  variant('heart-and-steward',2,[tuple('vharzael_furnace_below',72,'dismantling',{armor:2,attack:0,chargeDamage:24,interruptExact:12}),tuple('marrow_steward',24,null,{armor:1,attack:12,healInterrupt:8})]),
  variant('heart-and-chain',2,[tuple('vharzael_furnace_below',72,'dismantling',{armor:2,attack:0,chargeDamage:24,interruptExact:12}),tuple('chain_thrall',30,null,{armor:1,attack:12})])
 ])
});

// Intended progression bands are review anchors, not claims about win rates.
// Zero-attack charged and reactive enemies are summarized by chargeDamage.
export const ACT_DAY_BALANCE_PROFILES=deepFreeze({
 11:{hp:[20,26],attack:[7,8],armor:[0,2],charge:[12,12],status:CONTENT_BALANCE_STATUS},
 12:{hp:[22,28],attack:[7,8],armor:[0,2],charge:[14,14],status:CONTENT_BALANCE_STATUS},
 14:{hp:[24,28],attack:[8,9],armor:[0,1],charge:[16,16],status:CONTENT_BALANCE_STATUS},
 15:{hp:[24,32],attack:[8,9],armor:[0,1],charge:[16,16],status:CONTENT_BALANCE_STATUS},
 16:{hp:[28,32],attack:[9,9],armor:[0,2],charge:[18,18],status:CONTENT_BALANCE_STATUS},
 18:{hp:[30,34],attack:[9,10],armor:[0,3],charge:[20,20],status:CONTENT_BALANCE_STATUS},
 19:{hp:[30,36],attack:[10,10],armor:[0,3],charge:[22,22],status:CONTENT_BALANCE_STATUS},
 20:{hp:[18,56],attack:[9,10],armor:[1,2],charge:[18,18],status:CONTENT_BALANCE_STATUS},
 21:{hp:[24,32],attack:[10,11],armor:[0,2],charge:[20,20],status:CONTENT_BALANCE_STATUS},
 22:{hp:[28,34],attack:[10,11],armor:[0,2],charge:[22,22],status:CONTENT_BALANCE_STATUS},
 24:{hp:[28,36],attack:[11,12],armor:[0,2],charge:[24,24],status:CONTENT_BALANCE_STATUS},
 25:{hp:[30,38],attack:[11,12],armor:[0,2],charge:[],status:CONTENT_BALANCE_STATUS},
 26:{hp:[34,42],attack:[12,13],armor:[0,2],charge:[26,26],status:CONTENT_BALANCE_STATUS},
 28:{hp:[36,44],attack:[13,14],armor:[0,2],charge:[28,28],status:CONTENT_BALANCE_STATUS},
 29:{hp:[44,50],attack:[14,15],armor:[1,3],charge:[30,30],status:CONTENT_BALANCE_STATUS},
 30:{hp:[24,72],attack:[12,12],armor:[1,2],charge:[24,24],status:CONTENT_BALANCE_STATUS}
});

export const ACT_EVENTS=deepFreeze({
 13:{id:'blind-cartographer',day:13,act:2,title:'The Blind Cartographer',
  desc:'A sightless cave-reader maps the next fault by listening to crystal song.',options:[
   {id:'share-cavewater',label:'Share cavewater',desc:'Rest beside the sounding wall. Restore 14 health.',heal:14,endsEvent:true},
   {id:'buy-prism-needle',label:'Buy the marked needle',desc:'Pay 7 gold for a polished Prism needle.',cost:7,item:'prism_needle',endsEvent:true,purchasedOnce:true},
   {id:'follow-echoes',label:'Follow the echoes',desc:'Keep your gold and descend.',endsEvent:true}
  ]},
 17:{id:'facet-bazaar',day:17,act:2,title:'The Facet Bazaar',
  desc:'Silent prisms trade worked arcana through light, weight, and exact change.',options:[
   {id:'buy-facet-blade',label:'Facet blade',desc:'Pay 10 gold for a polished Facet blade.',cost:10,item:'facet_blade',endsEvent:false,purchasedOnce:true},
   {id:'buy-prism-focus',label:'Prism focus',desc:'Pay 11 gold for a cut-crystal focus.',cost:11,item:'prism_focus',endsEvent:false,purchasedOnce:true},
   {id:'buy-lattice-mail',label:'Lattice mail',desc:'Pay 12 gold for fitted lattice mail.',cost:12,item:'lattice_mail',endsEvent:false,purchasedOnce:true},
   {id:'drink-mineral-broth',label:'Mineral broth',desc:'Pay 6 gold and restore 20 health.',cost:6,heal:20,endsEvent:false,purchasedOnce:true},
   {id:'leave-bazaar',label:'Leave the light',desc:'Close the bargain and descend.',endsEvent:true}
  ]},
 23:{id:'last-pilgrim',day:23,act:3,title:'The Last Pilgrim',
  desc:'A burned pilgrim guards one unbroken pack beneath a bridge of chains.',options:[
   {id:'tend-the-pilgrim',label:'Tend the pilgrim',desc:'Spend 5 gold on clean water and share the rest. Restore 22 health.',cost:5,heal:22,endsEvent:true},
   {id:'take-branded-hide',label:'Buy the branded hide',desc:'Pay 10 gold for Branded hide.',cost:10,item:'branded_hide',endsEvent:true,purchasedOnce:true},
   {id:'buy-pilgrims-oath-blade',label:'Buy the pilgrim’s oath blade',desc:'Pay 13 gold for a Damned oath blade.',cost:13,item:'oath_blade_infernal',endsEvent:true,purchasedOnce:true},
   {id:'cross-alone',label:'Cross alone',desc:'Leave the pack sealed and enter the pits.',endsEvent:true}
  ]},
 27:{id:'infernal-broker',day:27,act:3,title:'The Infernal Broker',
  desc:'A chained broker prices every weapon in coin, never promises.',options:[
   {id:'buy-oath-blade',label:'Damned oath blade',desc:'Pay 13 gold for a hell-forged oath blade.',cost:13,item:'oath_blade_infernal',endsEvent:false,purchasedOnce:true},
   {id:'buy-furnace-maul',label:'Furnace maul',desc:'Pay 14 gold for a Furnace maul.',cost:14,item:'furnace_maul',endsEvent:false,purchasedOnce:true},
   {id:'buy-horn-shield',label:'Horn shield',desc:'Pay 14 gold for a Horn shield.',cost:14,item:'horn_shield',endsEvent:false,purchasedOnce:true},
   {id:'buy-bitter-rest',label:'Bitter rest',desc:'Pay 7 gold and restore 26 health.',cost:7,heal:26,endsEvent:false,purchasedOnce:true},
   {id:'leave-broker',label:'Break the chain',desc:'End the bargain and go.',endsEvent:true}
  ]}
});

// Abstract groups align with campaign.js. They index the concrete day records
// without replacing deterministic day-level variant selection.
export const ENCOUNTER_PROFILES=deepFreeze({
 'act2-crystal-cave':{id:'act2-crystal-cave',act:2,kind:'combat',days:[11,12,14,15,16,18,19]},
 'act2-event':{id:'act2-event',act:2,kind:'event',days:[13,17]},
 'act2-boss':{id:'act2-boss',act:2,kind:'boss',days:[20]},
 'act3-hell-pits':{id:'act3-hell-pits',act:3,kind:'combat',days:[21,22,24,25,26,28,29]},
 'act3-event':{id:'act3-event',act:3,kind:'event',days:[23,27]},
 'act3-boss':{id:'act3-boss',act:3,kind:'boss',days:[30]}
});

export const ACT_CONTENT=deepFreeze({
 2:{act:2,id:'crystal-below',enemyTypeIds:Object.keys(ACT_ENEMIES).filter(id=>ACT_ENEMIES[id].act===2),
  combatDays:[11,12,14,15,16,18,19],eventDays:[13,17],bossDay:20,
  encounterProfileIds:{combat:'act2-crystal-cave',event:'act2-event',boss:'act2-boss'},
  majorityEntityKind:'crystal-polyhedron',minorityEntityKind:'cave-creature',balanceStatus:CONTENT_BALANCE_STATUS},
 3:{act:3,id:'pits-of-hell',enemyTypeIds:Object.keys(ACT_ENEMIES).filter(id=>ACT_ENEMIES[id].act===3),
  combatDays:[21,22,24,25,26,28,29],eventDays:[23,27],bossDay:30,
  encounterProfileIds:{combat:'act3-hell-pits',event:'act3-event',boss:'act3-boss'},
  majorityEntityKind:'demon',minorityEntityKind:'thrall',balanceStatus:CONTENT_BALANCE_STATUS}
});

const allowedMechanics=new Set(['steal','rage','windup','fortify','rally','powderrunner','headsman','hexsinger','redjaw','trapwright','shieldbearer','bonecook','painkeeper','weaponbreaker','oathkeeper']);
const mechanicParams={powderrunner:['chargeDamage','interruptHit'],headsman:['chargeDamage','interruptHits'],hexsinger:['chargeDamage','interruptExact'],redjaw:['berserkAttack'],trapwright:['trapDamage'],bonecook:['healInterrupt'],painkeeper:['reflectionMultiplier'],oathkeeper:['oathMultiplier']};
const allowedTupleOverrides=new Set(['attack','armor','chargeDamage','interruptHit','interruptHits','interruptExact','berserkAttack','trapDamage','healInterrupt','reflectionMultiplier','oathMultiplier']);
const requiredCombatDays=[11,12,14,15,16,18,19,20,21,22,24,25,26,28,29,30];
const requiredEventDays=[13,17,23,27];

export function weightedEntityShare(act,entityKind){
 let matching=0,total=0;
 for(const profile of Object.values(ACT_ENCOUNTER_PROFILES))if(profile.act===act){
  for(const option of profile.variants)for(const [type] of option.tuples){
   total+=option.weight;if(ACT_ENEMIES[type]?.entityKind===entityKind)matching+=option.weight;
  }
 }
 return total?matching/total:0;
}

export function validateActContent(){
 const errors=[];
 const enemyIds=Object.keys(ACT_ENEMIES);
 if(enemyIds.filter(id=>ACT_ENEMIES[id].act===2).length!==9)errors.push('Act II must define exactly 9 enemy types including its boss.');
 if(enemyIds.filter(id=>ACT_ENEMIES[id].act===3).length!==9)errors.push('Act III must define exactly 9 enemy types including its boss.');
 for(const [id,enemy] of Object.entries(ACT_ENEMIES)){
  if(!enemy.name||!enemy.art||!enemy.traitText)errors.push(`${id} is missing display or art identity.`);
  if(!Number.isInteger(enemy.armor)||enemy.armor<0||!Number.isInteger(enemy.attack)||enemy.attack<0)errors.push(`${id} has invalid base combat stats.`);
  if(!allowedMechanics.has(enemy.mechanic)&&!NEW_MECHANIC_SPECS[enemy.mechanic])errors.push(`${id} uses undeclared mechanic ${enemy.mechanic}.`);
  for(const key of mechanicParams[enemy.mechanic]||[])if(!Number.isInteger(enemy[key])||enemy[key]<0)errors.push(`${id} is missing ${key}.`);
  const loot=enemy.lootProfile;
  if(!loot||!['families','items','excludedFamilies','excludedTags','defenseSlots'].every(key=>Array.isArray(loot[key])))errors.push(`${id} has an invalid loot profile.`);
  if(loot?.defenseSlots.some(slot=>!['body','offhand'].includes(slot)))errors.push(`${id} has an invalid defense slot.`);
 }
 if(Object.keys(ACT_ENCOUNTER_PROFILES).map(Number).join(',')!==requiredCombatDays.join(','))errors.push('Combat day keys do not match the EL-009 cadence.');
 for(const [dayKey,profile] of Object.entries(ACT_ENCOUNTER_PROFILES)){
  const day=Number(dayKey);
  if(profile.day!==day||profile.act!==(day<=20?2:3)||!['combat','boss'].includes(profile.kind))errors.push(`Day ${day} has invalid encounter metadata.`);
  if((day===20||day===30)!==(profile.kind==='boss'))errors.push(`Day ${day} has an invalid boss kind.`);
  if(!profile.variants.length)errors.push(`Day ${day} has no variants.`);
 for(const option of profile.variants){
   if(!Number.isInteger(option.weight)||option.weight<=0||option.tuples.length!==2)errors.push(`${option.id} must keep the current two-enemy baseline and use a positive integer weight.`);
   for(const entry of option.tuples){
    const [type,hp,blessing,overrides={}]=entry;
    if(!ACT_ENEMIES[type]||ACT_ENEMIES[type].act!==profile.act)errors.push(`${option.id} uses an unknown or cross-act enemy ${type}.`);
    if(!Number.isInteger(hp)||hp<=0)errors.push(`${option.id}/${type} has invalid HP.`);
    if(blessing!==null&&!['power','precision','laceration','dismantling'].includes(blessing))errors.push(`${option.id}/${type} has invalid blessing ${blessing}.`);
    if(!Number.isInteger(overrides.attack)||overrides.attack<0||!Number.isInteger(overrides.armor)||overrides.armor<0)errors.push(`${option.id}/${type} needs explicit day attack and armor.`);
    for(const [key,value] of Object.entries(overrides))if(!allowedTupleOverrides.has(key)||!Number.isInteger(value)||value<0)errors.push(`${option.id}/${type} has invalid override ${key}.`);
   }
   const hasArmoredInterceptor=option.tuples.some(([type,,,{armor=ACT_ENEMIES[type]?.armor??0}={}])=>ACT_ENEMIES[type]?.mechanic==='shieldbearer'&&armor>0);
   const hasFullHealer=option.tuples.some(([type])=>ACT_ENEMIES[type]?.mechanic==='bonecook');
   if(hasArmoredInterceptor&&hasFullHealer)errors.push(`${option.id} combines armored interception with an inaccessible full healer.`);
   if(profile.act===2&&!option.tuples.some(([type])=>ACT_ENEMIES[type]?.entityKind==='crystal-polyhedron'))errors.push(`${option.id} lacks a crystalline polyhedral entity.`);
  }
 }
 for(const id of enemyIds)if(!Object.values(ACT_ENCOUNTER_PROFILES).some(profile=>profile.variants.some(option=>option.tuples.some(([type])=>type===id))))errors.push(`${id} never appears in an encounter variant.`);
 if(Object.keys(ACT_EVENTS).map(Number).join(',')!==requiredEventDays.join(','))errors.push('Event day keys do not match the EL-009 cadence.');
 for(const [dayKey,event] of Object.entries(ACT_EVENTS)){
  const day=Number(dayKey);
  if(event.day!==day||event.act!==(day<=20?2:3)||!event.id||!event.title||!event.desc||!event.options.length)errors.push(`Day ${day} has invalid event data.`);
  for(const option of event.options)if(!option.id||!option.label||!option.desc)errors.push(`Day ${day} has an incomplete event option.`);
 }
 const act2Types=ACT_CONTENT[2].enemyTypeIds.filter(id=>ACT_ENEMIES[id].entityKind==='crystal-polyhedron').length/ACT_CONTENT[2].enemyTypeIds.length;
 if(act2Types<=0.5)errors.push('Act II enemy types are not majority crystal-polyhedron.');
 if(weightedEntityShare(2,'crystal-polyhedron')<=0.5)errors.push('Act II weighted encounter slots are not majority crystal-polyhedron.');
 if(weightedEntityShare(3,'demon')<=0.5)errors.push('Act III weighted encounter slots are not majority demons.');
 return {ok:errors.length===0,errors,metrics:{
  act2EnemyTypeCrystalShare:act2Types,
  act2WeightedCrystalEncounterShare:weightedEntityShare(2,'crystal-polyhedron'),
  act3WeightedDemonEncounterShare:weightedEntityShare(3,'demon')
 }};
}
