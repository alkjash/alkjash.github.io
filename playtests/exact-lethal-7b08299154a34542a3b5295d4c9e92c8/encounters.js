// The director uses its own random stream. Combat choices and reward rolls cannot
// reroll tomorrow's encounter, and the director never looks at the carried gear.
import {ACT_ENEMIES,ACT_ENCOUNTER_PROFILES} from './act-content.js';

export const COMBAT_DAYS=Object.freeze([1,2,4,5,6,8,9,10]);
export const CAMPAIGN_COMBAT_DAYS=Object.freeze([...COMBAT_DAYS,...Object.keys(ACT_ENCOUNTER_PROFILES).map(Number)]);
export const NEW_ENEMY_TYPES=Object.freeze(['powderrunner','headsman','hexsinger','redjaw','trapwright','shieldbearer','bonecook','painkeeper','weaponbreaker','oathkeeper']);

// Five highest aggregate scores in the matched day-6/day-9 enemy playtest.
// The fifth/sixth boundary is close and remains a prototype balance decision;
// see ENEMY-PLAYTEST.md. Callers can override the split for regression tests.
export const DANGEROUS_TYPES=Object.freeze(['redjaw','hexsinger','trapwright','painkeeper','shieldbearer']);

// Costs are descriptive role estimates, not the empirical difficulty ranking.
// The generator below budgets actual reference finishing actions, including
// armor and the revenant's growth, rather than relying on these estimates.
export const ENCOUNTER_ROSTER=Object.freeze({
 goblin:{minDay:1,cost:1,attackWeight:1,armor:0,tags:[]},
 orc:{minDay:2,cost:1.08,attackWeight:1,armor:0,tags:['growth']},
 assassin:{minDay:4,cost:1.06,attackWeight:1.25,armor:0,tags:[]},
 knight:{minDay:4,cost:1.12,attackWeight:1,armor:1,tags:['growth']},
 shaman:{minDay:5,cost:1.2,attackWeight:0.75,armor:0,tags:['growth','support']},
 powderrunner:{minDay:4,cost:1.18,attackWeight:1,armor:0,tags:['charge'],counterActions:1},
 headsman:{minDay:4,cost:1.3,attackWeight:1,armor:0,tags:['charge'],counterActions:3},
 hexsinger:{minDay:4,cost:1.3,attackWeight:0.8,armor:0,tags:['charge','exact-counter'],counterActions:2},
 redjaw:{minDay:4,cost:1.12,attackWeight:1.1,armor:0,tags:['threshold']},
 trapwright:{minDay:4,cost:1.14,attackWeight:0.9,armor:0,tags:['slot-control']},
 shieldbearer:{minDay:4,cost:1.16,attackWeight:0.9,armor:2,tags:['protector']},
 bonecook:{minDay:4,cost:1.2,attackWeight:0.8,armor:0,tags:['support','heal'],counterActions:1},
 painkeeper:{minDay:4,cost:1.3,attackWeight:1,armor:0,tags:['retaliation']},
 weaponbreaker:{minDay:4,cost:1.16,attackWeight:1,armor:0,tags:['jam']},
 oathkeeper:{minDay:4,cost:1.02,attackWeight:1,armor:0,tags:['overkill']},
 boss:{minDay:10,cost:1.18,attackWeight:1.15,armor:1,tags:['boss','growth']},
 ...Object.fromEntries(Object.entries(ACT_ENEMIES).map(([id,enemy])=>[id,{
  minDay:enemy.act===2?11:21,cost:1,attackWeight:1,armor:enemy.armor,tags:[...enemy.tags]
 }]))
});

// Exact-finishing action budgets grow gradually. The reference weapon is fixed
// by the day and the shop stock; actual player equipment is never consulted.
// Attack damage also accounts for the armor sold at those stops.
// Charge damage remains frightening when its clearly displayed counter is
// ignored; early versions have weaker, day-fixed numbers than late versions.
export const COMBAT_PROFILES=Object.freeze({
 1:{actionBudget:2,referenceDamage:2,attack:2,specialScale:0.3},
 2:{actionBudget:5,referenceDamage:2,attack:2,specialScale:0.35},
 4:{actionBudget:6,referenceDamage:5,attack:3,specialScale:0.45},
 5:{actionBudget:7,referenceDamage:5,attack:4,specialScale:0.55},
 6:{actionBudget:8,referenceDamage:5,attack:5,specialScale:0.7},
 8:{actionBudget:9,referenceDamage:10,attack:11,specialScale:0.85},
 9:{actionBudget:10,referenceDamage:10,attack:11,specialScale:0.95},
 10:{actionBudget:12,referenceDamage:10,attack:10,specialScale:1}
});

