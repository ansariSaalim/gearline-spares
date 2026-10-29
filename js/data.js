/* Gearline Spares demo data.
   Edit this file to change the starting catalogue, shop details and sample orders.
   Visitors' changes are saved in their own browser (localStorage), so after editing
   this file use Admin > Settings > Reset demo data to see the new defaults. */
(function(){
const DAY=864e5, now=Date.now();
window.GEARLINE_SEED={
  seq:1045,
  // Raise settingsRev after changing settings below so every visitor picks up the new values.
  settingsRev:2,
  settings:{shop:'Gearline Spares',wa:'919876543210',upi:'gearline@okaxis',delivery:79,freeAbove:1999},
  products:[
    {id:'bp-swift',img:'images/bp-swift.jpg',name:'Front Brake Pad Set',brand:'Bosch',part:'0986AB2517',cat:'brakes',makes:['Maruti Suzuki'],fits:'Swift 2018–2024, Dzire, Baleno',price:1450,mrp:1890,stock:24,desc:'Low-dust ceramic pads with wear indicator. Set of 4 for both front wheels.',specs:{Position:'Front axle',Material:'Ceramic',Pieces:'4',Warranty:'6 months'}},
    {id:'oil-creta',img:'images/oil-creta.jpg',name:'Engine Oil Filter',brand:'Hyundai Mobis',part:'26300-35505',cat:'filters',makes:['Hyundai','Kia'],fits:'Creta, Verna, i20, Seltos (petrol)',price:340,mrp:420,stock:58,desc:'Genuine Mobis spin-on oil filter. Change every 10,000 km with the engine oil.',specs:{Type:'Spin-on',Thread:'M20 × 1.5',Engine:'1.5 MPi / 1.2 Kappa',Warranty:'Genuine part'}},
    {id:'air-nexon',img:'images/air-nexon.jpg',name:'Air Filter Element',brand:'Purolator',part:'PU-A1187',cat:'filters',makes:['Tata'],fits:'Nexon 2020+, Altroz (petrol)',price:520,mrp:690,stock:3,desc:'Multi-layer paper element. Replace every 15,000 km or sooner on dusty roads.',specs:{Type:'Panel',Media:'Cellulose',Engine:'1.2 Revotron',Warranty:'3 months'}},
    {id:'plug-k12',img:'images/plug-k12.jpg',name:'Iridium Spark Plug',brand:'NGK',part:'ILKAR7B11',cat:'engine',makes:['Maruti Suzuki'],fits:'Swift, Baleno, Ertiga, Dzire (K12 engine)',price:690,mrp:850,stock:40,desc:'Laser iridium tip for stable idle and up to 60,000 km life. Priced per plug; K12 needs 4.',specs:{Gap:'1.1 mm',Thread:'12 mm',Reach:'26.5 mm','Sold as':'Single plug'}},
    {id:'clutch-pulsar',img:'images/clutch-pulsar.jpg',name:'Clutch Plate Set',brand:'Bajaj Genuine',part:'JF511011',cat:'bike',makes:['Bajaj'],fits:'Pulsar 150, Pulsar 180, Avenger 160',price:980,mrp:1150,stock:12,desc:'Friction plate set for smooth engagement. Fit with a fresh clutch cable for best feel.',specs:{Plates:'5 friction',Type:'Wet multi-plate',Warranty:'Genuine part'}},
    {id:'chain-splendor',img:'images/chain-splendor.jpg',name:'Chain Sprocket Kit',brand:'Rolon',part:'CSK-428H',cat:'bike',makes:['Hero'],fits:'Splendor Plus, Passion Pro, HF Deluxe',price:1150,mrp:1490,stock:0,desc:'428H heavy-duty chain with front and rear sprockets. Replace as a set.',specs:{Chain:'428H × 112 links',Sprockets:'14T / 44T',Warranty:'6 months'}},
    {id:'shock-city',img:'images/shock-city.jpg',name:'Rear Shock Absorber',brand:'Gabriel',part:'G-2741',cat:'suspension',makes:['Honda'],fits:'Honda City 2014–2020, Amaze (gen 1)',price:2350,mrp:2990,stock:6,desc:'Gas-charged twin-tube damper. Sold per piece; replace in pairs for even handling.',specs:{Position:'Rear',Type:'Gas-charged',Mount:'Eye / stem','Sold as':'Single unit'}},
    {id:'batt-35',img:'images/batt-35.jpg',name:'Car Battery 35Ah',brand:'Amaron',part:'AAM-PR-00042B20L',cat:'electrical',makes:['Maruti Suzuki','Renault'],fits:'Alto 800, Alto K10, WagonR, Kwid',price:4290,mrp:5199,stock:9,desc:'Maintenance-free battery. Includes exchange discount when you return the old battery.',specs:{Capacity:'35 Ah',Terminal:'Left positive',Warranty:'72 months (pro-rata)'}},
    {id:'bulb-h4',img:'images/bulb-h4.jpg',name:'H4 Halogen Headlamp Bulb',brand:'Philips',part:'12342PRB1',cat:'electrical',makes:['Maruti Suzuki','Hyundai','Tata','Honda'],fits:'Most hatchbacks with H4 lamps, Activa 6G',price:420,mrp:560,stock:75,desc:'12V 60/55W bulb with brighter, whiter beam. Check your lamp type is H4 before ordering.',specs:{Base:'P43t (H4)',Wattage:'60/55 W',Voltage:'12 V'}},
    {id:'belt-innova',img:'images/belt-innova.jpg',name:'Timing Belt Kit',brand:'Gates',part:'K015603XS',cat:'engine',makes:['Toyota'],fits:'Innova 2.5 D-4D (2005–2016)',price:3650,mrp:4400,stock:4,desc:'Belt, tensioner and idler in one kit. Replace every 1,00,000 km.',specs:{Contents:'Belt, tensioner, idler',Engine:'2KD-FTV',Warranty:'12 months'}},
    {id:'shoe-activa',img:'images/shoe-activa.jpg',name:'Rear Brake Shoe Set',brand:'Endurance',part:'BS-ACT6G',cat:'bike',makes:['Honda'],fits:'Activa 6G, Activa 125, Dio',price:260,mrp:340,stock:34,desc:'Asbestos-free drum brake shoes for 130 mm rear drum.',specs:{Drum:'130 mm',Position:'Rear',Pieces:'2'}},
    {id:'cabin-xuv',img:'images/cabin-xuv.jpg',name:'AC Cabin Filter, Carbon',brand:'Mahindra Genuine',part:'1401CAA00431N',cat:'filters',makes:['Mahindra'],fits:'XUV700, Scorpio-N',price:890,mrp:1150,stock:2,desc:'Activated carbon layer cuts odour and PM2.5 inside the cabin.',specs:{Media:'Activated carbon',Replace:'Every 10,000 km',Warranty:'Genuine part'}}
  ],
  orders:[
    {id:'GL-1044',sample:true,date:now-0.2*DAY,name:'Anita Desai',phone:'919765432100',address:'Flat 4B, Shanti Nagar, Nashik 422005',vehicle:'Alto K10 2019',pay:'upi',utr:'430811265907',items:[{id:'batt-35',name:'Car Battery 35Ah',part:'AAM-PR-00042B20L',price:4290,qty:1}],subtotal:4290,delivery:0,total:4290,status:'shipped'},
    {id:'GL-1043',sample:true,date:now-1.1*DAY,name:'Sameer Shaikh',phone:'919820011223',address:'12 Kurla West, Mumbai 400070',vehicle:'Creta 2021',pay:'upi',utr:'430912874561',items:[{id:'oil-creta',name:'Engine Oil Filter',part:'26300-35505',price:340,qty:2}],subtotal:680,delivery:79,total:759,status:'verify'},
    {id:'GL-1042',sample:true,date:now-2.4*DAY,name:'Ravi Kumar',phone:'919812345670',address:'Lane 6, Kothrud, Pune 411038',vehicle:'Swift 2020',pay:'cod',items:[{id:'bp-swift',name:'Front Brake Pad Set',part:'0986AB2517',price:1450,qty:1},{id:'plug-k12',name:'Iridium Spark Plug',part:'ILKAR7B11',price:690,qty:4}],subtotal:4210,delivery:0,total:4210,status:'paid'}
  ]
};
})();
