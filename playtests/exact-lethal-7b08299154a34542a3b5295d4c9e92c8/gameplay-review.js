// Optional, compact guidance for EL-001. This module describes choices but
// never mutates the live run. Combat facts come from the engine's public API.
import * as E from './engine.js';

const copy=value=>JSON.parse(JSON.stringify(value));
const pct=value=>`${Math.round(Math.max(0,Math.min(1,value||0))*100)}%`;
const liveEnemies=state=>(state?.enemies||[]).filter(enemy=>!enemy.dead);
const validSlot=slot=>Number.isInteger(slot)&&slot>=0&&slot<4;
const valueRange=(min,max)=>min===max?String(min):`(${min}–${max})`;

export const COUNTER_LESSONS=Object.freeze({
 powderrunner:{title:'Break the bomb',counter:'Hit the shown threshold after armor.'},
 headsman:{title:'Stop execution',counter:'Land the shown hits this turn.'},
 hexsinger:{title:'Break the hex',counter:'Deal the shown exact total this turn.'},
 redjaw:{title:'Mind half health',counter:'Below half, its attack surges.'},
 trapwright:{title:'Mind the marked slot',counter:'Using it triggers the trap.'},
 shieldbearer:{title:'Break interception',counter:'Armor redirects ally attacks.'},
 bonecook:{title:'Stop the full heal',counter:'Deal the shown total this turn.'},
 painkeeper:{title:'Keep hits small',counter:'It mirrors the largest survived hit.'},
 weaponbreaker:{title:'Keep a spare ready',counter:'It jams the last weapon used.'},
 oathkeeper:{title:'Finish cleanly',counter:'Companion overkill raises its attack.'}
});

const mandatory=enemy=>['powderrunner','headsman','hexsinger','bonecook'].includes(enemy.mechanic)&&!enemy.interrupted;
const interruptDetail=enemy=>{
 if(enemy.mechanic==='powderrunner')return `${enemy.largestHit||0}/${enemy.interruptHit} hit`;
 if(enemy.mechanic==='headsman')return `${enemy.turnHits||0}/${enemy.interruptHits} hits`;
 if(enemy.mechanic==='hexsinger')return `${enemy.turnDamage||0}/${enemy.interruptExact} damage`;
 if(enemy.mechanic==='bonecook')return `${enemy.turnDamage||0}/${enemy.healInterrupt} damage`;
 return '';
};

function previews(state){
 const rows=[];
 for(let slot=0;slot<4;slot++){
  if(!E.canUse(state,slot))continue;
  for(const enemy of liveEnemies(state)){
   const preview=E.preview(state,slot,enemy.id);
   if(preview)rows.push({slot,enemy:state.enemies[preview.target],preview});
  }
 }
 return rows;
}

