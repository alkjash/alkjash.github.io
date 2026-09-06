import {WEAPONS} from './equipment-catalog.js';

const profile = (families, items, {excludedFamilies=[], excludedTags=[], defenseSlots=[]}={}) =>
  Object.freeze({
    families:Object.freeze([...families]),
    items:Object.freeze([...items]),
    excludedFamilies:Object.freeze([...excludedFamilies]),
    excludedTags:Object.freeze([...excludedTags]),
    defenseSlots:Object.freeze([...defenseSlots])
  });

// Each enemy has an explicit pool. Families explain the identity; item IDs make
// the rule closed, so adding equipment cannot silently leak into every enemy.
export const ENEMY_LOOT_PROFILES = Object.freeze({
  goblin:profile(['needle','blade','hook','powder','lightGuard'],[
    'dagger','sword','twin_fangs','needle_rain','powder_spike','knife_guard','fang','moon_needles','trap_hook'
  ],{excludedFamilies:['plate'],excludedTags:['heavy'],defenseSlots:['offhand']}),
  orc:profile(['axe','cleaver','hammer','blade'],[
    'axe','hammer','cook_cleaver','splitting_axe','cinder_flail','falchion','bonehammer','headsman_axe','redjaw_cleaver','ossuary_knuckles','grave_mace','vow_greatblade'
  ],{excludedFamilies:['plate','shield'],defenseSlots:[]}),
  assassin:profile(['needle','blade','hook','lightGuard'],[
    'dagger','sword','twin_fangs','needle_rain','knife_guard','fang','moon_needles','trap_hook','oathblade'
  ],{excludedFamilies:['plate','shield'],excludedTags:['heavy'],defenseSlots:['offhand']}),
  knight:profile(['blade','spear','hammer','shield','plate'],[
    'sword','spear','hammer','war_pick','buckler','falchion','glaive','greatsword','plate','bonehammer','knight_lance','oathblade','grave_mace','vow_greatblade','tower_shield','chainmail'
  ],{defenseSlots:['body','offhand']}),
  shaman:profile(['ritual','spear','needle','lightArmor'],[
    'dagger','spear','twin_fangs','ritual_rod','ash_leathers','fang','moon_needles','hex_focus','painward_mail'
  ],{excludedFamilies:['plate','shield'],excludedTags:['heavy'],defenseSlots:['body']}),
  boss:profile(['hammer','blade','spear','ritual','shield','plate'],[
    'hammer','war_pick','buckler','falchion','glaive','greatsword','plate','bonehammer','knight_lance','oathblade','bell_flail','grave_mace','vow_greatblade','tower_shield','chainmail'
  ],{defenseSlots:['body','offhand']}),
  powderrunner:profile(['powder','needle','hook','lightGuard'],[
    'dagger','twin_fangs','needle_rain','powder_spike','knife_guard','fang','moon_needles','trap_hook'
  ],{excludedFamilies:['plate','shield'],excludedTags:['heavy'],defenseSlots:['offhand']}),
  headsman:profile(['axe','cleaver','hammer','blade','plate'],[
    'axe','hammer','splitting_axe','cook_cleaver','cinder_flail','falchion','greatsword','plate','bonehammer','headsman_axe','redjaw_cleaver','grave_mace','vow_greatblade','chainmail'
  ],{excludedFamilies:['shield'],defenseSlots:['body']}),
  hexsinger:profile(['ritual','needle','spear','lightArmor'],[
    'dagger','spear','twin_fangs','needle_rain','ritual_rod','ash_leathers','fang','moon_needles','hex_focus','painward_mail'
  ],{excludedFamilies:['plate','shield'],excludedTags:['heavy'],defenseSlots:['body']}),
  redjaw:profile(['axe','cleaver','hammer','blade'],[
    'axe','hammer','cinder_flail','splitting_axe','cook_cleaver','falchion','bonehammer','headsman_axe','redjaw_cleaver','ossuary_knuckles','grave_mace','vow_greatblade'
  ],{excludedFamilies:['plate','shield'],defenseSlots:[]}),
  trapwright:profile(['hook','powder','needle','lightGuard'],[
    'dagger','twin_fangs','needle_rain','powder_spike','knife_guard','fang','moon_needles','trap_hook'
  ],{excludedFamilies:['plate','shield'],excludedTags:['heavy'],defenseSlots:['offhand']}),
  shieldbearer:profile(['shield','blade','hammer','plate'],[
    'sword','hammer','war_pick','buckler','falchion','greatsword','plate','bonehammer','oathblade','bell_flail','grave_mace','tower_shield','chainmail'
  ],{defenseSlots:['body','offhand']}),
  bonecook:profile(['cleaver','needle','hammer','lightArmor'],[
    'dagger','axe','cook_cleaver','butcher_apron','fang','ossuary_knuckles','painward_mail'
  ],{excludedFamilies:['plate','shield'],excludedTags:['heavy'],defenseSlots:['body']}),
  painkeeper:profile(['hammer','hook','ritual','lightArmor'],[
    'hammer','war_pick','ritual_rod','ash_leathers','bonehammer','bell_flail','ossuary_knuckles','hex_focus','trap_hook','grave_mace','painward_mail'
  ],{excludedFamilies:['plate','shield'],defenseSlots:['body']}),
  weaponbreaker:profile(['hammer','axe','hook','shield','plate'],[
    'axe','hammer','war_pick','splitting_axe','buckler','plate','bonehammer','headsman_axe','bell_flail','trap_hook','grave_mace','tower_shield','chainmail'
  ],{defenseSlots:['body','offhand']}),
  oathkeeper:profile(['blade','spear','shield','plate'],[
    'sword','spear','war_pick','buckler','falchion','glaive','greatsword','plate','knight_lance','oathblade','vow_greatblade','tower_shield','chainmail'
  ],{defenseSlots:['body','offhand']})
});

