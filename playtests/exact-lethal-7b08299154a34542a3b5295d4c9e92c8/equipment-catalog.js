// Equipment data is kept separate from combat so loot inspection can stay pure.
// WEAPONS deliberately remains mutable: tests and balance harnesses clone or
// temporarily adjust entries while the prototype is tuned.
export const WEAPONS = {
  // Legacy starters. IDs and gameplay stats are save-file compatibility anchors.
  rusty_dagger:{name:'Rusty needle',kind:'dagger',damageMin:1,damageMax:1,hits:1,cost:1,pierce:true,rusty:true,tier:0,sell:1,desc:'Exactly 1 damage. Pierces armor. A reliable finishing tool.',lootFamilies:['needle'],tags:['precision','light']},
  rusty_sword:{name:'Rusty sword',kind:'sword',damageMin:2,damageMax:2,hits:1,cost:1,rusty:true,tier:0,sell:1,desc:'Exactly 2 damage for 1 energy.',lootFamilies:['blade'],tags:['fixed']},
  rusty_spear:{name:'Rusty spear',kind:'spear',damageMin:3,damageMax:3,hits:1,cost:2,rusty:true,tier:0,sell:1,desc:'Exactly 3 damage for 2 energy.',lootFamilies:['spear'],tags:['fixed']},
  rusty_axe:{name:'Rusty axe',kind:'axe',damageMin:1,damageMax:5,hits:1,cost:1,rusty:true,tier:0,sell:1,desc:'A wild 1–5 damage swing for 1 energy.',lootFamilies:['axe','cleaver'],tags:['variable']},
  rusty_hammer:{name:'Rusty hammer',kind:'hammer',damageMin:2,damageMax:7,hits:1,cost:2,rusty:true,tier:0,sell:1,desc:'A heavy 2–7 damage blow for 2 energy.',lootFamilies:['hammer'],tags:['variable','heavy']},
  rusty_knife:{name:'Rusty knife',kind:'dagger',damageMin:1,damageMax:3,hits:1,cost:1,rusty:true,tier:0,sell:1,desc:'Deals 1–3 damage for 1 energy.',lootFamilies:['needle','cleaver'],tags:['variable','light']},

  // New rusty burst patterns widen the draft without changing its structure.
  rusty_flurry:{name:'Rusty flurry',kind:'spear',damageMin:1,damageMax:1,hits:3,cost:2,rusty:true,tier:0,sell:1,desc:'Three 1-damage strikes.',lootFamilies:['needle','spear'],tags:['multihit','light']},
  rusty_twins:{name:'Rusty twin axe',kind:'axe',damageMin:2,damageMax:2,hits:2,cost:2,rusty:true,tier:0,sell:1,desc:'Two 2-damage strikes.',lootFamilies:['axe','cleaver'],tags:['multihit']},

  // Legacy tier-one equipment.
  dagger:{name:'Mercy needle',kind:'dagger',damageMin:1,damageMax:1,hits:1,cost:1,pierce:true,tier:1,sell:2,desc:'Exactly 1 damage. Pierces armor. A careful final word.',lootFamilies:['needle'],tags:['precision','pierce','light']},
  sword:{name:'Iron sword',kind:'sword',damageMin:5,damageMax:5,hits:1,cost:1,tier:1,sell:3,desc:'Exactly 5 damage for 1 energy.',lootFamilies:['blade'],tags:['fixed']},
  axe:{name:'Cinder axe',kind:'axe',damageMin:3,damageMax:9,hits:1,cost:1,tier:1,sell:3,desc:'Deals 3–9 damage for 1 energy. Powerful and unpredictable.',lootFamilies:['axe','cleaver'],tags:['variable']},
  spear:{name:'Pilgrim spear',kind:'spear',damageMin:2,damageMax:2,hits:1,cost:1,pierce:true,tier:1,sell:3,desc:'Precisely 2 damage for 1 energy. Pierces armor.',lootFamilies:['spear'],tags:['precision','pierce']},
  hammer:{name:'Bell hammer',kind:'hammer',damageMin:5,damageMax:14,hits:1,cost:2,shred:1,tier:1,sell:3,desc:'Deals 5–14 damage, then removes 1 armor. Costs 2 energy.',lootFamilies:['hammer'],tags:['variable','shred','heavy']},
  buckler:{name:'Ash buckler',kind:'shield',defenseSlot:'offhand',passive:true,armor:3,cost:0,tier:1,sell:3,desc:'Offhand shield: 3 armor. Only one offhand shield can be equipped.',lootFamilies:['shield'],tags:['defense','offhand']},

  // New tier-one role signatures and attack shapes.
  war_pick:{name:'Grave pick',kind:'spear',damageMin:4,damageMax:4,hits:1,cost:2,pierce:true,tier:1,sell:3,desc:'Pierces armor.',lootFamilies:['spear','hammer'],tags:['fixed','pierce']},
  twin_fangs:{name:'Twin fangs',kind:'spear',damageMin:2,damageMax:2,hits:2,cost:2,tier:1,sell:3,desc:'Two measured strikes.',lootFamilies:['needle','spear'],tags:['multihit','light']},
  cinder_flail:{name:'Cinder flail',kind:'axe',damageMin:3,damageMax:3,hits:2,cost:2,tier:1,sell:3,desc:'Two heavy strikes.',lootFamilies:['axe','hammer'],tags:['multihit']},
  needle_rain:{name:'Needle rain',kind:'spear',damageMin:1,damageMax:2,hits:3,cost:2,tier:1,sell:3,desc:'Three uncertain strikes.',lootFamilies:['needle','powder'],tags:['multihit','variable','light']},
  splitting_axe:{name:'Splitting axe',kind:'axe',damageMin:4,damageMax:7,hits:1,cost:2,shred:2,tier:1,sell:3,desc:'Shred 2.',lootFamilies:['axe','cleaver'],tags:['variable','shred','heavy']},
  ritual_rod:{name:'Ashen ritual rod',kind:'spear',damageMin:2,damageMax:4,hits:2,cost:2,pierce:true,tier:1,sell:3,desc:'Pierces armor.',lootFamilies:['ritual','spear'],tags:['multihit','variable','pierce']},
  cook_cleaver:{name:'Bone cleaver',kind:'axe',damageMin:4,damageMax:6,hits:1,cost:1,tier:1,sell:3,desc:'',lootFamilies:['cleaver'],tags:['variable','light']},
  powder_spike:{name:'Powder spike',kind:'spear',damageMin:6,damageMax:6,hits:1,cost:2,pierce:true,tier:1,sell:3,desc:'Pierces armor.',lootFamilies:['powder','spear'],tags:['fixed','pierce']},
  ash_leathers:{name:'Ash leathers',kind:'armor',defenseSlot:'body',passive:true,armor:2,cost:0,tier:1,sell:3,desc:'Body armor: 2 armor. Only one body armor can be equipped.',lootFamilies:['lightArmor'],tags:['defense','body','light']},
  butcher_apron:{name:'Butcher apron',kind:'armor',defenseSlot:'body',passive:true,armor:1,cost:0,tier:1,sell:2,desc:'Body armor: 1 armor. Only one body armor can be equipped.',lootFamilies:['lightArmor'],tags:['defense','body','light']},
  knife_guard:{name:'Knife guard',kind:'shield',defenseSlot:'offhand',passive:true,armor:1,cost:0,tier:1,sell:2,desc:'Offhand guard: 1 armor. Only one offhand shield can be equipped.',lootFamilies:['lightGuard'],tags:['defense','offhand','light']},

  // Legacy tier-two equipment.
  falchion:{name:'Grave falchion',kind:'sword',damageMin:10,damageMax:10,hits:1,cost:1,tier:2,sell:4,desc:'Exactly 10 damage for 1 energy.',lootFamilies:['blade','cleaver'],tags:['fixed','heavy']},
  fang:{name:'Glass fang',kind:'dagger',damageMin:2,damageMax:2,hits:1,cost:1,pierce:true,tier:2,sell:4,desc:'Exactly 2 piercing damage for 1 energy.',lootFamilies:['needle'],tags:['precision','pierce','light']},
  glaive:{name:'Moon glaive',kind:'spear',damageMin:5,damageMax:13,hits:1,cost:1,tier:2,sell:4,desc:'Deals 5–13 damage for 1 energy. A dangerous sweep.',lootFamilies:['spear','ritual'],tags:['variable','heavy']},
  greatsword:{name:'Executioner',kind:'sword',damageMin:5,damageMax:13,hits:1,cost:1,tier:2,sell:4,desc:'A terrible 5–13 damage blow for 1 energy.',lootFamilies:['blade'],tags:['variable','heavy']},
  plate:{name:'Gravekeeper plate',kind:'armor',defenseSlot:'body',passive:true,armor:6,cost:0,tier:2,sell:4,desc:'Body armor: 6 armor. Only one body armor can be equipped.',lootFamilies:['plate'],tags:['defense','body','heavy']},
  bonehammer:{name:'Ossuary maul',kind:'hammer',damageMin:10,damageMax:22,hits:1,cost:2,shred:2,tier:2,sell:4,desc:'Deals 10–22 damage, then shatters 2 armor. Costs 2 energy.',lootFamilies:['hammer'],tags:['variable','shred','heavy']},

  // New tier-two weapons: strong patterns have energy, armor, or variance costs.
  knight_lance:{name:'Revenant lance',kind:'spear',damageMin:7,damageMax:7,hits:1,cost:2,pierce:true,tier:2,sell:4,desc:'Pierces armor.',lootFamilies:['spear'],tags:['fixed','pierce','heavy']},
  oathblade:{name:'Oath blade',kind:'sword',damageMin:8,damageMax:8,hits:1,cost:1,tier:2,sell:4,desc:'',lootFamilies:['blade'],tags:['fixed']},
  headsman_axe:{name:'Headsman axe',kind:'axe',damageMin:8,damageMax:16,hits:1,cost:2,tier:2,sell:4,desc:'',lootFamilies:['axe','cleaver'],tags:['variable','heavy']},
  redjaw_cleaver:{name:'Redjaw cleaver',kind:'axe',damageMin:6,damageMax:12,hits:2,cost:3,tier:2,sell:4,desc:'Two brutal strikes.',lootFamilies:['axe','cleaver'],tags:['multihit','variable','heavy']},
  bell_flail:{name:'Bell flail',kind:'axe',damageMin:4,damageMax:4,hits:3,cost:3,shred:1,tier:2,sell:4,desc:'Shred 1 after each strike.',lootFamilies:['hammer','ritual'],tags:['multihit','shred','heavy']},
  ossuary_knuckles:{name:'Ossuary knuckles',kind:'hammer',damageMin:3,damageMax:3,hits:3,cost:2,tier:2,sell:4,desc:'Three close strikes.',lootFamilies:['hammer'],tags:['multihit']},
  moon_needles:{name:'Moon needles',kind:'spear',damageMin:2,damageMax:2,hits:3,cost:2,pierce:true,tier:2,sell:4,desc:'Pierces armor.',lootFamilies:['needle','ritual'],tags:['multihit','pierce','light']},
  hex_focus:{name:'Hex focus',kind:'spear',damageMin:1,damageMax:4,hits:2,cost:2,pierce:true,tier:2,sell:4,desc:'Pierces armor.',lootFamilies:['ritual'],tags:['multihit','variable','pierce']},
  trap_hook:{name:'Trapwright hook',kind:'spear',damageMin:3,damageMax:5,hits:2,cost:2,shred:1,tier:2,sell:4,desc:'Shred 1 after each strike.',lootFamilies:['hook','powder'],tags:['multihit','variable','shred','light']},
  powder_cannon:{name:'Powder lance',kind:'spear',damageMin:9,damageMax:15,hits:1,cost:3,pierce:true,tier:2,sell:4,desc:'Pierces armor.',lootFamilies:['powder','spear'],tags:['variable','pierce','heavy']},
  grave_mace:{name:'Grave mace',kind:'hammer',damageMin:7,damageMax:7,hits:1,cost:2,shred:2,tier:2,sell:4,desc:'Shred 2.',lootFamilies:['hammer'],tags:['fixed','shred','heavy']},
  vow_greatblade:{name:'Vow greatblade',kind:'axe',damageMin:12,damageMax:12,hits:1,cost:3,tier:2,sell:4,desc:'',lootFamilies:['blade','cleaver'],tags:['fixed','heavy']},
  tower_shield:{name:'Revenant tower',kind:'shield',defenseSlot:'offhand',passive:true,armor:5,cost:0,tier:2,sell:4,desc:'Offhand shield: 5 armor. Only one offhand shield can be equipped.',lootFamilies:['shield'],tags:['defense','offhand','heavy']},
  chainmail:{name:'Oathbound mail',kind:'armor',defenseSlot:'body',passive:true,armor:4,cost:0,tier:2,sell:4,desc:'Body armor: 4 armor. Only one body armor can be equipped.',lootFamilies:['plate'],tags:['defense','body','heavy']},
  painward_mail:{name:'Painward hide',kind:'armor',defenseSlot:'body',passive:true,armor:3,cost:0,tier:2,sell:4,desc:'Body armor: 3 armor. Only one body armor can be equipped.',lootFamilies:['lightArmor'],tags:['defense','body']}
};

export const STARTING_POOL = Object.keys(WEAPONS).filter(id=>WEAPONS[id].rusty);