/** Return one terse, optional priority derived from visible state and previews. */
export function turnObjective(state,{selectedSlot=null,targetIndex=null,assist=true}={}){
 if(!assist||state?.phase!=='combat'||!liveEnemies(state).length)return null;
 const rows=previews(state),energy=state.energy||0;
 const charged=liveEnemies(state).find(mandatory);
 if(charged){
  const lethal=rows.find(row=>row.enemy?.id===charged.id&&row.preview.exact);
  if(lethal)return {kind:'exact',label:'Exact',detail:`${charged.hp} HP · ${energy-lethal.preview.cost}◆ left`,targetIndex:charged.id,slot:lethal.slot,energy,ariaLabel:`Exact finish ${charged.name} at ${charged.hp} health; ${energy-lethal.preview.cost} energy remains`};
  return {kind:'interrupt',label:'Interrupt',detail:`${charged.name} · ${interruptDetail(charged)}`,targetIndex:charged.id,slot:null,energy,ariaLabel:`Interrupt ${charged.name}; ${interruptDetail(charged)}`};
 }
 const trapper=liveEnemies(state).find(enemy=>enemy.mechanic==='trapwright'&&validSlot(enemy.trappedSlot));
 if(trapper&&selectedSlot===trapper.trappedSlot){
  return {kind:'avoid-trap',label:'Avoid trap',detail:`${'QWER'[trapper.trappedSlot]} marked · ${trapper.trapDamage}`,targetIndex:trapper.id,slot:trapper.trappedSlot,energy,ariaLabel:`Avoid trapped slot ${'QWER'[trapper.trappedSlot]}; trap attack ${trapper.trapDamage}`};
 }
 const aimed=Number.isInteger(targetIndex)?rows.filter(row=>row.enemy?.id===E.redirectedTarget(state,targetIndex)):rows;
 const exact=[...aimed,...rows].find((row,index,all)=>all.indexOf(row)===index&&row.preview.exact);
 if(exact)return {kind:'exact',label:'Exact',detail:`${exact.enemy.hp} HP · ${energy-exact.preview.cost}◆ left`,targetIndex:exact.enemy.id,slot:exact.slot,energy,ariaLabel:`Exact finish ${exact.enemy.name} at ${exact.enemy.hp} health; ${energy-exact.preview.cost} energy remains`};
 const target=liveEnemies(state).reduce((best,enemy)=>!best||enemy.hp<best.hp?enemy:best,null);
 return {kind:'setup',label:'Set up',detail:`${target.hp} HP · ${energy}◆`,targetIndex:target.id,slot:null,energy,ariaLabel:`Set up ${target.name} at ${target.hp} health with ${energy} energy`};
}

/** Name only the immediate consequence after a miss. */
export function missedConsequence(state,action=state?.lastAction,beforeState=null){
 if(!state||!action)return null;
 if(action.type==='attack'&&action.overkill>0){
  const keeper=liveEnemies(state).find(enemy=>enemy.mechanic==='oathkeeper');
  if(keeper)return `${keeper.name} +${action.overkill*keeper.oathMultiplier} attack`;
  return `Overkill +${action.overkill} · no reward`;
 }
 const source=beforeState||state;
 const armed=liveEnemies(source).find(enemy=>mandatory(enemy));
 if(armed&&(source.energy===0||action.type==='endTurn')){
  if(armed.mechanic==='headsman')return 'Execution remains armed';
  if(armed.mechanic==='powderrunner')return 'Bomb remains armed';
  if(armed.mechanic==='hexsinger')return 'Curse remains armed';
  if(armed.mechanic==='bonecook')return 'Full heal remains armed';
 }
 return null;
}

function seenMechanics(profile){return new Set(profile?.gameplayGuidance?.seenMechanics||[]);}
function counterInstruction(enemy){
 switch(enemy.mechanic){
  case 'powderrunner':return `Hit ${enemy.interruptHit}+ after armor.`;
  case 'headsman':return `Land ${enemy.interruptHits} hits this turn.`;
  case 'hexsinger':return `Deal exactly ${enemy.interruptExact} this turn.`;
  case 'redjaw':return 'Below half, its attack surges.';
  case 'trapwright':return `Marked slot triggers ${enemy.trapDamage} damage.`;
  case 'shieldbearer':return 'Armor redirects ally attacks.';
  case 'bonecook':return `Deal ${enemy.healInterrupt} this turn.`;
  case 'painkeeper':return `It mirrors ${enemy.reflectionMultiplier}× the largest survived hit.`;
  case 'weaponbreaker':return 'It jams the last weapon used.';
  case 'oathkeeper':return `Companion overkill grants ${enemy.oathMultiplier}× excess attack.`;
  default:return enemy.counterText||'';
 }
}

