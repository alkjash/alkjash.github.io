// Exact Lethal — deterministic, JSON-safe rules independent of the UI.
import {generateEncounter,DANGEROUS_TYPES} from './encounters.js';
import {WEAPONS,STARTING_POOL} from './equipment-catalog.js';
import {selectEnemyLoot,selectShopStock} from './loot-tables.js';
import {ACT_ENEMIES,ACT_EVENTS} from './act-content.js';
import {DAYS as CAMPAIGN_DAYS,RECOVERY_POLICIES,campaignStateForDay,dayDefinition,isActMilestone,isFinalDay,validateCampaignState} from './campaign.js';
export {WEAPONS,STARTING_POOL,RECOVERY_POLICIES};
export const SAVE_VERSION=8;
export const REWARD_ITEM_CHANCE=0.2;
export const BLESSINGS = {
 power:{id:'power',name:'Blessing of Power',desc:'+1 to both damage endpoints.'},
 precision:{id:'precision',name:'Blessing of Precision',desc:'Fix damage at the midpoint of its range, rounded up.'},
 laceration:{id:'laceration',name:'Blessing of Laceration',desc:'This weapon ignores all enemy armor.'},
 dismantling:{id:'dismantling',name:'Blessing of Dismantling',desc:'Remove 1 extra enemy armor after every hit.'}
};
export const CHARACTERS = {wanderer:{id:'wanderer',name:'The Wanderer',subtitle:'Iron & Ivory',desc:'Choose two rusty weapons. Survive with what precision earns.',playable:true}};
export const DIFFICULTIES = {
 pilgrim:{id:'pilgrim',name:'The Ashen Road',parent:null,desc:'The first descent. Master exact lethal to survive.',dangerous:false,hpBonus:0,attackBonus:0,healingMultiplier:1,armorBonus:0},
 iron:{id:'iron',name:'Iron Vow',parent:'pilgrim',desc:'Dangerous encounters join the road. Enemies have 25% more health.',dangerous:true,hpBonus:0.25,attackBonus:0,healingMultiplier:1,armorBonus:0},
 famine:{id:'famine',name:'Famine',parent:'pilgrim',desc:'Dangerous encounters join the road. All healing is halved.',dangerous:true,hpBonus:0,attackBonus:0,healingMultiplier:0.5,armorBonus:0},
 crown:{id:'crown',name:'The Broken Crown',parent:'iron',desc:'Dangerous encounters, Iron Vow, and +1 enemy attack and armor.',dangerous:true,hpBonus:0.25,attackBonus:1,healingMultiplier:1,armorBonus:1}
};
export const DAYS = CAMPAIGN_DAYS;
export const ENEMIES = {
 goblin:{name:'Ash goblin',art:'goblin',armor:0,attack:2,mechanic:'steal',traitText:'PILFER · Steals 1 gold when its attack deals damage.'},
 orc:{name:'Cinder orc',art:'brute',armor:0,attack:2,mechanic:'rage',traitText:'RAGE · Gains 1 attack at the end of every turn.'},
 assassin:{name:'Hollow assassin',art:'assassin',armor:0,attack:4,mechanic:'windup',traitText:'WINDUP · Prepares, then stabs. Each later stab deals 2 more damage.'},
 knight:{name:'Iron revenant',art:'knight',armor:1,attack:2,mechanic:'fortify',traitText:'FORTIFY · Gains 1 armor and 1 attack at the end of every turn.'},
 shaman:{name:'Cinder shaman',art:'shaman',armor:0,attack:1,mechanic:'rally',traitText:'RALLY · Every living foe gains 1 attack at the end of the turn.'},
 boss:{name:'The Bellwarden',art:'boss',armor:1,attack:4,mechanic:'rage',traitText:'TOLL · Gains 1 attack at the end of every turn.'},
 powderrunner:{name:'Powder runner',art:'goblin',armor:0,attack:0,mechanic:'powderrunner',chargeDamage:40,interruptHit:6},
 headsman:{name:'The Headsman',art:'brute',armor:0,attack:0,mechanic:'headsman',chargeDamage:45,interruptHits:3},
 hexsinger:{name:'Hex singer',art:'shaman',armor:0,attack:0,mechanic:'hexsinger',chargeDamage:30,interruptExact:2},
 redjaw:{name:'Redjaw',art:'brute',armor:0,attack:6,mechanic:'redjaw',berserkAttack:28},
 trapwright:{name:'Trapwright',art:'goblin',armor:0,attack:3,mechanic:'trapwright',trapDamage:12},
 shieldbearer:{name:'Shieldbearer',art:'knight',armor:3,attack:4,mechanic:'shieldbearer'},
 bonecook:{name:'Bone cook',art:'shaman',armor:0,attack:3,mechanic:'bonecook',healInterrupt:4},
 painkeeper:{name:'Painkeeper',art:'brute',armor:0,attack:0,mechanic:'painkeeper',reflectionMultiplier:4},
 weaponbreaker:{name:'Weapon breaker',art:'knight',armor:0,attack:5,mechanic:'weaponbreaker'},
 oathkeeper:{name:'Oathkeeper',art:'knight',armor:0,attack:4,mechanic:'oathkeeper',oathMultiplier:4},
 ...ACT_ENEMIES
};
const ENCOUNTERS = {
 1:[['goblin',4]],2:[['orc',6],['goblin',4]],4:[['knight',7,'laceration'],['goblin',6]],
 5:[['assassin',8],['orc',8]],6:[['shaman',8,'precision'],['knight',9]],
 8:[['orc',44],['shaman',40]],9:[['knight',48,'power'],['assassin',40]],
 10:[['boss',120,'dismantling'],['shaman',36]]
};
const LATE_ATTACK_BONUS={8:5,9:6,10:7};
const copy=value=>JSON.parse(JSON.stringify(value));
const has=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
const validSlot=slot=>Number.isInteger(slot)&&slot>=0&&slot<4;
const managed=s=>['camp','event','milestone'].includes(s.phase);
function seedNumber(seed){if(typeof seed==='number'&&Number.isFinite(seed))return seed>>>0;let n=2166136261;for(const ch of String(seed))n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;}
export function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function roll(s,min,max=min){return min===max?min:min+Math.floor(rng(s)*(max-min+1));}
function pick(s,array){return array[roll(s,0,array.length-1)];}
export function note(s,text,kind='normal'){s.log.push({text,kind});if(s.log.length>64)s.log.splice(0,s.log.length-64);}
function createItem(s,id,blessings=[]){return {uid:`item-${s.nextUid++}`,id,blessings:[...blessings],kills:0};}
function addItem(s,id,blessings=[]){const item=createItem(s,id,blessings);s.inventory.push(item);return item;}
function queueDrop(s,id,blessings,source,origin){const item=createItem(s,id,blessings);const drop={...item,type:'item',day:s.day,source,origin};s.pendingDrops.push(drop);return drop;}
function activeEquipment(s){return s.inventory.filter(item=>!WEAPONS[item.id].passive);}
function markDrop(s,drop,status,slot=null){const entry=s.dropHistory.find(item=>item.uid===drop.uid);if(entry){entry.status=status;entry.slot=slot;}if(s.lastLoot?.uid===drop.uid){s.lastLoot.status=status;s.lastLoot.slot=slot;}}
function placeDrop(s,drop,slot){
 const oldUid=s.slots[slot],old=s.inventory.find(item=>item.uid===oldUid);
 if(oldUid)s.inventory=s.inventory.filter(item=>item.uid!==oldUid);
 s.inventory.push({uid:drop.uid,id:drop.id,blessings:[...drop.blessings],kills:drop.kills||0});s.slots[slot]=drop.uid;
 markDrop(s,drop,'equipped',slot);note(s,`${WEAPONS[drop.id].name} equipped in slot ${slot+1}${old?`; ${WEAPONS[old.id].name} left behind`:''}.`,'gold');
}
function fillEmptySlots(s){
 if(!['camp','event','milestone','won'].includes(s.phase))return;
 while(s.pendingDrops.length&&s.slots.includes(null)){
  const slot=s.slots.indexOf(null),drop=s.pendingDrops[0];if(!canResolveDrop(s,slot))break;
  s.pendingDrops.shift();placeDrop(s,drop,slot);
 }
}
export function energyMax(){return 3;}
export function getWeapon(s,slotOrUid){
 const uid=typeof slotOrUid==='number'?s.slots[slotOrUid]:slotOrUid,item=s.inventory.find(x=>x.uid===uid);
 if(!item||!has(WEAPONS,item.id))return null;
 return effectiveWeapon(item);
}
export function effectiveWeapon(item){
 if(!item||!has(WEAPONS,item.id))return null;
 const w={...WEAPONS[item.id],...item,blessings:[...(item.blessings||[])]};
 if(!w.passive){
  if(w.blessings.includes('power')){w.damageMin++;w.damageMax++;}
  if(w.blessings.includes('precision'))w.damageMin=w.damageMax=Math.ceil((w.damageMin+w.damageMax)/2);
  if(w.blessings.includes('laceration'))w.pierce=true;
  if(w.blessings.includes('dismantling'))w.shred=(w.shred||0)+1;
 }
 w.armor||=0;w.hits=Number.isInteger(w.hits)&&w.hits>0?w.hits:1;w.damage=w.damageMin===w.damageMax?w.damageMin:`${w.damageMin}–${w.damageMax}`;w.desc=describeWeapon(w);return w;
}
function describeWeapon(w){
 if(w.passive){const category=armorCategory(w)==='body'?'Body armor':'Offhand shield';return `${category}: ${w.armor} armor. Only one ${category.toLowerCase()} can be equipped.`;}
 const hits=Number.isInteger(w.hits)&&w.hits>0?w.hits:1;
 return `${w.damageMin===w.damageMax?'Exactly '+w.damageMin:'Deals '+w.damageMin+'–'+w.damageMax} damage${hits>1?` × ${hits} hits`:''} for ${w.cost} energy.${w.pierce?' Pierces armor.':''}${w.shred?' Removes '+w.shred+' armor after each hit.':''}`;
}
export function armorCategory(value){const w=typeof value==='string'?WEAPONS[value]:value?.id?{...WEAPONS[value.id],...value}:value;return w?.defenseSlot||null;}
export function getArmor(s){const best={body:0,offhand:0};for(let slot=0;slot<4;slot++){const w=getWeapon(s,slot),category=armorCategory(w);if(category)best[category]=Math.max(best[category],w.armor||0);}return best.body+best.offhand;}
export function availableDifficulties(profile={}){const wins=Array.isArray(profile.wins)?profile.wins:[];return Object.values(DIFFICULTIES).filter(node=>node.parent===null||wins.includes(node.parent));}
export function recordWin(profile={},s){const result={...profile,wins:[...new Set(Array.isArray(profile.wins)?profile.wins:[])]};if(s?.phase==='won'&&has(DIFFICULTIES,s.difficulty)&&!result.wins.includes(s.difficulty))result.wins.push(s.difficulty);return result;}
export function newRun(seed=Date.now(),difficulty='pilgrim'){
 if(!has(DIFFICULTIES,difficulty))difficulty='pilgrim';const value=seedNumber(seed);
 const s={version:SAVE_VERSION,id:`${value}-${difficulty}`,initialSeed:value,seed:value,difficulty,character:'wanderer',phase:'draft',day:1,act:1,plannedDays:30,campaign:copy(campaignStateForDay(1)),hp:84,maxHp:84,gold:6,energy:3,maxEnergy:3,turn:1,nextUid:1,slots:[null,null,null,null],inventory:[],pendingDrops:[],startingChoices:[],enemies:[],loot:[],offers:[],event:null,dropHistory:[],lastLoot:null,jammedSlots:[],lastWeaponUsedSlot:null,exact:0,kills:0,overkills:0,roomExact:0,roomKills:0,damageTaken:0,log:[],history:[],lastAction:null};
 const pool=STARTING_POOL.filter(id=>id!=='rusty_dagger');for(let i=pool.length-1;i>0;i--){const j=roll(s,0,i);[pool[i],pool[j]]=[pool[j],pool[i]];}
 s.startingChoices=['rusty_dagger',...pool.slice(0,3)].map(id=>({id}));
 note(s,'Choose two rusty weapons. Your other two equipment slots start empty.');return s;
}
export function selectStartingItems(s,indices){
 if(s.phase!=='draft'||!Array.isArray(indices)||indices.length!==2||indices[0]===indices[1]||indices.some(i=>!Number.isInteger(i)||i<0||i>=s.startingChoices.length))return false;
 for(let slot=0;slot<2;slot++)s.slots[slot]=addItem(s,s.startingChoices[indices[slot]].id).uid;
 note(s,`${getWeapon(s,0).name} and ${getWeapon(s,1).name}. The road begins.`);startDay(s);return true;
}
function makeDrop(s,index,type,blessing){const id=selectEnemyLoot(type,s.day,s.initialSeed,index);return {type:'chance',itemChance:REWARD_ITEM_CHANCE,item:{id,blessings:blessing?[blessing]:[]},gold:s.day<=2?3:s.day<=6?5:s.day<=10?8:s.day<=20?12:18};}
function resolveExactReward(s,e){
 const offer=e.drop;
 if(offer.type==='chance')return rng(s)<offer.itemChance?{type:'item',...copy(offer.item)}:{type:'gold',value:offer.gold};
 return copy(offer);
}
function counterDescription(e){
 switch(e.mechanic){
  case 'powderrunner':return `BOMB · One hit of at least ${e.interruptHit} damage after armor interrupts the bomb this turn.`;
  case 'headsman':return `EXECUTION · Hit it ${e.interruptHits} times this turn to interrupt the execution.`;
  case 'hexsinger':return `EXACT HEX · Total damage reaching exactly ${e.interruptExact} this turn interrupts its armor-piercing curse. Overshooting misses.`;
  case 'redjaw':return `BLOOD FURY · Its base attack rises from ${e.attack} to ${e.berserkAttack} while below half health.`;
  case 'trapwright':return `TRAPPED WEAPON · Each use of the marked slot triggers ${e.trapDamage} damage before the strike. Armor applies. The marked slot changes each turn.`;
  case 'shieldbearer':return 'INTERCEPT · While it has armor, attacks aimed at a companion are redirected here.';
  case 'bonecook':return `BONE BROTH · Fully heals a companion. Deal ${e.healInterrupt} total damage this turn to interrupt it.`;
  case 'painkeeper':return `PAIN MIRROR · Its next attack equals ${e.reflectionMultiplier} times the largest hit it survives this turn.`;
  case 'weaponbreaker':return 'JAM · Its attack jams the last weapon used this player turn for the following player turn, even if armor blocks the attack.';
  case 'oathkeeper':return `BLOOD OATH · Gains ${e.oathMultiplier} attack per point of overkill dealt to a companion.`;
  default:return e.traitText||'';
 }
}
function rollIntent(s,e){
 const bonus=DIFFICULTIES[s.difficulty].attackBonus+(e.strength||0),m=e.mechanic;
 e.traitText=counterDescription(e);e.counterText='';
 if(e.interrupted&&['powderrunner','headsman','hexsinger','bonecook'].includes(m)){e.intent={type:'wait',value:0,label:'Interrupted · no action'};e.counterText='Charge broken for this turn';return;}
 let value=e.attack+bonus,label;
 if(m==='powderrunner'){value=e.chargeDamage+bonus;label=`Bomb ${value}`;e.counterText=`Largest hit ${e.largestHit||0} / ${e.interruptHit}`;}
 else if(m==='headsman'){value=e.chargeDamage+bonus;label=`Execution ${value}`;e.counterText=`Hits ${e.turnHits||0} / ${e.interruptHits}`;}
 else if(m==='hexsinger'){value=e.chargeDamage+bonus;label=`Piercing curse ${value}`;e.counterText=`Damage ${e.turnDamage||0} · need exactly ${e.interruptExact}${e.turnDamage>e.interruptExact?' · overshot':''}`;}
 else if(m==='redjaw'){const angry=e.hp<e.maxHp/2;value=(angry?e.berserkAttack:e.attack)+bonus;label=`${angry?'Enraged attack':'Attack'} ${value}`;e.counterText=angry?'Below half health · enraged':'Fury begins below half health';}
 else if(m==='trapwright'){label=`Attack ${value}${validSlot(e.trappedSlot)?` · ${'QWER'[e.trappedSlot]} trapped (${e.trapDamage})`:''}`;e.counterText=validSlot(e.trappedSlot)?`Every use of ${'QWER'[e.trappedSlot]} triggers the trap`:'No active slot to trap';}
 else if(m==='shieldbearer'){label=`Attack ${value}`;e.counterText=e.armor>0?`Intercepting · ${e.armor} armor`:'Armor broken · interception ended';}
 else if(m==='bonecook'){
  const ally=s.enemies.find(x=>!x.dead&&x.id!==e.id);
  e.counterText=`Damage ${e.turnDamage||0} / ${e.healInterrupt} to interrupt`;
  if(ally){e.intent={type:'heal',value:ally.maxHp-ally.hp,healTarget:ally.id,label:`Full heal ${ally.name} (+${ally.maxHp-ally.hp})`};return;}
  label=`Attack ${value} · no companion to heal`;
 }
 else if(m==='painkeeper'){value=(e.largestHit||0)*e.reflectionMultiplier+bonus;label=`Retaliate ${value}`;e.counterText=`Largest survived hit ${e.largestHit||0} × ${e.reflectionMultiplier}`;}
 else if(m==='weaponbreaker'){const slot=s.lastWeaponUsedSlot;label=`Attack ${value}${validSlot(slot)?` · jam ${'QWER'[slot]} next turn`:' · no weapon used yet'}`;e.intent={type:'attack',value,label,jamSlot:validSlot(slot)?slot:null};e.counterText=validSlot(slot)?`Last used: ${'QWER'[slot]}`:'Use a weapon to reveal its jam target';return;}
 else if(m==='oathkeeper'){label=`Attack ${value}`;e.counterText=`Overkill oath bonus +${e.oathBonus||0} attack`;}
 else if(m==='windup'&&s.turn%2===1){e.intent={type:'wait',value:0,label:'Windup · preparing a stab'};return;}
 else {value+=m==='windup'?Math.floor((s.turn-1)/2)*2:0;label=`${m==='windup'?'Stab':'Attack'} ${value}`;}
 e.intent={type:'attack',value,label,...(m==='hexsinger'?{pierce:true}:{})};
}
export function refreshIntents(s){for(const e of s.enemies)if(!e.dead)rollIntent(s,e);return s;}
export function mechanicState(s,e){return {mechanic:e.mechanic,turnHits:e.turnHits||0,turnDamage:e.turnDamage||0,largestHit:e.largestHit||0,interrupted:!!e.interrupted,trappedSlot:e.trappedSlot??null,jamSlot:e.intent?.jamSlot??null,redirecting:!e.dead&&e.mechanic==='shieldbearer'&&e.armor>0,label:e.counterText||'',counterText:e.counterText||'',intent:e.intent};}
export const enemyStatus=mechanicState;
function beginEnemyTurnCounters(s,e){
 e.turnHits=0;e.turnDamage=0;e.largestHit=0;e.interrupted=false;
 if(e.mechanic==='trapwright'){const slots=s.slots.map((_,slot)=>slot).filter(slot=>{const w=getWeapon(s,slot);return w&&!w.passive;});e.trappedSlot=slots.length?pick(s,slots):null;}else e.trappedSlot=null;
}
export function createEncounter(s,tuples){
 const keys=['attack','armor','chargeDamage','interruptHit','interruptHits','interruptExact','berserkAttack','trapDamage','healInterrupt','reflectionMultiplier','oathMultiplier'];
 if(!Array.isArray(tuples)||!tuples.length||tuples.length>2||tuples.some(t=>!Array.isArray(t)||!has(ENEMIES,t[0])||!Number.isInteger(t[1])||t[1]<=0||(t[2]!=null&&!has(BLESSINGS,t[2]))))return false;
 const prepared=[];
 for(const t of tuples){const override={...(typeof t[3]==='number'?{attack:t[3]}:t[3]||{}),...(t[4]||{})};if(Object.entries(override).some(([key,value])=>!keys.includes(key)||!Number.isInteger(value)||value<0))return false;prepared.push(override);}
 s.phase='combat';s.turn=1;s.energy=3;s.roomExact=0;s.roomKills=0;s.lastAction=null;s.lastLoot=null;s.event=null;s.loot=[];s.offers=[];s.jammedSlots=[];s.lastWeaponUsedSlot=null;
 const difficulty=DIFFICULTIES[s.difficulty];
 s.enemies=tuples.map(([type,health,blessing],index)=>{const base={...copy(ENEMIES[type]),...prepared[index]},hp=Math.ceil(health*(1+difficulty.hpBonus)),drop=makeDrop(s,index,type,blessing);
  return {...base,id:index,type,hp,maxHp:hp,armor:base.armor+difficulty.armorBonus,strength:0,oathBonus:0,dead:false,finish:null,trait:null,dangerous:DANGEROUS_TYPES.includes(type),blessing:blessing||null,drop,resolvedDrop:null,bounty:`Exact lethal: 20% ${WEAPONS[drop.item.id].name}${blessing?' with '+BLESSINGS[blessing].name:''}; 80% ${drop.gold} gold. Rolled only on exact lethal. Overkill gives nothing.`,intent:null};});
 for(const e of s.enemies)beginEnemyTurnCounters(s,e);refreshIntents(s);return true;
}
export function intent(s,e){return e.intent;}
function startDay(s){
 s.loot=[];s.offers=[];s.event=null;s.lastAction=null;s.lastLoot=null;s.roomExact=0;s.roomKills=0;s.turn=1;s.energy=3;
 const definition=dayDefinition(s.day);if(!definition)throw new RangeError(`Day ${s.day} is outside the campaign.`);
 s.act=definition.act;s.campaign=copy(campaignStateForDay(s.day,{completedMilestones:s.campaign?.completedMilestones||[],finalComplete:false}));
 if(definition.type==='event'){s.phase='event';s.enemies=[];s.event=makeEvent(s);note(s,`Day ${s.day} · ${definition.name}.`);return;}
 const road=DIFFICULTIES[s.difficulty];
 const generated=generateEncounter(s.day,{dangerous:road.dangerous,hpBonus:road.hpBonus,armorBonus:road.armorBonus,attackBonus:road.attackBonus},s.initialSeed);
 const blessingByDay={4:'laceration',6:'precision',9:'power',10:'dismantling'};
 const tuples=generated.tuples.map((tuple,index)=>{const t=[...tuple];if(index===0&&t[2]==null)t[2]=blessingByDay[s.day]||null;return t;});
 createEncounter(s,tuples);s.encounterInfo={day:s.day,seed:generated.seed,profileId:generated.profileId||definition.encounterProfileId,variantId:generated.variantId||null,threatBudget:generated.threatBudget,actualThreat:generated.actualThreat,dangerous:generated.dangerous};
 note(s,`Day ${s.day} · ${DAYS[s.day-1].name}. Each exact kill grants one reward: 20% equipment, 80% gold.`);
}
export function canUse(s,slot){const w=validSlot(slot)?getWeapon(s,slot):null;return s.phase==='combat'&&!!w&&!w.passive&&s.energy>=w.cost&&!(s.jammedSlots||[]).includes(slot);}
export function redirectedTarget(s,targetIndex){const target=s.enemies[targetIndex];if(!target||target.dead)return targetIndex;const shield=s.enemies.find(e=>!e.dead&&e.id!==targetIndex&&e.mechanic==='shieldbearer'&&e.armor>0);return shield?shield.id:targetIndex;}
export function damage(w,e,raw=w.damageMin){return Math.max(0,raw-(w.pierce?0:e.armor));}
function trapPreview(s,slot){
 const traps=s.enemies.filter(enemy=>!enemy.dead&&enemy.mechanic==='trapwright'&&enemy.trappedSlot===slot),armor=getArmor(s);
 return {trapAttack:traps.reduce((sum,enemy)=>sum+enemy.trapDamage,0),trapDamage:traps.reduce((sum,enemy)=>sum+Math.max(0,enemy.trapDamage-armor),0)};
}
function previewHits(w,e){
 const plannedHits=w.hits||1,rawCount=w.damageMax-w.damageMin+1,terminal=new Map();let active=new Map([[`${e.hp}|${e.armor}|0|0`,{hp:e.hp,armor:e.armor,total:0,hits:0,probability:1}]]),hitSteps=[];
 const merge=(map,key,value,probability)=>{const prior=map.get(key);if(prior)prior.probability+=probability;else map.set(key,{...value,probability});};
 for(let hitIndex=1;hitIndex<=plannedHits&&active.size;hitIndex++){
  const next=new Map(),summary={hitIndex,executionChance:0,rawMin:w.damageMin,rawMax:w.damageMax,damageMin:Infinity,damageMax:-Infinity,armorBeforeMin:Infinity,armorBeforeMax:-Infinity,armorAfterMin:Infinity,armorAfterMax:-Infinity,armorShredMin:Infinity,armorShredMax:-Infinity};
  for(const state of active.values()){
   summary.executionChance+=state.probability;
   for(let raw=w.damageMin;raw<=w.damageMax;raw++){
    const probability=state.probability/rawCount,blocked=w.pierce?0:Math.min(raw,state.armor),dealt=raw-blocked,armorAfter=Math.max(0,state.armor-(w.shred||0)),hpAfter=Math.max(0,state.hp-dealt),total=state.total+dealt,hits=state.hits+1,shredded=state.armor-armorAfter;
    summary.damageMin=Math.min(summary.damageMin,dealt);summary.damageMax=Math.max(summary.damageMax,dealt);summary.armorBeforeMin=Math.min(summary.armorBeforeMin,state.armor);summary.armorBeforeMax=Math.max(summary.armorBeforeMax,state.armor);summary.armorAfterMin=Math.min(summary.armorAfterMin,armorAfter);summary.armorAfterMax=Math.max(summary.armorAfterMax,armorAfter);summary.armorShredMin=Math.min(summary.armorShredMin,shredded);summary.armorShredMax=Math.max(summary.armorShredMax,shredded);
    if(hpAfter===0){const finish=dealt===state.hp?'exact':'overkill';merge(terminal,`${finish}|${hpAfter}|${armorAfter}|${total}|${hits}`,{finish,hp:hpAfter,armor:armorAfter,total,hits},probability);}
    else merge(next,`${hpAfter}|${armorAfter}|${total}|${hits}`,{hp:hpAfter,armor:armorAfter,total,hits},probability);
   }
  }
  hitSteps.push(summary);active=next;
 }
 for(const state of active.values())merge(terminal,`nonlethal|${state.hp}|${state.armor}|${state.total}|${state.hits}`,{...state,finish:'nonlethal'},state.probability);
 const outcomes=[...terminal.values()];let exactChance=0,overkillChance=0,expectedDamage=0,expectedHits=0,min=Infinity,max=-Infinity,afterMin=Infinity,afterMax=-Infinity,minActualHits=Infinity,maxActualHits=-Infinity;
 for(const outcome of outcomes){exactChance+=outcome.finish==='exact'?outcome.probability:0;overkillChance+=outcome.finish==='overkill'?outcome.probability:0;expectedDamage+=outcome.total*outcome.probability;expectedHits+=outcome.hits*outcome.probability;min=Math.min(min,outcome.total);max=Math.max(max,outcome.total);afterMin=Math.min(afterMin,outcome.hp);afterMax=Math.max(afterMax,outcome.hp);minActualHits=Math.min(minActualHits,outcome.hits);maxActualHits=Math.max(maxActualHits,outcome.hits);}
 return {min,max,afterMin,afterMax,exactChance,overkillChance,expectedDamage,expectedHits,minActualHits,maxActualHits,plannedHits,hitSteps};
}
export function preview(s,slot,targetIndex){
 const w=validSlot(slot)?getWeapon(s,slot):null,requested=s.enemies[targetIndex];if(!w||w.passive||!requested||requested.dead)return null;
 const actual=redirectedTarget(s,targetIndex),e=s.enemies[actual],trap=trapPreview(s,slot),cancelledByTrap=trap.trapDamage>=s.hp;
 const result=cancelledByTrap?{min:0,max:0,afterMin:e.hp,afterMax:e.hp,exactChance:0,overkillChance:0,expectedDamage:0,expectedHits:0,minActualHits:0,maxActualHits:0,plannedHits:w.hits||1,hitSteps:[]}:previewHits(w,e);
 return {...result,damageMin:result.min,damageMax:result.max,damage:result.min===result.max?result.min:`${result.min}–${result.max}`,exact:result.exactChance>=1-1e-12,overkill:result.overkillChance>=1-1e-12,cost:w.cost,affordable:canUse(s,slot),requestedTarget:targetIndex,target:actual,redirected:actual!==targetIndex,redirectedBy:actual!==targetIndex?actual:null,...trap,cancelledByTrap,jammed:(s.jammedSlots||[]).includes(slot)};
}
function finishEnemy(s,e,w,dealt,before){
 const exact=dealt===before;e.dead=true;e.finish=exact?'exact':'overkill';s.kills++;s.roomKills++;s.inventory.find(item=>item.uid===w.uid).kills++;
 if(exact){
  s.exact++;s.roomExact++;const reward=resolveExactReward(s,e);e.resolvedDrop=reward;s.lastAction.reward=copy(reward);
  if(reward.type==='gold'){
   s.gold+=reward.value;const entry={type:'gold',day:s.day,source:e.name,value:reward.value,status:'claimed'};s.dropHistory.push(entry);s.lastLoot=entry;
   note(s,`EXACT LETHAL · ${e.name}. +${reward.value} gold.`,'exact');
  }else{
   const item=queueDrop(s,reward.id,reward.blessings,e.name,'enemy');
   const entry={type:'item',day:s.day,source:e.name,id:item.id,uid:item.uid,blessings:[...item.blessings],status:'pending',slot:null};s.dropHistory.push(entry);s.lastLoot=entry;
   note(s,`EXACT LETHAL · ${e.name}. ${WEAPONS[item.id].name} preserved on the ground${item.blessings.length?' · '+item.blessings.map(id=>BLESSINGS[id].name).join(', '):''}. Claim it after the fight.`,'exact');
  }
 }else{
  s.overkills++;const excess=dealt-before;note(s,`OVERKILL +${excess} · ${e.name}. No reward.`,'muted');
  for(const keeper of s.enemies)if(!keeper.dead&&keeper.id!==e.id&&keeper.mechanic==='oathkeeper'){const gained=excess*keeper.oathMultiplier;keeper.strength+=gained;keeper.oathBonus=(keeper.oathBonus||0)+gained;note(s,`${keeper.name} gains ${gained} attack from ${excess} overkill.`,'hurt');}
 }
}
function victory(s){
 s.history.push({day:s.day,exact:s.roomExact,kills:s.roomKills,hp:s.hp});note(s,`Day ${s.day} cleared. ${s.roomExact}/${s.roomKills} exact-lethal rewards earned.`,'exact');
 s.jammedSlots=[];s.lastWeaponUsedSlot=null;
 if(isActMilestone(s.day)){
  const definition=dayDefinition(s.day),completed=[...new Set([...(s.campaign?.completedMilestones||[]),definition.act])].sort((a,b)=>a-b);
  s.phase='milestone';s.campaign=copy(campaignStateForDay(s.day,{completedMilestones:completed,finalComplete:false,
   transition:{fromAct:definition.act,toAct:definition.act+1,nextDay:s.day+1,recoveryPolicy:RECOVERY_POLICIES.FULL,recoveryApplied:false}}));
  note(s,`ACT ${definition.act} COMPLETE · Continue to the next act with full HP.`,'exact');
 }else if(isFinalDay(s.day)){
  s.phase='won';s.campaign=copy(campaignStateForDay(s.day,{completedMilestones:[1,2],finalComplete:true}));
  note(s,'CAMPAIGN COMPLETE · The heart below is silent.','exact');
 }else s.phase='camp';
 fillEmptySlots(s);
}
export function attack(s,slot,targetIndex){
 if(!canUse(s,slot)||!Number.isInteger(targetIndex))return false;const requested=s.enemies[targetIndex];if(!requested||requested.dead)return false;
 const actual=redirectedTarget(s,targetIndex),e=s.enemies[actual],w=getWeapon(s,slot),before=e.hp,plannedHits=w.hits||1;
 s.energy-=w.cost;s.lastWeaponUsedSlot=slot;
 s.lastAction={type:'attack',slot,target:actual,requestedTarget:targetIndex,redirected:actual!==targetIndex,raw:0,damage:0,before,after:before,exact:false,overkill:0,plannedHits,actualHits:0,hitSteps:[],trapDamage:0,trapSteps:[],cancelled:false,cancelledByTrap:false};
 for(const trap of s.enemies){
  if(trap.dead||trap.mechanic!=='trapwright'||trap.trappedSlot!==slot)continue;
  const blocked=Math.min(trap.trapDamage,getArmor(s)),hit=trap.trapDamage-blocked,hpBefore=s.hp;s.hp=Math.max(0,s.hp-hit);s.damageTaken+=hit;s.lastAction.trapDamage+=hit;
  s.lastAction.trapSteps.push({target:trap.id,name:trap.name,type:'trap',attack:trap.trapDamage,blocked,damage:hit,hpBefore,hpAfter:s.hp,goldAfter:s.gold});
  note(s,`${trap.name}’s trap: ${hit} damage${blocked?` (${blocked} blocked)`:''}.`,'hurt');
  if(s.hp<=0){s.phase='lost';s.lastAction.cancelled=true;s.lastAction.cancelledByTrap=true;note(s,'The trap takes you before the strike lands.','hurt');return true;}
 }
 if(actual!==targetIndex)note(s,`${e.name} intercepts the attack aimed at ${requested.name}.`,'muted');
 for(let hitIndex=1;hitIndex<=plannedHits&&!e.dead;hitIndex++){
  const hpBefore=e.hp,armorBefore=e.armor,raw=roll(s,w.damageMin,w.damageMax),blocked=w.pierce?0:Math.min(raw,armorBefore),dealt=raw-blocked;
  e.hp=Math.max(0,hpBefore-dealt);if(w.shred)e.armor=Math.max(0,e.armor-w.shred);
  const step={target:actual,name:e.name,hitIndex,raw,dealt,damage:dealt,blocked,hpBefore,hpAfter:e.hp,armorBefore,armorAfter:e.armor,armorShredded:armorBefore-e.armor,exact:e.hp===0&&dealt===hpBefore,overkill:e.hp===0?Math.max(0,dealt-hpBefore):0};
  s.lastAction.hitSteps.push(step);s.lastAction.actualHits++;s.lastAction.raw+=raw;s.lastAction.damage+=dealt;s.lastAction.after=e.hp;
  e.turnHits=(e.turnHits||0)+1;e.turnDamage=(e.turnDamage||0)+dealt;if(e.mechanic!=='painkeeper'||e.hp>0)e.largestHit=Math.max(e.largestHit||0,dealt);
  const wasInterrupted=e.interrupted;
  if((e.mechanic==='powderrunner'&&dealt>=e.interruptHit)||(e.mechanic==='headsman'&&e.turnHits>=e.interruptHits)||(e.mechanic==='hexsinger'&&e.turnDamage===e.interruptExact)||(e.mechanic==='bonecook'&&e.turnDamage>=e.healInterrupt))e.interrupted=true;
  if(!wasInterrupted&&e.interrupted&&e.hp>0)note(s,`${e.name} interrupted for this turn.`,'exact');
  note(s,`${w.name}${plannedHits>1?` ${hitIndex}/${plannedHits}`:''} → ${e.name}: ${dealt} damage${raw!==dealt?` (${raw} before armor)`:''}${step.armorShredded?`; armor reduced by ${step.armorShredded}`:''}.`);
  if(e.hp===0){s.lastAction.exact=step.exact;s.lastAction.overkill=step.overkill;finishEnemy(s,e,w,dealt,hpBefore);break;}
 }
 refreshIntents(s);if(s.enemies.every(enemy=>enemy.dead))victory(s);return true;
}
export const strike=attack;
function heal(s,amount){const actual=Math.min(s.maxHp-s.hp,Math.floor(amount*DIFFICULTIES[s.difficulty].healingMultiplier));s.hp+=actual;note(s,`Restored ${actual} health.`,'heal');}
export function endTurn(s){
 if(s.phase!=='combat')return false;
 const report={type:'endTurn',turnBefore:s.turn,turnAfter:s.turn,hpBefore:s.hp,hpAfter:s.hp,goldBefore:s.gold,goldAfter:s.gold,steps:[],growth:[],endedRun:false};s.lastAction=report;
 const plans=s.enemies.map(e=>copy(e.intent)),nextJams=[];
 for(const e of s.enemies){
  if(e.dead)continue;const a=plans[e.id];
  const step={target:e.id,enemyId:e.id,name:e.name,type:a.type,label:a.label,value:a.value,attack:a.type==='attack'?a.value:0,blocked:0,damage:0,hpBefore:s.hp,hpAfter:s.hp,goldBefore:s.gold,goldAfter:s.gold,stolen:0};
  if(a.type==='attack'){
   const blocked=a.pierce?0:Math.min(a.value,getArmor(s)),hit=a.value-blocked;s.hp=Math.max(0,s.hp-hit);s.damageTaken+=hit;note(s,`${e.name}: ${a.value} ${a.pierce?'piercing ':''}attack${blocked?` − ${blocked} armor`:''} = ${hit} damage.`,hit?'hurt':'muted');
   step.blocked=blocked;step.damage=hit;step.pierce=!!a.pierce;
   if(e.mechanic==='steal'&&hit>0){const stolen=Math.min(1,s.gold);s.gold-=stolen;step.stolen=stolen;if(stolen)note(s,`${e.name} steals 1 gold.`,'gold');}
   if(e.mechanic==='weaponbreaker'&&validSlot(a.jamSlot)){if(!nextJams.includes(a.jamSlot))nextJams.push(a.jamSlot);step.jamSlot=a.jamSlot;note(s,`${'QWER'[a.jamSlot]} will be jammed next turn.`,'hurt');}
  }else if(a.type==='heal'){
   const ally=s.enemies[a.healTarget];step.healTarget=a.healTarget;step.healed=0;
   if(ally&&!ally.dead){step.enemyHpBefore=ally.hp;step.healed=ally.maxHp-ally.hp;ally.hp=ally.maxHp;step.enemyHpAfter=ally.hp;note(s,`${e.name} restores ${ally.name} to full health (+${step.healed}).`,'heal');}
  }else note(s,e.interrupted?`${e.name}’s action was interrupted.`:`${e.name} waits and prepares.`,'muted');
  step.hpAfter=s.hp;step.goldAfter=s.gold;report.steps.push(step);report.hpAfter=s.hp;report.goldAfter=s.gold;
  if(s.hp<=0){s.phase='lost';report.endedRun=true;note(s,`THE ROAD ENDS · Day ${s.day}.`,'hurt');return true;}
 }
 // All growth affects the NEXT displayed plan; current plans never change during execution.
 for(const e of s.enemies){
  if(e.dead)continue;
  if(e.mechanic==='rage'){e.strength++;report.growth.push({target:e.id,type:'rage',armor:0,attack:1});note(s,`${e.name} gains 1 attack.`,'muted');}
  else if(e.mechanic==='fortify'){e.armor++;e.strength++;report.growth.push({target:e.id,type:'fortify',armor:1,attack:1});note(s,`${e.name} gains 1 armor and 1 attack.`,'muted');}
  else if(e.mechanic==='rally'){for(const ally of s.enemies)if(!ally.dead){ally.strength++;report.growth.push({target:ally.id,source:e.id,type:'rally',armor:0,attack:1});}note(s,`${e.name} grants every living foe 1 attack.`,'muted');}
 }
 s.turn++;s.energy=3;s.jammedSlots=nextJams;s.lastWeaponUsedSlot=null;report.turnAfter=s.turn;report.jammedSlots=[...nextJams];
 for(const e of s.enemies)if(!e.dead)beginEnemyTurnCounters(s,e);refreshIntents(s);note(s,`Turn ${s.turn} · 3 energy restored.`);return true;
}
// Compatibility exports: rewards are now automatic, so no reward-choice phase exists.
export function claimLoot(){return false;}
export const claim=claimLoot;
export function skipLoot(){return false;}
export function equip(s,uid,slot){if(!managed(s)||!validSlot(slot))return false;const oldSlot=s.slots.indexOf(uid);if(oldSlot<0)return false;[s.slots[oldSlot],s.slots[slot]]=[s.slots[slot],s.slots[oldSlot]];return true;}
export function unequip(){return false;}
export function sell(){return false;}
export function canResolveDrop(s,slot){
 if(!['camp','event','milestone','won'].includes(s.phase)||!s.pendingDrops.length||(slot!==null&&!validSlot(slot)))return false;
 const drop=s.pendingDrops[0];
 if(slot===null){
  if(!WEAPONS[drop.id].passive&&!activeEquipment(s).length&&!s.pendingDrops.slice(1).some(item=>!WEAPONS[item.id].passive))return false;
 }else{
  const category=armorCategory(drop),sameSlot=category?s.slots.findIndex((_,i)=>armorCategory(getWeapon(s,i))===category):-1;
  if(sameSlot>=0&&sameSlot!==slot)return false;
  const old=getWeapon(s,slot);if(WEAPONS[drop.id].passive&&old&&!old.passive&&activeEquipment(s).length===1)return false;
 }
 return true;
}
export function resolveDrop(s,slot){
 if(!canResolveDrop(s,slot))return false;const drop=s.pendingDrops[0];
 if(slot===null){s.pendingDrops.shift();markDrop(s,drop,'left');note(s,`${WEAPONS[drop.id].name} left behind.`,'muted');}
 else{
  s.pendingDrops.shift();placeDrop(s,drop,slot);
 }
 return true;
}
function hasActiveWeapon(s){return s.slots.some((_,slot)=>{const w=getWeapon(s,slot);return w&&!w.passive;});}
export function nextDay(s){if(s.phase!=='camp'||s.day>=30||isActMilestone(s.day)||s.pendingDrops.length||!hasActiveWeapon(s))return false;s.day++;startDay(s);return true;}
export function continueAct(s){
 if(s.phase!=='milestone'||s.pendingDrops.length||!hasActiveWeapon(s))return false;
 const campaignValidation=validateCampaignState(s.campaign),definition=dayDefinition(s.day),transition=s.campaign?.transition;
 if(!campaignValidation.valid||!definition||s.campaign.day!==s.day||s.campaign.act!==s.act||!isActMilestone(s.day)||
  !transition||transition.fromAct!==s.act||transition.toAct!==s.act+1||transition.nextDay!==s.day+1||
  ![RECOVERY_POLICIES.UNRESOLVED,RECOVERY_POLICIES.FULL].includes(transition.recoveryPolicy)||transition.recoveryApplied)return false;
 const hpBefore=s.hp,recoveryAmount=s.maxHp-s.hp;s.hp=s.maxHp;
 s.history.push({day:s.day,actTransition:transition.fromAct,recoveryPolicy:RECOVERY_POLICIES.FULL,recoveryAmount,recoveryApplied:true,hpBefore,hpAfter:s.hp});
 s.day=transition.nextDay;startDay(s);return true;
}
function makeEvent(s){
 if(ACT_EVENTS[s.day])return {...copy(ACT_EVENTS[s.day]),purchased:[]};
 const equipment=(id,cost,label)=>({id,item:id,label:label||WEAPONS[id].name,desc:describeWeapon(WEAPONS[id])+' Choose a slot if needed.',cost});
 const prices={sword:4,buckler:4,axe:4,falchion:10,plate:6,fang:4},price=id=>prices[id]||Math.max(4,(WEAPONS[id].sell||2)*2);
 const stock=selectShopStock(s.day,s.initialSeed,2),offers=stock.map(id=>equipment(id,price(id),s.day===3&&id==='sword'?'Buy an Iron sword':s.day===3&&id==='buckler'?'Buy an Ash buckler':s.day===3&&id==='axe'?'Buy a Cinder axe':undefined));
 if(s.day===3)return {id:'wayside',title:'The Last Wayside',desc:'A coal stove still burns in the ruined chapel. Rest or buy one piece of equipment.',options:[
  {id:'rest',label:'Rest by the coals',desc:'Restore 8 health.',heal:8,endsEvent:true},...offers.map(option=>({...option,endsEvent:true}))],purchased:[]};
 return {id:'merchant',title:'The Lantern Merchant',desc:'Buy supplies, choose what to carry, then return to the road.',options:[
  ...offers.map(option=>({...option,endsEvent:false,purchasedOnce:true})),
  {id:'heal',label:'A warm meal',desc:'Restore 10 health.',cost:5,heal:10,endsEvent:false,purchasedOnce:true},
  {id:'leave',label:'Continue on the road',desc:'Leave the lantern behind.',endsEvent:true}],purchased:[]};
}
export function chooseEvent(s,index){
 if(s.phase!=='event'||!Number.isInteger(index)||s.pendingDrops.length)return false;const event=s.event,option=event?.options[index];if(!option||option.disabled||s.gold<(option.cost||0))return false;
 if(option.purchasedOnce&&event.purchased.includes(option.id))return false;s.gold-=option.cost||0;if(option.heal)heal(s,option.heal);if(option.item){queueDrop(s,option.item,[],event.title,'event');note(s,`${WEAPONS[option.item].name} purchased. Choose what to carry.`,'gold');}
 if(option.purchasedOnce){event.purchased.push(option.id);option.disabled=true;}
 if(option.endsEvent){s.phase='camp';s.history.push({day:s.day,event:event.id,choice:option.id,hp:s.hp});}fillEmptySlots(s);return true;
}
export function restoreRun(serialized){
 try{
  const s=typeof serialized==='string'?JSON.parse(serialized):copy(serialized);
  if(!s||![3,4,5,6,7,8].includes(s.version)||!has(DIFFICULTIES,s.difficulty)||s.character!=='wanderer'||!['draft','combat','camp','event','milestone','won','lost'].includes(s.phase))return null;
  const oldVersion=s.version;
  if(!Number.isInteger(s.day)||s.day<1||s.day>(oldVersion<8?10:30)||!Number.isInteger(s.seed)||s.seed<0||s.seed>4294967295||!Number.isInteger(s.turn)||s.turn<1||!Number.isInteger(s.nextUid)||s.nextUid<1)return null;
  if(!Number.isInteger(s.initialSeed)||s.initialSeed<0||s.initialSeed>4294967295){
   if(oldVersion>=7||s.initialSeed!=null)return null;
   const match=typeof s.id==='string'?s.id.match(/^(\d+)-/):null,recovered=match?Number(match[1]):NaN;
   s.initialSeed=Number.isInteger(recovered)&&recovered>=0&&recovered<=4294967295?recovered:s.seed;
  }
  if(['exact','kills','overkills','roomExact','roomKills','damageTaken'].some(key=>!Number.isInteger(s[key])||s[key]<0))return null;
  if(!Number.isFinite(s.hp)||!Number.isFinite(s.maxHp)||s.hp<0||s.hp>s.maxHp||s.maxHp<=0||!Number.isFinite(s.gold)||s.gold<0||s.maxEnergy!==3||!Number.isInteger(s.energy)||s.energy<0||s.energy>3)return null;
  if(!Array.isArray(s.slots)||s.slots.length!==4||!Array.isArray(s.inventory)||!Array.isArray(s.startingChoices)||s.startingChoices.length!==4||new Set(s.startingChoices.map(x=>x.id)).size!==4||s.startingChoices.some(x=>!STARTING_POOL.includes(x.id)))return null;
  const validBlessings=values=>Array.isArray(values)&&values.every(id=>has(BLESSINGS,id))&&new Set(values).size===values.length;
  const validDrop=drop=>drop&&has(WEAPONS,drop.id)&&validBlessings(drop.blessings);
  const validReward=drop=>drop&&(drop.type==='item'?validDrop(drop):drop.type==='gold'?Number.isInteger(drop.value)&&drop.value>=0:drop.type==='chance'&&Number.isFinite(drop.itemChance)&&drop.itemChance>=0&&drop.itemChance<=1&&validDrop(drop.item)&&Number.isInteger(drop.gold)&&drop.gold>=0);
  const uids=new Set();for(const item of s.inventory){if(!validDrop(item)||typeof item.uid!=='string'||uids.has(item.uid)||!Number.isInteger(item.kills)||item.kills<0)return null;uids.add(item.uid);}
  const equipped=s.slots.filter(uid=>uid!==null);if(equipped.some(uid=>!uids.has(uid))||new Set(equipped).size!==equipped.length)return null;
  if(!Array.isArray(s.enemies)||!Array.isArray(s.log)||!Array.isArray(s.history)||!Array.isArray(s.dropHistory))return null;
  if(oldVersion<7){s.jammedSlots??=[];s.lastWeaponUsedSlot??=null;for(const e of s.enemies)if(e){e.turnHits??=0;e.turnDamage??=0;e.largestHit??=0;e.interrupted??=false;e.trappedSlot??=null;e.oathBonus??=0;e.counterText??='';e.dangerous=DANGEROUS_TYPES.includes(e.type);}}
  if(!Array.isArray(s.jammedSlots)||s.jammedSlots.some(slot=>!validSlot(slot))||new Set(s.jammedSlots).size!==s.jammedSlots.length||(s.lastWeaponUsedSlot!==null&&!validSlot(s.lastWeaponUsedSlot)))return null;
  if(oldVersion<6)for(const e of s.enemies)if(e&&validDrop(e.drop)&&!e.drop.type){e.drop={type:'item',...e.drop};if(e.finish==='exact')e.resolvedDrop=copy(e.drop);}
  if(s.enemies.some(e=>!e||!has(ENEMIES,e.type)||!Number.isFinite(e.hp)||!Number.isFinite(e.maxHp)||e.hp<0||e.hp>e.maxHp||!Number.isInteger(e.armor)||e.armor<0||!Number.isInteger(e.strength)||e.strength<0||['turnHits','turnDamage','largestHit','oathBonus'].some(key=>!Number.isInteger(e[key])||e[key]<0)||typeof e.interrupted!=='boolean'||(e.trappedSlot!==null&&!validSlot(e.trappedSlot))||!e.intent||!['attack','wait','heal'].includes(e.intent.type)||!Number.isInteger(e.intent.value)||e.intent.value<0||!validReward(e.drop)||(e.resolvedDrop&&!validReward(e.resolvedDrop))))return null;
  if(s.phase==='draft'&&(s.inventory.length!==0||equipped.length!==0||s.day!==1||s.enemies.length!==0))return null;
  if(oldVersion<8&&s.phase==='event'&&!Array.isArray(s.event?.purchased))s.event.purchased=[];
  const eventDefinition=s.phase==='event'?makeEvent(s):null;
  if(s.phase==='event'&&(!s.event||!Array.isArray(s.event.options)||s.event.id!==eventDefinition?.id||s.event.options.some(o=>!o||(o.item&&!has(WEAPONS,o.item))||(o.cost!==undefined&&(!Number.isInteger(o.cost)||o.cost<0)))||!Array.isArray(s.event.purchased)))return null;
  if(s.version===3){
   s.pendingDrops=s.inventory.filter(item=>!equipped.includes(item.uid)).map(item=>({...item,day:s.day,source:'Previous equipment',origin:'migration'}));
   s.inventory=s.inventory.filter(item=>equipped.includes(item.uid));
  }
  if(!Array.isArray(s.pendingDrops)||s.inventory.length!==equipped.length||s.inventory.length>4)return null;
  if(oldVersion<5){
   for(const category of ['body','offhand']){
    const slots=s.slots.map((uid,slot)=>({uid,slot,w:getWeapon(s,slot)})).filter(x=>armorCategory(x.w)===category).sort((a,b)=>b.w.armor-a.w.armor||a.slot-b.slot);
    for(const extra of slots.slice(1)){const item=s.inventory.find(x=>x.uid===extra.uid);s.inventory=s.inventory.filter(x=>x.uid!==extra.uid);s.slots[extra.slot]=null;s.pendingDrops.push({...item,day:s.day,source:'Previous duplicate defense',origin:'migration'});}
   }
  }
  const defenseCategories=s.inventory.map(armorCategory).filter(Boolean);if(new Set(defenseCategories).size!==defenseCategories.length)return null;
  const liveUids=new Set(s.slots.filter(Boolean));
  for(const item of s.pendingDrops){if(!validDrop(item)||typeof item.uid!=='string'||liveUids.has(item.uid)||!Number.isInteger(item.kills)||item.kills<0)return null;liveUids.add(item.uid);}
  if(s.phase==='draft'&&s.pendingDrops.length)return null;
  if(s.phase==='draft'){s.hp=84;s.maxHp=84;if(!s.startingChoices.some(item=>item.id==='rusty_dagger'))s.startingChoices[s.startingChoices.length-1]={id:'rusty_dagger'};}
  if(oldVersion<6){s.version=6;s.migratedFrom=oldVersion;for(const item of s.pendingDrops)item.type='item';for(const entry of s.dropHistory)if(entry.id&&!entry.type)entry.type='item';if(s.lastLoot?.id&&!s.lastLoot.type)s.lastLoot.type='item';}
  if(oldVersion<7){s.version=7;s.migratedFrom=oldVersion;}
  if(oldVersion<8){
   const completed=s.day===10&&s.phase==='won'?[1]:[];
   s.version=SAVE_VERSION;s.migratedFrom=oldVersion;s.plannedDays=30;s.act=1;
   if(s.day===10&&s.phase==='won'){
    s.phase='milestone';s.campaign=copy(campaignStateForDay(10,{completedMilestones:completed,
     transition:{fromAct:1,toAct:2,nextDay:11,recoveryPolicy:RECOVERY_POLICIES.UNRESOLVED,recoveryApplied:false}}));
   }else s.campaign=copy(campaignStateForDay(s.day));
  }
  const campaignValidation=validateCampaignState(s.campaign);
  const definition=dayDefinition(s.day);
  if(!campaignValidation.valid||!definition||s.campaign.day!==s.day||s.act!==definition.act)return null;
  // Boss days cannot end in ordinary camp: advancement requires their terminal phase.
  if((isActMilestone(s.day)||isFinalDay(s.day))&&!['combat','lost','milestone','won'].includes(s.phase))return null;
  const expectedMilestones=Array.from({length:Math.max(0,s.act-1)},(_,index)=>index+1);
  if(s.phase==='milestone')expectedMilestones.push(s.act);
  if(s.campaign.completedMilestones.length!==expectedMilestones.length||s.campaign.completedMilestones.some((act,index)=>act!==expectedMilestones[index]))return null;
  if(s.phase==='milestone'&&(!isActMilestone(s.day)||!s.campaign.transition||![RECOVERY_POLICIES.UNRESOLVED,RECOVERY_POLICIES.FULL].includes(s.campaign.transition.recoveryPolicy)||s.campaign.transition.recoveryApplied))return null;
  if(s.phase==='won'&&(!isFinalDay(s.day)||!s.campaign.finalComplete))return null;
  if(s.phase!=='won'&&s.campaign.finalComplete)return null;
  // Preserve legacy progress, prices and purchased flags while removing obsolete bag/sale wording.
  if(s.event){const current=makeEvent(s);s.event.desc=current.desc;for(const option of s.event.options){const fresh=current.options.find(x=>x.id===option.id);if(fresh){option.desc=fresh.desc;option.endsEvent=fresh.endsEvent;if(fresh.purchasedOnce)option.purchasedOnce=true;}else if(option.item&&WEAPONS[option.item])option.desc=describeWeapon(WEAPONS[option.item])+' Choose a slot if needed.';}}
  return s;
 }catch{return null;}
}