function numericSeed(seed){
 if(typeof seed==='number'&&Number.isFinite(seed))return seed>>>0;
 let value=2166136261;for(const char of String(seed))value=Math.imul(value^char.charCodeAt(0),16777619);return value>>>0;
}
function mix(value){value=Math.imul(value^(value>>>16),0x21f0aaad);value=Math.imul(value^(value>>>15),0x735a2d97);return(value^(value>>>15))>>>0;}
export function encounterSeed(seed,day){return mix(numericSeed(seed)^Math.imul(day,0x9e3779b1)^0x454c4452);}
function randomStream(seed){let value=seed;return()=>{value=(value+0x6d2b79f5)>>>0;let t=Math.imul(value^(value>>>15),value|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const pick=(random,values)=>values[Math.floor(random()*values.length)];
const round=value=>Math.round(value*1000)/1000;

export function isCompatiblePair(first,second){
 const a=ENCOUNTER_ROSTER[first],b=ENCOUNTER_ROSTER[second];
 if(!a||!b)return false;
 if(first===second&&!['goblin','orc'].includes(first))return false;
 // Three energy must be enough to answer every simultaneous mandatory charge.
 if((a.counterActions||0)+(b.counterActions||0)>3)return false;
 const has=(role,tag)=>role.tags.includes(tag);
 for(const [protector,other]of[[a,b],[b,a]]){
  if(has(protector,'protector')&&(has(other,'charge')||has(other,'heal')))return false;
  if(has(protector,'jam')&&(has(other,'charge')||has(other,'slot-control')))return false;
 }
 // Healing an armored protector repeatedly is a stall trap rather than a
 // useful priority puzzle. Stacking two ally-wide growth effects is also out.
 if(has(a,'support')&&has(b,'support'))return false;
 if(first==='shaman'&&has(b,'growth')||second==='shaman'&&has(a,'growth'))return false;
 return true;
}

export function eligibleEnemyTypes(day,{dangerous=false,dangerousTypes=DANGEROUS_TYPES}={}){
 const blocked=new Set(dangerousTypes);
 return Object.keys(ENCOUNTER_ROSTER).filter(type=>type!=='boss'&&ENCOUNTER_ROSTER[type].minDay<=day&&(dangerous||!blocked.has(type)));
}

function chooseTypes(day,options,random){
 if(day===1)return['goblin'];
 const allowed=eligibleEnemyTypes(day,options);
 if(day===2){const first=pick(random,['goblin','orc']);return[first,first==='orc'?'goblin':'orc'];}
 const specials=allowed.filter(type=>NEW_ENEMY_TYPES.includes(type));
 if(day===10){const support=allowed.filter(type=>isCompatiblePair('boss',type));return['boss',pick(random,support)];}
 const first=pick(random,specials.length?specials:allowed);
 let partners=allowed.filter(type=>isCompatiblePair(first,type));
 // Teach one new mechanic at a time immediately after the first shop.
 if(day===4)partners=partners.filter(type=>['goblin','orc'].includes(type));
 else if(day===5)partners=partners.filter(type=>['goblin','orc','assassin','knight'].includes(type));
 return[first,pick(random,partners.length?partners:['goblin'])];
}

export function mechanicStats(day,profile=COMBAT_PROFILES[day]){
 const scale=profile.specialScale;
 return {
  chargeDamage:{powderrunner:Math.round(40*scale),headsman:Math.round(45*scale),hexsinger:Math.round(30*scale)},
  // The fixed five-damage sword from the first shop can answer early bombs.
  interruptHit:day<8?5:6,interruptHits:3,interruptExact:2,
  berserkAttack:Math.round(28*scale),trapDamage:Math.max(4,Math.round(12*scale)),
  healInterrupt:4,reflectionMultiplier:day<8?3:4,oathMultiplier:day<8?3:4
 };
}

function typeStats(type,day,profile){
 const all=mechanicStats(day,profile),stats={armor:ENCOUNTER_ROSTER[type].armor};
 if(type==='powderrunner')Object.assign(stats,{chargeDamage:all.chargeDamage.powderrunner,interruptHit:all.interruptHit});
 if(type==='headsman')Object.assign(stats,{chargeDamage:all.chargeDamage.headsman,interruptHits:all.interruptHits});
 if(type==='hexsinger')Object.assign(stats,{chargeDamage:all.chargeDamage.hexsinger,interruptExact:all.interruptExact});
 if(type==='redjaw')stats.berserkAttack=all.berserkAttack;
 if(type==='trapwright')stats.trapDamage=all.trapDamage;
 if(type==='bonecook')stats.healInterrupt=all.healInterrupt;
 if(type==='painkeeper')stats.reflectionMultiplier=all.reflectionMultiplier;
 if(type==='oathkeeper')stats.oathMultiplier=all.oathMultiplier;
 return stats;
}

const referenceCache=new Map();
function referenceTable(type,referenceDamage,armor=ENCOUNTER_ROSTER[type].armor){
 const key=`${type}/${referenceDamage}/${armor}`;
 if(referenceCache.has(key))return referenceCache.get(key);
 // The armored foe may wait one round while its companion is interrupted.
 // Thereafter every third attack advances the next enemy turn and its armor.
 const growth=type==='knight',startArmor=armor+(growth?1:0),minimum=[0];
 let totals=new Set([0]);
 for(let actions=1;actions<=40;actions++){
  const bulk=Math.max(0,referenceDamage-startArmor-(growth?Math.floor((actions-1)/3):0));
  const next=new Set();
  for(const total of totals){next.add(total+1);if(bulk>0)next.add(total+bulk);}
  for(const hp of next)if(minimum[hp]===undefined)minimum[hp]=actions;
  totals=next;
 }
 referenceCache.set(key,minimum);return minimum;
}

export function referenceActions(type,hp,referenceDamage,armor=ENCOUNTER_ROSTER[type].armor){
 return referenceTable(type,referenceDamage,armor)[hp]??Infinity;
}

function healthForActions(type,actions,profile,random,{hpBonus=0,armorBonus=0}={}){
 const role=ENCOUNTER_ROSTER[type],armor=role.armor+armorBonus,healthMultiplier=1+hpBonus;
 const hit=Math.max(1,profile.referenceDamage-armor-(type==='knight'?1:0));
 const table=referenceTable(type,profile.referenceDamage,armor),candidates=[];
 // Preserve the printed road modifiers: these are raw HP values, and the
 // engine still applies ceil(raw HP * 1.25). Budget the resulting fight so
 // multiplication cannot accidentally create a long needle-only remainder.
 // This calibration sees the road and fixed day weapon, never carried gear.
 const minimum=hpBonus||armorBonus?2:Math.max(2,actions+1);
 for(let hp=minimum;Math.ceil(hp*healthMultiplier)<table.length;hp++)if(table[Math.ceil(hp*healthMultiplier)]===actions)candidates.push(hp);
 // Keep several finishing patterns: direct bulk exacts, one, two, or three
// needle pokes. Their total attack cost is equal even when HP differs widely.
 const remainders=[0,1,1,2,2,3].filter(value=>value<actions&&value<hit);
 const remainder=pick(random,remainders.length?remainders:[0]);
 const desired=(actions-remainder)*hit+remainder;
 if(!candidates.length)throw new RangeError(`No ${type} health fits ${actions} reference actions on this road.`);
 const distances=candidates.map(hp=>Math.abs(Math.ceil(hp*healthMultiplier)-desired)),best=Math.min(...distances);
 return pick(random,candidates.filter((hp,index)=>distances[index]===best));
}

// This remains a pacing heuristic, not a claim about actual health lost. Its
// action term now includes the real exact-lethal remainder cost. Gameplay
// tests separately measure health loss and failures of each visible counter.
export function estimateThreat(tuples,referenceDamage=5){return tuples.reduce((total,[type,hp,,override={}])=>{
 const stats=typeof override==='number'?{attack:override}:override;
 return total+8*referenceActions(type,hp,referenceDamage,stats.armor??ENCOUNTER_ROSTER[type].armor)+2*(stats.attack||0);
},0);}

export function generateEncounter(day,options={},seed=0){
 if(!CAMPAIGN_COMBAT_DAYS.includes(day))throw new RangeError(`Day ${day} is not a combat day.`);
 if(typeof options==='boolean')options={dangerous:options};
 if(day>10){
  const encounter=ACT_ENCOUNTER_PROFILES[day],localSeed=encounterSeed(seed,day),random=randomStream(localSeed);
  const totalWeight=encounter.variants.reduce((sum,variant)=>sum+variant.weight,0);
  let draw=random()*totalWeight,selected=encounter.variants.at(-1);
  for(const variant of encounter.variants){draw-=variant.weight;if(draw<0){selected=variant;break;}}
  const tuples=selected.tuples.map(([type,hp,blessing,override={}])=>[type,hp,blessing,{...override}]);
  const hpBonus=options.hpBonus||0,armorBonus=options.armorBonus||0,attackBonus=options.attackBonus||0;
  const scaled=tuples.map(([type,hp,blessing,stats])=>[type,Math.ceil(hp*(1+hpBonus)),blessing,{...stats,armor:stats.armor+armorBonus,attack:stats.attack+attackBonus}]);
  const referenceDamage=day<=20?10:15,actualThreat=estimateThreat(scaled,referenceDamage);
  return {day,seed:localSeed,profileId:encounter.id,variantId:selected.id,tuples,
   types:tuples.map(tuple=>tuple[0]),dangerous:false,threatBudget:actualThreat,actualThreat,
   hpBudget:scaled.reduce((sum,tuple)=>sum+tuple[1],0),
   attackBudget:scaled.reduce((sum,tuple)=>sum+tuple[3].attack,0),referenceDamage};
 }
 const profile={...COMBAT_PROFILES[day],...(options.profileOverrides?.[day]||{})};
 const hpBonus=options.hpBonus||0,armorBonus=options.armorBonus||0,attackBonus=options.attackBonus||0;
 const localSeed=encounterSeed(seed,day),random=randomStream(localSeed),types=chooseTypes(day,options,random);
 if(day===1){
  const hp=Math.ceil(4*(1+hpBonus)),actions=referenceActions('goblin',hp,2,armorBonus),attack=2+attackBonus,threat=8*actions+2*attack;
  return{day,seed:localSeed,tuples:[['goblin',4,null,{attack:2,armor:0}]],types:['goblin'],dangerous:false,threatBudget:threat,actualThreat:threat,hpBudget:hp,attackBudget:attack,referenceDamage:2,referenceActionBudget:actions,referenceActions:actions};
 }
 // Every composition fits the same day budget. The harder pool adds mechanics,
 // not a second stat premium that could make an earlier day exceed a later one.
 const dangerousSet=new Set(options.dangerousTypes||DANGEROUS_TYPES),containsDanger=types.some(type=>dangerousSet.has(type));
 const actionBudget=profile.actionBudget,baseAttackBudget=profile.attack*types.length,attackBudget=baseAttackBudget+attackBonus*types.length;
 const share=day===10?0.62:0.45+random()*0.1;
 const firstActions=Math.max(2,Math.min(actionBudget-2,Math.round(actionBudget*share))),actions=[firstActions,actionBudget-firstActions];
 const weight=types.reduce((sum,type)=>sum+ENCOUNTER_ROSTER[type].attackWeight,0);
 const firstAttack=Math.max(1,Math.round(baseAttackBudget*ENCOUNTER_ROSTER[types[0]].attackWeight/weight));
 const attacks=[firstAttack,Math.max(1,baseAttackBudget-firstAttack)];
 const tuples=types.map((type,index)=>{
  const stats=typeStats(type,day,profile);stats.attack=attacks[index];
  const hp=healthForActions(type,actions[index],profile,random);
  return[type,hp,null,stats];
 });
 const finalTuples=tuples.map(([type,hp,blessing,stats])=>[type,Math.ceil(hp*(1+hpBonus)),blessing,{...stats,armor:stats.armor+armorBonus,attack:stats.attack+attackBonus}]);
 const exactActions=finalTuples.reduce((sum,[type,hp,,stats])=>sum+referenceActions(type,hp,profile.referenceDamage,stats.armor),0);
 const actualThreat=estimateThreat(finalTuples,profile.referenceDamage);
 return{day,seed:localSeed,tuples,types,dangerous:containsDanger,threatBudget:actualThreat,actualThreat,hpBudget:finalTuples.reduce((sum,tuple)=>sum+tuple[1],0),attackBudget,referenceDamage:profile.referenceDamage,baseReferenceActionBudget:actionBudget,referenceActionBudget:exactActions,referenceActions:exactActions};
}