/** Coach the first newly encountered special family; encounter generation stays untouched. */
export function firstEncounterLesson(state,profile={}){
 if(state?.phase!=='combat')return null;
 const seen=seenMechanics(profile);
 const road=E.DIFFICULTIES[state.difficulty]||E.DIFFICULTIES.pilgrim;
 const enemy=liveEnemies(state).find(candidate=>COUNTER_LESSONS[candidate.mechanic]&&!seen.has(candidate.mechanic)&&(!candidate.dangerous||road.dangerous));
 if(!enemy)return null;
 const base=COUNTER_LESSONS[enemy.mechanic];
 return {mechanic:enemy.mechanic,title:base.title,counter:counterInstruction(enemy)||base.counter,progress:enemy.counterText||null,enemyIndex:enemy.id,mark:`counter:${enemy.mechanic}`,practiceAvailable:true};
}

export function markLessonSeen(profile={},lessonOrMechanic){
 const mechanic=typeof lessonOrMechanic==='string'?lessonOrMechanic:lessonOrMechanic?.mechanic;
 if(!COUNTER_LESSONS[mechanic])return copy(profile);
 const result=copy(profile),guidance={...(result.gameplayGuidance||{})};
 guidance.seenMechanics=[...new Set([...(guidance.seenMechanics||[]),mechanic])];
 result.gameplayGuidance=guidance;return result;
}

const PRACTICE_STATS={
 powderrunner:{hp:8,chargeDamage:4,interruptHit:5,attack:0},
 headsman:{hp:6,chargeDamage:4,interruptHits:3,attack:0},
 hexsinger:{hp:5,chargeDamage:4,interruptExact:2,attack:0},
 redjaw:{hp:8,berserkAttack:4,attack:1},
 trapwright:{hp:6,trapDamage:3,attack:1},
 shieldbearer:{hp:7,armor:2,attack:1},
 bonecook:{hp:7,healInterrupt:4,attack:1},
 painkeeper:{hp:7,reflectionMultiplier:2,attack:0},
 weaponbreaker:{hp:7,attack:1},
 oathkeeper:{hp:7,oathMultiplier:2,attack:1}
};

/** Build a disposable, engine-valid solo practice room without touching the live state. */
export function createPracticeShowcase(state,profile={}){
 const lesson=firstEncounterLesson(state,profile);if(!lesson)return null;
 const spec=PRACTICE_STATS[lesson.mechanic],practice=copy(state),stats={...spec};delete stats.hp;
 const needsAlly=['bonecook','shieldbearer','oathkeeper'].includes(lesson.mechanic);
 const tuples=[[lesson.mechanic,spec.hp,null,stats]];
 if(needsAlly)tuples.push(['goblin',3,null,{attack:0,armor:0}]);
 E.createEncounter(practice,tuples);
 if(lesson.mechanic==='bonecook'){
  practice.enemies[1].hp=1;E.refreshIntents(practice);
 }
 practice.hp=practice.maxHp;practice.gold=0;practice.damageTaken=0;practice.exact=0;practice.kills=0;practice.overkills=0;practice.roomExact=0;practice.roomKills=0;
 practice.pendingDrops=[];practice.loot=[];practice.offers=[];practice.lastLoot=null;practice.dropHistory=[];practice.history=[];practice.log=[];practice.lastAction=null;
 practice.id=`${state.id||'run'}-practice-${lesson.mechanic}`;
 practice.practice={mechanic:lesson.mechanic,sourceRunId:state.id||null,disposable:true};
 return {lesson,state:practice,layout:needsAlly?'mechanic-pair':'solo',disclaimer:`Practice only · run unchanged${needsAlly?' · weak companion demonstrates the counter':''}`};
}

