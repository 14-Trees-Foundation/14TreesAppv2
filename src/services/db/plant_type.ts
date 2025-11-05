import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { PlantType } from '../../model/plant_type';


export class PlantTypesDao {
    private db: SQLiteDatabase;
    private tableName: string = 'plant_types';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName}(
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            );`;

            await this.db.executeSql(query);
            console.log('Plant types table created successfully!');
        } catch (error) {
            console.log('error creating plant_types table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Plant types table deleted")
    }

    // Data manipulation operations
    getPlantTypes = async (offset: number = 0, limit: number = 10) => {
        const plantTypes: PlantType[] = []
        const query = `SELECT * FROM ${this.tableName}
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};  `

        const result = await this.db.executeSql(query)
        for (let index = 0; index < result.rows.length; index++) {
            plantTypes.push(result.rows.item(index));
        }

        return plantTypes;
    }

    upsertLivePlantTypeIntoLocalDb = async (data: PlantType) => {
        await this.db.executeSql(
            `INSERT OR REPLACE INTO ${this.tableName} (
                id,
                name
            ) VALUES (
                ?, ?
            );`,
            [
                data.id, data.name
            ]
        )
    }

    deleteLivePlantTypeFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id = ?;`,
            [id]
        )
    }

    getLivePlantTypeIds = async () => {
        const query = `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const result = await this.db.executeSql(query);
        

        const plantTypeIds: number[] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            plantTypeIds.push(row.id);
        }

        return plantTypeIds;
    }

    searchPlantTypes = async (searchStr: string, offset: number, limit: number) => {
        let plantTypes: PlantType[] = [];
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE name LIKE ?
            LIMIT ? OFFSET ?;
        `
        const likeStr = `%${searchStr}%`
        const result = await this.db.executeSql(query, [likeStr, limit, offset]);
        for (let index = 0; index < result.rows.length; index++) {
            plantTypes.push(result.rows.item(index));
        }
        return plantTypes;
    }

    getPlantTypeByLiveId = async (id: number) => {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE id = ?;
        `
        const result = await this.db.executeSql(query, [id]);
        if (result.rows.length === 1) return result.rows.item(0) as PlantType;
        return null;
    }
};
