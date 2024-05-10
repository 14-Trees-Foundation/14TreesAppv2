import {createRealmContext} from '@realm/react';
import Realm from 'realm';


export class trees_location extends Realm.Object {
  
  static schema = {
    name: 'trees_location',
    embedded: true,
    properties: {
      type: {type: 'string', default:"Point"},
      coordinates: 'double[]',
    },
  };
}


// Define a class representing the structure of data
export class trees extends Realm.Object {
  // Define a Realm schema for data
  static schema = {
    name: 'trees',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      sapling_id: {type: 'string'},
      tree_id: 'objectId',
      plot_id: 'objectId',
      image: 'string[]',
      date_added: {type: 'date', optional: true},
      location: 'trees_location?',
      //isSynced: 'bool'
      //height: {type: 'int', optional: true},
      //user_id: {type : 'objectId',optional :true},
      //tags: 'string[]',
      //   location: {
      //     type: 'object',
      //     properties: {
      //         type: { type: 'string' },
      //         coordinates: 'double[]'
      //     }
      // },
      //mapped_to: 'objectId',
      //link: {type: 'string', optional: true},
      //event_type: {type: 'string', optional: true},
      //desc: {type: 'string', optional: true},
      //date_assigned: {type: 'date', optional: true},
    },
  };
}

export class plots extends Realm.Object {
  // Define a Realm schema for your data
  static schema = {
    name: 'plots',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name: 'string',
      plot_id: {type: 'string', indexed: true},
      // tags: 'string[]',
      //desc: {type: 'string', optional: true},
      // boundaries: {
      //   type: 'object', 
      // },
      // center: {
      //   type: 'object',
      //   // type: {type: 'string', default: 'Point'},
      //   // coordinates: 'double[]',
      // },
      date_added: {type: 'date', optional: true},
    },
  };
}



export class tree_types extends Realm.Object {
  // Define a Realm schema for your data
  static schema = {
    name: 'tree_types',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name:  'string',
      scientific_name: { type: 'string', optional: true },
      tree_id: { type: 'string', indexed: true,},
      // image: { type: 'string[]',},
      // family: { type: 'string', optional: true },
      // habit: { type: 'string', optional: true },
      // remarkable_char: { type: 'string', optional: true },
      // med_use: { type: 'string', optional: true },
      // other_use: { type: 'string', optional: true },
      // food: { type: 'string', optional: true },
      // eco_value: { type: 'string', optional: true },
      // parts_used: { type: 'string', optional: true },
      // tags: { type: 'string', },
      // desc: { type: 'string', optional: true },
    },
  };
}




// Define a Realm context for your data,open a realm
export const RealmContext = createRealmContext({
  schema: [trees, plots, tree_types,trees_location],
});













//------------------------------------------------------------------

// export class trees_location extends Realm.Object {
//   coordinates!: 'double[]';
//   type !: "string";

//   static schema: Realm.ObjectSchema = {
//     name: 'trees_location',
//     embedded: true,
//     properties: {
//       type: {type: 'string',default:"Point"},
//       coordinates: 'double[]',
//     },
//   };
// }

// // Define a class representing the structure of data
// export class trees extends Realm.Object {
//   _id!: Realm.BSON.ObjectId;
//   sapling_id!: string;
//   tree_id!: Realm.BSON.ObjectId;
//   plot_id!: Realm.BSON.ObjectId;
//   //user_id!: Realm.BSON.ObjectId;
//   image!: string[];
//   //height?: number;
//   date_added?: Date;
//   location!: trees_location;
//   //tags!: string[];
//   //location!: {type: string; coordinates: [number, number]};
//   //mapped_to!: Realm.BSON.ObjectId;
//   //link!: string;
//   //event_type!: string;
//   //desc!: string;
//   //date_assigned?: Date;

//   // Define a Realm schema for data
//   static schema = {
//     name: 'trees',
//     primaryKey: '_id',
//     properties: {
//       _id: 'objectId',
//       sapling_id: {type: 'string'},
//       tree_id: 'objectId',
//       plot_id: 'objectId',
//       //user_id: {type : 'objectId',optional :true},
//       image: 'string[]',
//       //height: {type: 'int', optional: true},
//       date_added: {type: 'date', optional: true},
//       location: 'trees_location',
//       //tags: 'string[]',
//       //   location: {
//       //     type: 'object',
//       //     properties: {
//       //         type: { type: 'string' },
//       //         coordinates: 'double[]'
//       //     }
//       // },
//       //mapped_to: 'objectId',
//       //link: {type: 'string', optional: true},
//       //event_type: {type: 'string', optional: true},
//       //desc: {type: 'string', optional: true},
//       //date_assigned: {type: 'date', optional: true},
//     },
//   };
// }

// export class plots extends Realm.Object {
//   _id!: Realm.BSON.ObjectId;
//   name!: string;
//   plot_id?: string;
//  // tags!: string[];
//   //desc?: string;
//   // boundaries!: {type: string; coordinates: number[][][]};
//   // center!: {type: string; coordinates: [number, number]};
//   date_added!: Date;

//   // Define a Realm schema for your data
//   static schema = {
//     name: 'plots',
//     primaryKey: '_id',
//     properties: {
//       _id: 'objectId',
//       name: 'string',
//       plot_id: {type: 'string', indexed: true},
//       // tags: 'string[]',
//       //desc: {type: 'string', optional: true},
//       // boundaries: {
//       //   type: 'object', 
//       // },
//       // center: {
//       //   type: 'object',
//       //   // type: {type: 'string', default: 'Point'},
//       //   // coordinates: 'double[]',
//       // },
//       date_added: {type: 'date', optional: true},
//     },
//   };
// }



// export class tree_types extends Realm.Object {
//   _id!: Realm.BSON.ObjectId;
//   name?: string;
//   scientific_name?: string;
//   tree_id?: string;
//   //image!: string[];
//   // family?: string;
//   // habit?: string;
//   // remarkable_char?: string;
//   // med_use?: string;
//   // other_use?: string;
//   // food?: string;
//   // eco_value?: string;
//   // parts_used?: string;
//   // tags!: string[];
//   // desc?: string;

//   // Define a Realm schema for your data
//   static schema = {
//     name: 'tree_types',
//     primaryKey: '_id',
//     properties: {
//       _id: 'objectId',
//       name:  'string',
//       scientific_name: { type: 'string', optional: true },
//       tree_id: { type: 'string', indexed: true,},
//       // image: { type: 'string[]',},
//       // family: { type: 'string', optional: true },
//       // habit: { type: 'string', optional: true },
//       // remarkable_char: { type: 'string', optional: true },
//       // med_use: { type: 'string', optional: true },
//       // other_use: { type: 'string', optional: true },
//       // food: { type: 'string', optional: true },
//       // eco_value: { type: 'string', optional: true },
//       // parts_used: { type: 'string', optional: true },
//       // tags: { type: 'string', },
//       // desc: { type: 'string', optional: true },
//     },
//   };
// }




// // Define a Realm context for your data,open a realm
// export const RealmContext = createRealmContext({
//   schema: [trees, plots, tree_types,trees_location],
// });
