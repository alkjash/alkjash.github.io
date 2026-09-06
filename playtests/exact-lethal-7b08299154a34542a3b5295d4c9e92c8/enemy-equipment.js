import {eligibleEnemyLoot} from './loot-tables.js';
import {WEAPONS} from './equipment-catalog.js';
// Cosmetic only: never call the reward selector or consume run RNG.
const preferred={goblin:'dagger',assassin:'twin_fangs',orc:'axe',shaman:'ritual_rod',knight:'sword',boss:'hammer',powderrunner:'powder_spike',headsman:'splitting_axe',hexsinger:'ritual_rod',redjaw:'cook_cleaver',trapwright:'trap_hook',shieldbearer:'sword',bonecook:'cook_cleaver',painkeeper:'hammer',weaponbreaker:'war_pick',oathkeeper:'spear',chain_thrall:'chain_hook',brand_serf:'furnace_maul',oath_demon:'oath_blade_infernal'};
export const ENEMY_GEAR_EXCEPTIONS=Object.freeze({
 crystal:'All nine Act II enemies are crystal entities or incompatible animal bodies; drops are recovered material/trophies, not manufactured worn equipment.',
 cinder_imp:'Small flying animal body; fang, fork and guard are trophies.',
 furnace_brute:'Furnace body and fists are anatomy, not wearable plate or a held maul.',
 hook_fiend:'Hook is the creature’s anatomical claw; recovered hook is a trophy.',
 pain_cherub:'Floating winged entity; hides and foci are trophies.',
 marrow_steward:'Integrated furnace cage and ritual ladle preserve identity; loot is recovered ritual equipment.',
 vharzael_furnace_below:'Living furnace spider; obsidian heart and gear are trophies.',
 armor:'Base clothing, helmets, pauldrons and integrated armor retain actor identity. Eligible body/offhand artwork is shown over the torso/hand where humanoid proportions permit.'
});
export function enemyVisualGear(type,day){
 if(!Object.hasOwn(preferred,type))return [];
 const ids=eligibleEnemyLoot(type,day),active=ids.filter(id=>!WEAPONS[id].passive);
 const main=active.includes(preferred[type])?preferred[type]:active[0];
 const body=ids.find(id=>WEAPONS[id].defenseSlot==='body');
 const off=ids.find(id=>WEAPONS[id].defenseSlot==='offhand');
 return [{id:main,slot:'mainhand'},{id:body,slot:'bodygear'},{id:off,slot:'offhand'}].filter(x=>x.id);
}
