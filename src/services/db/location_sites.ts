import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { LocationSite } from '../../model/sites';

export class LocationSitesDao {
    private db: SQLiteDatabase;
    private tableName: string = 'location_sites';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName}(
                location_id INTEGER PRIMARY KEY,
                location_name TEXT NOT NULL,
                display_name TEXT,
                location_type TEXT,
                location_path TEXT,
                parent_location_id INTEGER,
                total_trees_count INTEGER DEFAULT 0,
                area_acres REAL DEFAULT 0,
                grove_type TEXT,
                land_type TEXT,
                maintenance_type TEXT,
                photo_album TEXT
            );`;
            await this.db.executeSql(query);
            console.log('location_sites table created successfully!');
        } catch (error) {
            console.log('error creating location_sites table:', error);
        }
    };

    upsertLocationSite = async (data: LocationSite) => {
        const [response] = await this.db.executeSql(
            `SELECT location_id FROM ${this.tableName} WHERE location_id = ?;`,
            [data.id]
        );
        if (response.rows.length === 0) {
            await this.db.executeSql(
                `INSERT INTO ${this.tableName} (
                    location_id, location_name, display_name, location_type, location_path,
                    parent_location_id, total_trees_count, area_acres, grove_type, land_type,
                    maintenance_type, photo_album
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    data.id, data.location_name, data.display_name, data.location_type,
                    data.location_path, data.parent_location_id, data.total_trees_count,
                    data.area_acres, data.grove_type, data.land_type, data.maintenance_type,
                    data.photo_album,
                ]
            );
        } else {
            await this.db.executeSql(
                `UPDATE ${this.tableName} SET
                    location_name = ?, display_name = ?, location_type = ?, location_path = ?,
                    parent_location_id = ?, total_trees_count = ?, area_acres = ?, grove_type = ?,
                    land_type = ?, maintenance_type = ?, photo_album = ?
                WHERE location_id = ?;`,
                [
                    data.location_name, data.display_name, data.location_type, data.location_path,
                    data.parent_location_id, data.total_trees_count, data.area_acres,
                    data.grove_type, data.land_type, data.maintenance_type, data.photo_album,
                    data.id,
                ]
            );
        }
    };

    clearAll = async () => {
        await this.db.executeSql(`DELETE FROM ${this.tableName};`);
    };

    getLocationSites = async (offset: number = 0, limit: number = 50): Promise<LocationSite[]> => {
        const sites: LocationSite[] = [];
        const query = `SELECT * FROM ${this.tableName}
            ORDER BY location_name ASC
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};`;
        const [results] = await this.db.executeSql(query);
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            sites.push({
                id: row.location_id,
                location_name: row.location_name,
                display_name: row.display_name,
                location_type: row.location_type,
                location_path: row.location_path,
                parent_location_id: row.parent_location_id,
                total_trees_count: row.total_trees_count,
                area_acres: row.area_acres,
                grove_type: row.grove_type,
                land_type: row.land_type,
                maintenance_type: row.maintenance_type,
                accessibility_status: null,
                photo_album: row.photo_album,
            });
        }
        return sites;
    };

    searchLocationSites = async (query: string, offset: number, limit: number): Promise<LocationSite[]> => {
        const sites: LocationSite[] = [];
        const likeStr = `%${query}%`;
        const sql = `SELECT * FROM ${this.tableName}
            WHERE location_name LIKE ? OR display_name LIKE ?
            ORDER BY location_name ASC
            LIMIT ? OFFSET ?;`;
        const [results] = await this.db.executeSql(sql, [likeStr, likeStr, limit, offset]);
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            sites.push({
                id: row.location_id,
                location_name: row.location_name,
                display_name: row.display_name,
                location_type: row.location_type,
                location_path: row.location_path,
                parent_location_id: row.parent_location_id,
                total_trees_count: row.total_trees_count,
                area_acres: row.area_acres,
                grove_type: row.grove_type,
                land_type: row.land_type,
                maintenance_type: row.maintenance_type,
                accessibility_status: null,
                photo_album: row.photo_album,
            });
        }
        return sites;
    };
}
