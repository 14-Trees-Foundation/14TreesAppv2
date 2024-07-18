import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateSiteRequest, Site } from '../../model/sites';

const sitesTableName = 'sites'

export class SitesDao {
    private db: SQLiteDatabase;
    private tableName: string = 'sites';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };


    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName}(
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER,
                name_marathi TEXT,
                name_english TEXT,
                owner TEXT,
                land_type TEXT,
                land_strata TEXT,
                district TEXT,
                taluka TEXT,
                village TEXT,
                area_acres REAL,
                length_km REAL,
                tree_count INTEGER,
                grove_type TEXT,
                site_data_check TEXT,
                is_uploaded INTEGER NOT NULL CHECK (is_uploaded IN (0, 1)),
                change_type TEXT NOT NULL CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );`;

            await this.db.executeSql(query);
            console.log('Sites table created successfully!');
        } catch (error) {
            console.log('error creating sites table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Sites table deleted")
    }

    // Data manipulation operations
    getSites = async (offset: number = 0, limit: number = 10, isUploaded?: boolean ,isDeleted: boolean = false) => {
        const site: Site[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${isDeleted ? '' : ` AND change_type != 'delete'`} ${isUploaded !== undefined ? 'AND ' + whereCondition : ""}
            ORDER BY local_id DESC 
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};
        `

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
          site.push(results.rows.item(index));
        }

        return site;
    }

    countSitesByChangeType = async (isUploaded?: boolean): Promise<any> => {
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT change_type, COUNT(*) as count FROM ${this.tableName}
            WHERE ${isUploaded !== undefined ? whereCondition : "1==1"} GROUP BY change_type;`

        const [results] = await this.db.executeSql(query)
        let response: any = {}
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            response = {
                ...response,
                [row.change_type]: row.count,
            }
        }

        return response;
    }

    createSite = async (data: CreateSiteRequest) => {
        const query = `
            INSERT INTO ${this.tableName}
            ( name_marathi,
              name_english,
              owner,
              land_type,
              land_strata,
              district,
              taluka,
              village,
              area_acres,
              length_km,
              grove_type,
              created_at,
              updated_at )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        const timeStamp = new Date().toISOString();
        const [results] = await this.db.executeSql(query, [
            data.name_marathi, 
            data.name_english,
            data.owner,
            data.land_type,
            data.land_strata,
            data.district,
            data.taluka,
            data.village,
            data.area_acres,
            data.length_km,
            data.grove_type,
            timeStamp,
            timeStamp
        ]);
        console.log(JSON.stringify(results))
    }

    updateSite = async (data: Site) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
        
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [data.local_id]
        )

        if (response.rows.length === 1) {
            const existingSite = response.rows.item(0) as Site;
            if (existingSite.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET
                    name_english = ?,
                    name_marathi = ?,
                    owner = ?,
                    land_type = ?,
                    land_strata = ?,
                    district = ?,
                    taluka = ?,
                    village = ?,
                    area_acres = ?,
                    length_km = ?,
                    grove_type = ?,
                    is_uploaded = 0,
                    change_type = ?,
                    updated_at = ?
                WHERE id = ?;`,
                [data.name_marathi, 
                  data.name_english,
                  data.owner,
                  data.land_type,
                  data.land_strata,
                  data.district,
                  data.taluka,
                  data.village,
                  data.area_acres,
                  data.length_km,
                  data.grove_type,
                  changeType, 
                  now, 
                  data.local_id]
            )
        } catch(err: any) {
            console.log(err);
        }
    }

 

    deleteSite = async (id: number) => {
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )

        // locally added Site: HARD DELETE
        if (response.rows.length === 1) {
            const existingSite = response.rows.item(0) as Site;
            if (existingSite.change_type === 'add') {
                await this.db.executeSql(
                    `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
                    [id]
                )
            } else {
                // Live Site
                await this.db.executeSql(
                    `UPDATE ${this.tableName}
                    SET
                        is_uploaded = 0,
                        change_type = 'delete'
                    WHERE local_id = ?;`,
                    [id]
                )
            }
        }
    }

    deleteLiveSiteFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id = ?;`,
            [id]
        )
    }

    deleteLocalSite = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )
    }

    updateSiteUploadStatus = async (id: number) => {
        const query = `UPDATE ${this.tableName} SET is_uploaded = 1, change_type = 'none' WHERE local_id = ${id};`
        await this.db.executeSql(query)
    }

    getSiteByLiveId = async (id: number) => {
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE id = ?;
        `
        const [results] = await this.db.executeSql(query, [id]);
        if (results.rows.length === 1) return results.rows.item(0) as Site;
        return null;
    }

    getLiveSiteIds = async () => {
        const query =  `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const [result] = await this.db.executeSql(query);

        const site_ids: number [] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            site_ids.push(row.id);
        }

        return site_ids;
    }

    searchSites = async (searchStr: string, offset: number, limit: number) => {
        let sites: Site[] = [];
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE change_type != 'delete' AND (name_english LIKE ? OR name_marathi LIKE ? OR village LIKE ?)
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?;
        `
        const likeStr = `%${searchStr}%`
        const [results] = await this.db.executeSql(query, [ likeStr, likeStr, likeStr, limit, offset]);
        for (let index = 0; index < results.rows.length; index++) {
            sites.push(results.rows.item(index));
        }
        return sites;
    }

}