const numericSeed = seed => {
  if(typeof seed==='number'&&Number.isFinite(seed))return seed>>>0;
  let value=2166136261;
  for(const char of String(seed))value=Math.imul(value^char.charCodeAt(0),16777619);
  return value>>>0;
};
const mix = value => {
  value=Math.imul(value^(value>>>16),0x21f0aaad);
  value=Math.imul(value^(value>>>15),0x735a2d97);
  return(value^(value>>>15))>>>0;
};
const hashText = text => numericSeed(text);

function tierCap(day){
  if(!Number.isInteger(day)||day<1||day>10)throw new RangeError(`Invalid loot day ${day}.`);
  return day<=3?1:2;
}

function validForProfile(id,entry,role,cap){
  if(!entry||entry.rusty||!Number.isInteger(entry.tier)||entry.tier<1||entry.tier>cap)return false;
  const families=Array.isArray(entry.lootFamilies)?entry.lootFamilies:[];
  const tags=Array.isArray(entry.tags)?entry.tags:[];
  if(!families.some(family=>role.families.includes(family)))return false;
  if(families.some(family=>role.excludedFamilies.includes(family)))return false;
  if(tags.some(tag=>role.excludedTags.includes(tag)))return false;
  if(entry.passive&&!role.defenseSlots.includes(entry.defenseSlot))return false;
  return true;
}

export function eligibleEnemyLoot(enemyType,day){
  const role=ENEMY_LOOT_PROFILES[enemyType];
  if(!role)throw new RangeError(`Unknown enemy loot role ${enemyType}.`);
  const cap=tierCap(day);
  const items=role.items.filter(id=>validForProfile(id,WEAPONS[id],role,cap));
  if(!items.length)throw new RangeError(`No eligible loot for ${enemyType} on day ${day}.`);
  return [...items];
}

export function selectEnemyLoot(enemyType,day,initialSeed,encounterIndex=0){
  if(!Number.isInteger(encounterIndex)||encounterIndex<0)throw new RangeError(`Invalid encounter index ${encounterIndex}.`);
  const candidates=eligibleEnemyLoot(enemyType,day);
  const seed=mix(numericSeed(initialSeed)^hashText(enemyType)^Math.imul(day,0x9e3779b1)^Math.imul(encounterIndex+1,0x85ebca6b));
  return candidates[seed%candidates.length];
}

export const SHOP_ANCHORS=Object.freeze({
  3:Object.freeze(['sword','buckler','axe']),
  7:Object.freeze(['falchion','plate','buckler','fang'])
});

function shopDay(day){
  if(day===3||day===7)return day;
  throw new RangeError(`Day ${day} has no equipment shop.`);
}

export function eligibleShopItems(day){
  shopDay(day);const cap=tierCap(day);
  return Object.keys(WEAPONS).filter(id=>{
    const item=WEAPONS[id];
    return !item.rusty&&Number.isInteger(item.tier)&&item.tier>=1&&item.tier<=cap;
  });
}

export function selectShopStock(day,initialSeed,additionalCount=2){
  const at=shopDay(day);
  if(!Number.isInteger(additionalCount)||additionalCount<0)throw new RangeError(`Invalid shop addition count ${additionalCount}.`);
  const anchors=[...SHOP_ANCHORS[at]],anchorSet=new Set(anchors);
  const candidates=eligibleShopItems(at).filter(id=>!anchorSet.has(id));
  let state=mix(numericSeed(initialSeed)^Math.imul(at,0x9e3779b1)^0x53484f50);
  for(let i=candidates.length-1;i>0;i--){
    state=mix(state+i+1);const j=state%(i+1);
    [candidates[i],candidates[j]]=[candidates[j],candidates[i]];
  }
  return anchors.concat(candidates.slice(0,Math.min(additionalCount,candidates.length)));
}