function itemValue(itemOrDrop){
 if(!itemOrDrop)return null;
 if(itemOrDrop.item?.id)return {...itemOrDrop.item,blessings:itemOrDrop.item.blessings||[]};
 return itemOrDrop;
}
function itemStats(weapon){
 if(weapon.passive)return {damage:null,energy:null,armor:`+${weapon.armor||0}`,slot:E.armorCategory(weapon)};
 const hits=weapon.hits??1;
 return {damage:`${valueRange(weapon.damageMin,weapon.damageMax)}×${hits}`,energy:`${weapon.cost}◆`,armor:null,slot:null,totalMin:weapon.damageMin*hits,totalMax:weapon.damageMax*hits};
}
function specials(weapon){
 const result=[];
 if(weapon.pierce)result.push('Pierce');
 if(weapon.shred)result.push(`Shred ${weapon.shred}`);
 for(const blessing of weapon.blessings||[])if(E.BLESSINGS[blessing])result.push(E.BLESSINGS[blessing].name.replace('Blessing of ',''));
 return result;
}
function candidatePreview(state,weapon,slot,target){
 if(state?.phase!=='combat'||!validSlot(slot)||!Number.isInteger(target))return null;
 const trial=copy(state),uid=`guidance-${weapon.id}-${slot}`;
 trial.inventory=trial.inventory.filter(item=>item.uid!==trial.slots[slot]);
 trial.inventory.push({uid,id:weapon.id,blessings:[...(weapon.blessings||[])],kills:0});trial.slots[slot]=uid;
 return E.preview(trial,slot,target);
}

function counterInteraction(enemy,preview){
 if(!enemy||!preview||preview.cancelledByTrap)return null;
 const steps=preview.hitSteps||[],certain=1-1e-12;
 if(enemy.mechanic==='powderrunner'){
  if(steps.some(step=>step.executionChance>=certain&&step.damageMin>=enemy.interruptHit))return 'Bomb interrupt';
  if(steps.some(step=>step.executionChance>0&&step.damageMax>=enemy.interruptHit))return 'Bomb chance';
 }
 if(enemy.mechanic==='headsman'){
  const need=Math.max(0,enemy.interruptHits-(enemy.turnHits||0));
  if(need===0||preview.minActualHits>=need)return 'Execution interrupt';
  if(preview.maxActualHits>=need)return 'Execution chance';
 }
 if(enemy.mechanic==='hexsinger'&&(enemy.turnDamage||0)<=enemy.interruptExact){
  let total=enemy.turnDamage||0;
  for(const step of steps){
   if(step.executionChance<certain||step.damageMin!==step.damageMax)break;
   total+=step.damageMin;if(total===enemy.interruptExact)return 'Hex interrupt';if(total>enemy.interruptExact)break;
  }
 }
 if(enemy.mechanic==='bonecook'){
  const need=Math.max(0,enemy.healInterrupt-(enemy.turnDamage||0));
  if(need===0)return 'Heal interrupted';
  let minimum=0,maximum=0;
  for(const step of steps){
   if(step.executionChance<=0)break;
   minimum+=step.damageMin;maximum+=step.damageMax;
   if(step.executionChance>=certain&&minimum>=need)return 'Heal interrupt';
   if(maximum>=need)return 'Heal chance';
  }
 }
 return null;
}

/** Compact slot and current-room comparison for drops and shop items. */
export function compareItem(state,itemOrDrop,{slot=null,targetIndex=null}={}){
 const raw=itemValue(itemOrDrop),weapon=E.effectiveWeapon(raw);if(!weapon)return null;
 const category=E.armorCategory(weapon);
 if(!validSlot(slot))slot=category?state?.slots?.findIndex((_,index)=>E.armorCategory(E.getWeapon(state,index))===category):-1;
 if(!validSlot(slot))slot=state?.slots?.findIndex(uid=>uid==null)??-1;
 const old=validSlot(slot)?E.getWeapon(state,slot):null,newStats=itemStats(weapon),oldStats=old?itemStats(old):null;
 let comparison=old?'Replace':'Open slot';
 if(old&&weapon.passive&&old.passive)comparison=`${(weapon.armor||0)-(old.armor||0)>=0?'+':''}${(weapon.armor||0)-(old.armor||0)} armor`;
 else if(old&&!weapon.passive&&!old.passive){
  const damageDelta=weapon.damageMax*(weapon.hits??1)-old.damageMax*(old.hits??1),costDelta=weapon.cost-old.cost;
  comparison=`${damageDelta>=0?'+':''}${damageDelta} max total · ${costDelta===0?'same':costDelta>0?`+${costDelta}`:costDelta}◆`;
 }
 const target=Number.isInteger(targetIndex)?targetIndex:liveEnemies(state)[0]?.id;
 const fresh=candidatePreview(state,weapon,slot,target),prior=old&&!old.passive&&Number.isInteger(target)?E.preview(state,slot,target):null;
 const currentRoom=fresh?{targetIndex:fresh.target,newExact:pct(fresh.exactChance),oldExact:prior?pct(prior.exactChance):null,newDamage:valueRange(fresh.min,fresh.max),oldDamage:prior?valueRange(prior.min,prior.max):null,plannedHits:fresh.plannedHits,actualHits:`${fresh.minActualHits}–${fresh.maxActualHits}`,trapDamage:fresh.trapDamage}:null;
 let interaction=null;
 const enemy=Number.isInteger(fresh?.target)?state.enemies[fresh.target]:null;
 if(fresh?.exact)interaction=`${fresh.target===target?'Exact':'Redirected exact'} 100%`;
 else interaction=counterInteraction(enemy,fresh);
 if(!interaction&&fresh?.exactChance>0)interaction=`${fresh.target===target?'Exact':'Redirected exact'} ${pct(fresh.exactChance)}`;
 if(!interaction&&weapon.pierce&&liveEnemies(state).some(candidate=>candidate.armor>0))interaction='Pierces armor';
 return {name:weapon.name,slot,stats:newStats,special:specials(weapon),replaces:old?.name||null,replacedStats:oldStats,comparison,currentRoom,interaction};
}

export function initialRunTelemetry(){return {version:1,rooms:{},roomStart:null,interrupts:0,trapTriggers:0,jamSafeTurns:0,mechanicsSeen:[],missedCounter:null};}

/** Pure telemetry reducer for UI calls after engine actions. */
export function updateRunTelemetry(value,event={}){
 const next={...initialRunTelemetry(),...copy(value||{}),rooms:{...(value?.rooms||{})},mechanicsSeen:[...(value?.mechanicsSeen||[])]};
 const after=event.afterState||event.state,before=event.beforeState,action=event.action||after?.lastAction;
 if(event.type==='encounterStart'&&after){
  next.mechanicsSeen=[...new Set([...next.mechanicsSeen,...liveEnemies(after).map(enemy=>enemy.mechanic)])];
  next.roomStart={day:after.day,damageTaken:after.damageTaken||0,trapTriggers:next.trapTriggers};next.missedCounter=null;
 }
 if(event.type==='attack'&&action){
  if(action.trapSteps?.length)next.trapTriggers++;
  if(before&&after){
   for(const enemy of liveEnemies(after))if(enemy.interrupted&&!before.enemies?.[enemy.id]?.interrupted)next.interrupts++;
  }
  next.missedCounter=missedConsequence(after,action,before);
 }
 if(event.type==='enemyRound'&&action){
  const jams=action.jammedSlots||[];
  if(jams.length&&after?.slots?.some((_,slot)=>!jams.includes(slot)&&E.getWeapon(after,slot)&&!E.getWeapon(after,slot).passive))next.jamSafeTurns++;
  next.missedCounter=missedConsequence(after,action,before);
 }
 if(event.type==='roomEnd'&&after){
  const room=after.history?.filter(entry=>entry.kills!==undefined).at(-1);
  const start=next.roomStart?.day===room?.day?next.roomStart:null;
  if(room)next.rooms[room.day]={exact:room.exact,kills:room.kills,hp:room.hp,damage:event.damage??(start?Math.max(0,(after.damageTaken||0)-start.damageTaken):null),trapTriggers:Math.max(0,next.trapTriggers-(start?.trapTriggers||0)),missedCounter:next.missedCounter,mechanics:[...new Set((after.enemies||[]).map(enemy=>enemy.mechanic))]};
  next.roomStart=null;
 }
 return next;
}

export function campReflection(state,telemetry={}){
 const room=state?.history?.filter(entry=>entry.kills!==undefined).at(-1);if(!room)return null;
 const recorded=telemetry.rooms?.[room.day]||{},damage=recorded.damage??null;
 return {metrics:[{label:'Exact',value:`${room.exact}/${room.kills}`},{label:'Overkill',value:String(room.kills-room.exact)},{label:'HP spent',value:damage==null?'—':String(damage)}],missedCounter:recorded.missedCounter||telemetry.missedCounter||null,nextStat:`Day ${Math.min(10,(room.day||state.day)+1)} · ${state.hp} HP`};
}

function previewNextThreat(state){
 if(state?.phase!=='event'||state.pendingDrops?.length)return null;
 const trial=copy(state),exit=trial.event?.id==='merchant'?trial.event.options.findIndex(option=>option.id==='leave'):0;
 if(exit<0||!E.chooseEvent(trial,exit)||trial.phase!=='camp'||!E.nextDay(trial)||trial.phase!=='combat')return null;
 return {foes:liveEnemies(trial).length,hp:liveEnemies(trial).reduce((sum,enemy)=>sum+enemy.hp,0),armor:liveEnemies(trial).reduce((sum,enemy)=>sum+enemy.armor,0)};
}

export function eventPrompt(state,profile={}){
 if(state?.phase!=='event')return null;const threat=previewNextThreat(state),nextStat=threat?`${threat.foes} foes · ${threat.hp} HP · ${threat.armor} armor`:null;
 if(state.event?.id==='wayside')return {id:'practice-plan',label:'Practice?',optional:(profile.runs||0)>0,nextStat,options:[{id:'precision',label:'Exact',detail:'Ranges + finish'},{id:'interrupt',label:'Interrupt',detail:'Charged intents'},{id:'control',label:'Control',detail:'Armor + slots'}]};
 if(state.event?.id==='merchant')return {id:'road-plan',label:'Plan?',optional:true,nextStat,options:[{id:'bank',label:'Bank',detail:`Keep ${state.gold} gold`},{id:'armor',label:'Armor',detail:'Reduce each hit'},{id:'weapon',label:'Weapon',detail:'Shape exacts'}]};
 return null;
}

const CONTRACTS=[
 {id:'clean-room',label:'Clean room',goal:1,reward:'Frame tint',progress:(state,t)=>Math.max(0,...Object.values(t.rooms||{}).map(room=>Number(room.kills>0&&room.exact===room.kills)))},
 {id:'break-two',label:'Break 2 charges',goal:2,reward:'Log mark',progress:(state,t)=>t.interrupts||0},
 {id:'trapwise',label:'Trapwise room',goal:1,reward:'Card flourish',progress:(state,t)=>Math.max(0,...Object.values(t.rooms||{}).map(room=>Number(room.mechanics?.includes('trapwright')&&(room.trapTriggers||0)===0)))},
 {id:'spare-ready',label:'Spare ready',goal:1,reward:'Log mark',progress:(state,t)=>t.jamSafeTurns||0}
];

/** Three optional, cosmetic-only run contracts. Never changes stats or unlock gates. */
export function masteryCards(state,telemetry={},profile={}){
 const offset=Math.abs(Number(state?.initialSeed)||0)%CONTRACTS.length;
 return Array.from({length:3},(_,index)=>CONTRACTS[(offset+index)%CONTRACTS.length]).map(contract=>{
  const progress=Math.min(contract.goal,contract.progress(state,telemetry,profile));
  return {id:contract.id,label:contract.label,progress,goal:contract.goal,complete:progress>=contract.goal,reward:contract.reward,optional:true};
 });
}
